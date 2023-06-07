// deno-lint-ignore-file no-non-null-assertion

import { encode } from '$std/encoding/base64.ts';

import { getCookies } from '$std/http/cookie.ts';

import { deserialize } from 'bson';

import nanoid from '../utils/nanoid.ts';

import {
  type DisaggregatedCharacter,
  type DisaggregatedMedia,
  MediaType,
} from 'fable/src/types.ts';

import type { Handlers } from '$fresh/server.ts';

import type { Schema } from '../components/Dashboard.tsx';

import type { Editable } from '../components/Media.tsx';

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
  pack: Schema.Pack['manifest'];
  packTitle?: string;
  packImage?: IImageInput;
  characters?: Editable[];
  media?: Editable[];
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
  async POST(req) {
    try {
      const headers = new Headers();

      const cookies = getCookies(req.headers) as Cookies;

      const endpoint = Deno.env.get('API_ENDPOINT');

      if (!cookies.accessToken) {
        throw new Error('Access token not defined');
      }

      const data = deserialize(
        new Uint8Array(await req.arrayBuffer()),
      ) as Data;

      const { pack, packTitle, packImage } = data;

      if (packTitle) {
        pack.title = packTitle;
      }

      if (!pack.id) {
        const candidate = pack.title?.toLowerCase()?.replace(
          idRegex,
          '',
        );

        if (!candidate || candidate.length <= 2) {
          return new Response('could\'nt create a pack id from pack title', {
            status: 400,
          });
        }

        pack.id = candidate;
      }

      const credentials = await setUpImages();

      if (packImage?.file) {
        pack.image = await uploadImage({
          credentials,
          file: packImage.file,
        });
      }

      //

      pack.media ??= {};
      pack.media.new ??= [];
      pack.media.conflicts ??= [];

      pack.characters ??= {};
      pack.characters.new ??= [];
      pack.characters.conflicts ??= [];

      //

      await Promise.all(
        data.media?.map(async (media) => {
          let item: DisaggregatedMedia;

          if (!media.id || !media.title) {
            return;
          }

          const index = pack.media!.new!.findIndex(({ id }) => media.id === id);

          if (Number(index) > -1) {
            item = pack.media!.new![index];
          } else {
            item = {
              id: media.id,
              type: MediaType.Anime,
              title: {
                english: media.title,
              },
            };

            pack.media!.new!.push(item);
          }

          item.title = {
            english: media.title,
          };

          if (media.description) {
            item.description = media.description;
          }

          if (media.image?.file) {
            const url = await uploadImage({
              credentials,
              file: media.image.file,
            });

            if (Number(item.images?.length) > 0) {
              item.images![0].url = url;
            } else {
              item.images = [{
                url,
              }];
            }
          }
        }) ?? [],
      );

      await Promise.all(
        data.characters?.map(async (char) => {
          let item: DisaggregatedCharacter;

          if (!char.id) {
            return;
          }

          const index = pack.characters!.new!.findIndex(({ id }) =>
            char.id === id
          );

          if (Number(index) > -1) {
            item = pack.characters!.new![index];
          } else {
            item = {
              id: char.id,
              name: {
                english: char.title,
              },
            };

            pack.characters!.new!.push(item);
          }

          item.name = {
            english: char.title,
          };

          if (char.description) {
            item.description = char.description;
          }

          if (char.image?.file) {
            const url = await uploadImage({
              credentials,
              file: char.image.file,
            });

            if (Number(item.images?.length) > 0) {
              item.images![0].url = url;
            } else {
              item.images = [{
                url,
              }];
            }
          }
        }) ?? [],
      );

      //

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
      }

      headers.set('location', `/`);

      return new Response(null, {
        status: 303, // see other redirect
        headers,
      });
    } catch (err) {
      console.error(err);

      return new Response(err?.message, {
        status: 500,
      });
    }
  },
};
