import type { PackWithCount } from '~/utils/types.ts';

import type { Handlers } from '$fresh/server.ts';

const endpoint = Deno.env.get('API_ENDPOINT');

export const handler: Handlers = {
  async GET(): Promise<Response> {
    let packs: PackWithCount[] = [];

    if (endpoint) {
      const response = await fetch(
        `${endpoint}/popular?limit=10`,
        { method: 'GET' },
      );

      const { packs: fetchedPacks } = (await response.json()) as {
        packs: PackWithCount[];
        length: number;
        offset: number;
        limit: number;
      };

      packs = fetchedPacks.filter(({ servers }) => (servers ?? 0) >= 3);
    }

    return new Response(JSON.stringify({ packs }), {
      headers: { 'content-type': 'application/json' },
    });
  },
};
