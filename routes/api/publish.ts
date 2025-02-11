// deno-lint-ignore-file no-non-null-assertion

import { deserialize } from 'bson';

import { getAccessToken } from '~/utils/oauth.ts';

import nanoid from '~/utils/nanoid.ts';

import { getRating } from '~/utils/rating.ts';

import { getWebhook } from '~/utils/embeds.ts';

import { IImageInput, TEN_MB } from '~/components/ImageInput.tsx';

import { Character, CharacterRole, Media, Pack } from '~/utils/types.ts';

import { PutObjectCommand, S3Client } from 'aws-sdk-s3';

import { captureException } from '~/utils/sentry.ts';

import type { Handlers } from '$fresh/server.ts';

interface Credentials {
  apiUrl: string;
  authorizationToken: string;
  downloadUrl: string;
}

interface Upload {
  uploadUrl: string;
  authorizationToken: string;
}

export interface Data {
  old: Pack['manifest'];
  title?: string;
  private?: boolean;
  nsfw?: boolean;
  author?: string;
  description?: string;
  webhookUrl?: string;
  image?: IImageInput;
  characters?: Character[];
  media?: Media[];
  maintainers?: string[];
  conflicts?: string[];
  new?: boolean;
  username?: string;
}

const publicWebhookUrl = Deno.env.get('PUBLIC_DISCORD_WEBHOOK_URL');

const S3 = new S3Client({
  region: 'auto',
  endpoint: Deno.env.get('S3_ENDPOINT')!,
  credentials: {
    accessKeyId: Deno.env.get('S3_KEY_ID')!,
    secretAccessKey: Deno.env.get('S3_ACCESS_KEY')!,
  },
});

