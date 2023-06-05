import { getCookies } from '$std/http/cookie.ts';

import type { Handlers } from '$fresh/server.ts';

import type { Schema } from '../components/Dashboard.tsx';

interface Cookies {
  accessToken?: string;
}

export interface Data {
  pack: Schema.Pack;
  packTitle: string;
  packImage?: File;
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const headers = new Headers();

      const cookies = getCookies(req.headers) as Cookies;

      const _endpoint = Deno.env.get('API_ENDPOINT');

      if (!cookies.accessToken) {
        throw new Error('Access token not defined');
      }

      const _data = await req.json() as Data; // TODO

      headers.set('location', `/`);

      return new Response(null, {
        status: 303, // see other redirect
        headers,
      });
    } catch (err) {
      return new Response(err?.message, {
        status: 403,
        statusText: 'Forbidden',
      });
    }
  },
};
