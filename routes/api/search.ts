import type { PackWithCount } from '~/utils/types.ts';

import type { Handlers } from '$fresh/server.ts';

const endpoint = Deno.env.get('API_ENDPOINT');

export const handler: Handlers = {
  async GET(req): Promise<Response> {
    let packs: PackWithCount[] = [];

    const url = new URL(req.url);

    const q = url.searchParams.get('q');

    if (endpoint && (q?.length ?? 0 > 0)) {
      const response = await fetch(
        `${endpoint}/search?q=${q}&limit=10`,
        { method: 'GET' },
      );

      const { packs: fetchedPacks } = (await response.json()) as {
        packs: PackWithCount[];
        length: number;
        offset: number;
        limit: number;
      };

      packs = fetchedPacks;
    }

    return new Response(JSON.stringify({ packs }), {
      headers: { 'content-type': 'application/json' },
    });
  },
};
