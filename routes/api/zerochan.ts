import nanoid from '../../utils/nanoid.ts';

import type { Handlers } from '$fresh/server.ts';

const endpoint = 'https://www.zerochan.net/api';

export interface Data {
  query: string[];
  after?: number;
}

export interface Image {
  id: number;
  width: number;
  height: number;
  thumbnail: string;
  source: string;
  tag: string;
  tags: string[];
}

export const handler: Handlers = {
  async POST(req): Promise<Response> {
    const data: Data = await req.json();

    const limit = 10;
    const after = data.after || 0;

    const res = await fetch(
      `${endpoint}/${
        data.query.join(',')
      }?l=${limit}&p=${after}&d=portrait&json`,
      {
        headers: {
          'User-Agent': `Fable Discord Bot Packs Integration - user${nanoid()}`,
        },
      },
    );

    const images: Image[] = await res.json();

    return new Response(JSON.stringify(images));
  },
};
