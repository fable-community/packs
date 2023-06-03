// deno-lint-ignore-file camelcase

import { Handlers } from '$fresh/server.ts';

import { getCookies } from '$std/http/cookie.ts';

interface Data {
  pack: string;
  pack_title: string;
  pack_image?: File;
}

interface Cookies {
  accessToken?: string;
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

      const formData = await req.formData();

      for (const [key, value] of formData.entries()) {
        console.log(`${key}, ${value}`);
      }

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