const uploadImage = async ({ file }: {
  file: NonNullable<IImageInput['file']>;
}): Promise<string | undefined> => {
  if (file.size > TEN_MB) {
    console.error('image is over 10 mb');
    return '';
  }

  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9]/g, '-');

  const fileName = `${nanoid(8)}-${sanitizedFileName}`;

  const bucketName = Deno.env.get('S3_BUCKET_NAME');

  // const hash = await crypto.subtle.digest('SHA-1', file.data.buffer);

  // const hashArray = Array.from(new Uint8Array(hash));

  // const sha1HashHex = hashArray
  //   .map((b) => b.toString(16).padStart(2, '0'))
  //   .join(''); // convert bytes to hex string

  try {
    const command = new PutObjectCommand({
      Key: fileName,
      Bucket: bucketName,
      Body: file.data.buffer,
      CacheControl: 'max-age=259200', // 3 days
      ContentLength: file.size,
      ContentType: file.type,
      // ChecksumSHA1: sha1HashHex,
      ACL: 'public-read',
    });

    const _ = await S3.send(command);

    const url = `${Deno.env.get('S3_PUBLIC_ENDPOINT')}/${fileName}`;

    // console.log('File uploaded successfully:', _);
    console.log('uploaded image', url);

    return url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const handler: Handlers = {
  async POST(req): Promise<Response> {
    try {
      const endpoint = Deno.env.get('API_ENDPOINT');

      const accessToken = getAccessToken(req);

      if (!accessToken) {
        throw new Error('Access token not defined');
      }

      const data = deserialize(
        new Uint8Array(await req.arrayBuffer()),
      ) as Data;

      const pack = data.old;

      const old = JSON.stringify(pack);

      if (typeof data.private === 'boolean') {
        pack.private = data.private;
      }

      if (typeof data.nsfw === 'boolean') {
        pack.nsfw = data.nsfw;
      }

      if (typeof data.title === 'string') {
        pack.title = data.title.trim();
      }

      if (typeof data.author === 'string') {
        pack.author = data.author.trim();
      }

      if (typeof data.description === 'string') {
        pack.description = data.description.trim();
      }

      if (typeof data.webhookUrl === 'string') {
        pack.webhookUrl = data.webhookUrl;
      }

      if (data.image?.file) {
        pack.image = await uploadImage({
          file: data.image.file,
        });
      } else if (data.image?.url) {
        pack.image = data.image.url;
      }

      pack.media = {};
      pack.characters = {};

      pack.maintainers = data.maintainers ?? [];
      pack.conflicts = data.conflicts ?? [];

      // sort media by popularity
      data.media
        ?.sort((a, b) => {
          return (b.popularity ?? 0) - (a.popularity ?? 0);
        });

      // sort media by role then popularity
      data.characters
        ?.sort((a, b) => {
          if (
            a.media?.length && b?.media?.length &&
            a.media[0].role !== b.media[0].role
          ) {
            const v = {
              [CharacterRole.Main]: 0,
              [CharacterRole.Supporting]: 1,
              [CharacterRole.Background]: 2,
            };

            return v[a.media[0].role] - v[b.media[0].role];
          } else {
            let aRating: number;
            let bRating: number;

            if (a.popularity) {
              aRating = getRating({
                popularity: a.popularity ?? 0,
              });
            } else if (a.media?.[0]?.mediaId) {
              const media = data.media?.find(({ id }) =>
                a.media?.[0]?.mediaId === id
              );

              if (media) {
                aRating = getRating({
                  popularity: media.popularity ?? 0,
                  role: a.media?.[0]?.role,
                });
              } else {
                aRating = 1;
              }
            } else {
              aRating = 1;
            }

            if (b.popularity) {
              bRating = getRating({
                popularity: b.popularity ?? 0,
              });
            } else if (b.media?.length) {
              const media = data.media?.find(({ id }) =>
                b.media?.[0]?.mediaId === id
              );

              if (media) {
                bRating = getRating({
                  popularity: media.popularity ?? 0,
                  role: b.media?.[0]?.role,
                });
              } else {
                bRating = 1;
              }
            } else {
              bRating = 1;
            }

            return bRating - aRating;
          }
        });

      pack.media!.new = await Promise.all(
        data.media?.map(async (media) => {
          const url = media.images?.[0]?.file?.size
            ? await uploadImage({ file: media.images[0].file })
            : media.images?.[0]?.url
            ? media.images[0].url
            : undefined;

          const characters: {
            role: CharacterRole;
            characterId: string;
          }[] = [];

          // discover and link media to the characters that reference it
          data.characters?.forEach((character) => {
            const find = character.media
              ?.find(({ mediaId }) => media.id === mediaId);

            if (find) {
              characters!.push({
                characterId: character.id,
                role: find.role,
              });
            }
          });

          let images: { url: string }[];

          if (url?.length) {
            images = [{ url }];
          } else if (media.images?.[0]?.url) {
            images = media.images?.map(({ url }) => ({ url }));
          } else {
            images = [];
          }

          return {
            ...media,
            characters,
            images,
          };
        }) ?? [],
      );

      pack.characters!.new = await Promise.all(
        data.characters?.map(async (char) => {
          const url = char.images?.[0]?.file?.size
            ? await uploadImage({ file: char.images[0].file })
            : char.images?.[0]?.url
            ? char.images[0].url
            : undefined;

          let images: { url: string }[];

          if (url?.length) {
            images = [{ url }];
          } else if (char.images?.[0]?.url) {
            images = char.images?.map(({ url }) => ({ url }));
          } else {
            images = [];
          }

          return {
            ...char,
            images,
          };
        }) ?? [],
      );

      // console.log(pack);

      if (endpoint) {
        const response = await fetch(`${endpoint}/publish`, {
          method: 'POST',
          headers: { 'authorization': `Bearer ${accessToken}` },
          body: JSON.stringify(
            {
              manifest: pack,
              accessToken: accessToken,
            }, // filter null values
            (_, value) => {
              if (value !== null) {
                return value;
              }
            },
          ),
        });

        if (response.status !== 201) {
          const { errors } = await response.json();

          return new Response(
            JSON.stringify({
              errors,
              pack: {
                characters: pack.characters?.new?.map(({ id }) => ({ id })),
                media: pack.media?.new?.map(({ id }) => ({ id })),
              },
            }),
            { status: response.status },
          );
        }

        const body = getWebhook({
          pack,
          username: data.username!,
          old: !data.new ? JSON.parse(old) : undefined,
        });

        if (publicWebhookUrl && !pack.private && !pack.nsfw) {
          fetch(publicWebhookUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
          }).catch(console.error);
        }

        if (pack.webhookUrl) {
          fetch(pack.webhookUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
          }).catch(console.error);
        }

        return new Response(pack.id);
      } else {
        throw new Error('Fable endpoint not defined');
      }
      // deno-lint-ignore no-explicit-any
    } catch (err: Error | any) {
      console.error(err);
      captureException(err);

      return new Response(err?.message, { status: 500 });
    }
  },
};
