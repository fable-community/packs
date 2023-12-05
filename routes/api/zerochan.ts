import nanoid from '../../utils/nanoid.ts';

import type { Handlers } from '$fresh/server.ts';

const endpoint = 'https://www.zerochan.net';

export interface Data {
  query: string;
  // after?: number;
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
    const after = 0;

    const url = `${endpoint}/${
      encodeURIComponent(data.query)
    }?l=${limit}&p=${after}&d=portrait&json`;

    console.log(url);

    const res = await fetch(url, {
      headers: {
        'User-Agent': `Fable Discord Bot Packs Integration - user${nanoid()}`,
      },
    });

    if (res.status === 200) {
      const { items: images }: { items: Image[] } = await res.json();

      return new Response(JSON.stringify(images));
    }

    return new Response(undefined, {
      status: res.status,
      statusText: res.statusText,
    });
  },
};
