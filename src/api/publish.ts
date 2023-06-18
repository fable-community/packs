// deno-lint-ignore-file no-non-null-assertion

import { encode } from '$std/encoding/base64.ts';

import { getCookies } from '$std/http/cookie.ts';

import { deserialize } from 'bson';

import nanoid from '../utils/nanoid.ts';

import {
  type Character,
  type CharacterRole,
  type Media,
} from '../utils/types.ts';

import type { Handlers } from '$fresh/server.ts';

import type { Schema } from '../components/Dashboard.tsx';

import type { IImageInput } from '../components/ImageInput.tsx';

interface Cookies {
  accessToken?: string;
}

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
  old: Schema.Pack['manifest'];
  title?: string;
  description?: string;
  author?: string;
  image?: IImageInput;
  characters?: Character[];
  media?: Media[];
  maintainers?: string[];
}

const idRegex = /[^-_a-z0-9]+/g;

const b2 = {
  id: Deno.env.get('B2_KEY_ID'),
  bucketId: Deno.env.get('B2_BUCKET_ID'),
  bucketName: Deno.env.get('B2_BUCKET_NAME'),
  key: Deno.env.get('B2_KEY'),
};

const setUpImages = async () => {
  if (!b2.id || !b2.key || !b2.bucketId || !b2.bucketName) {
    return;
  }

  const _credentials = await fetch(
    'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
    { headers: { Authorization: `Basic ${encode(`${b2.id}:${b2.key}`)}` } },
  );

  if (_credentials.status !== 200) {
    console.error('failed to authorize b2');
    return;
  }

  const credentials = await _credentials.json() as Credentials;

  return credentials;
};

const uploadImage = async ({ file, credentials }: {
  file: NonNullable<IImageInput['file']>;
  credentials?: Credentials;
}) => {
  if (!credentials) {
    return '';
  }

  const _upload = await fetch(
    `${credentials.apiUrl}/b2api/v2/b2_get_upload_url`,
    {
      method: 'POST',
      body: JSON.stringify({ bucketId: b2.bucketId }),
      headers: { Authorization: credentials.authorizationToken },
    },
  );

  if (_upload.status !== 200) {
    console.error('failed to generate b2 upload url');
    return '';
  }

  const upload = await _upload.json() as Upload;

  const hash = await crypto.subtle.digest('SHA-1', file.data.buffer);

  const hashArray = Array.from(new Uint8Array(hash));

  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(''); // convert bytes to hex string

  const fileName = nanoid(8);

  const _file = await fetch(
    upload.uploadUrl,
    {
      method: 'POST',
      body: file.data.buffer,
      headers: {
        'Authorization': upload.authorizationToken,
        'Content-Type': file.type,
        'Content-Length': `${file.size}`,
        'X-Bz-File-Name': fileName,
        'X-Bz-Content-Sha1': hashHex,
      },
    },
  );

  if (_file.status !== 200) {
    console.error('failed to generate b2 upload url');
    return '';
  }

  const url = `${credentials.downloadUrl}/file/${b2.bucketName}/${fileName}`;

  console.log(url);

  return url;
};

export const handler: Handlers = {
  async POST(req): Promise<Response> {
    try {
      const cookies = getCookies(req.headers) as Cookies;

      const endpoint = Deno.env.get('API_ENDPOINT');

      if (!cookies.accessToken) {
        throw new Error('Access token not defined');
      }

      const data = deserialize(
        new Uint8Array(await req.arrayBuffer()),
      ) as Data;

      const { old: pack } = data;

      if (data.title) {
        pack.title = data.title;
      }

      if (data.description) {
        pack.description = data.description;
      }

      if (data.author) {
        pack.author = data.author;
      }

      if (!pack.id) {
        const candidate = pack.title?.toLowerCase()?.replace(
          idRegex,
          '',
        );

        if (!candidate || candidate.length < 3) {
          return new Response('cannot create pack id from pack title', {
            status: 400,
          });
        }

        pack.id = candidate;
      }

      const credentials = await setUpImages();

      if (data.image?.file) {
        pack.image = await uploadImage({
          credentials,
          file: data.image.file,
        });
      }

      pack.media ??= {};
      pack.characters ??= {};

      pack.media!.new = await Promise.all(
        data.media?.map(async (media) => {
          const url = media.images?.length && media.images[0].file
            ? await uploadImage({
              file: media.images[0].file,
              credentials,
            })
            : undefined;

          const characters: {
            role: CharacterRole;
            characterId: string;
          }[] = [];

          // discover and link media to the characters that reference it
          pack.characters?.new?.forEach((character) => {
            const find = character.media
              ?.find(({ mediaId }) => media.id === mediaId);

            if (find) {
              characters!.push({
                characterId: character.id,
                role: find.role,
              });
            }
          });

          return {
            ...media,
            characters,
            images: url ? [{ url }] : media.images,
          };
        }) ?? [],
      );

      pack.characters!.new = await Promise.all(
        data.characters?.map(async (char) => {
          const url = char.images?.length && char.images[0].file
            ? await uploadImage({
              file: char.images[0].file,
              credentials,
            })
            : undefined;

          return {
            ...char,
            images: url ? [{ url }] : char.images,
          };
        }) ?? [],
      );

      pack.maintainers = data.maintainers ?? [];

      //
      // console.log(pack);

      if (endpoint) {
        const response = await fetch(`${endpoint}/publish`, {
          method: 'POST',
          body: JSON.stringify(
            {
              accessToken: cookies.accessToken,
              manifest: pack,
            }, // filter null values
            (_, value) => {
              if (value !== null) {
                return value;
              }
            },
          ),
        });

        if (response.status !== 200) {
          return response;
        }

        return new Response(pack.id);
      } else {
        throw new Error('Fable endpoint not defined');
      }
    } catch (err) {
      console.error(err);

      return new Response(err?.message, {
        status: 500,
      });
    }
  },
};
