// deno-lint-ignore-file camelcase

import { Handlers } from '$fresh/server.ts';

import { getCookies } from '$std/http/cookie.ts';

interface Data {
  pack: string;
  pack_title: string;
}

interface Cookies {
  accessToken?: string;
}

export const handler: Handlers = {
  async POST(req) {
    const headers = new Headers();

    const body = await req.text();

    const cookies = getCookies(req.headers) as Cookies;

    // const endpoint = Deno.env.get('API_ENDPOINT');

    if (!cookies.accessToken) {
      return Response.error();
    }

    const data = body.split('&')
      .map((entry) => {
        const [key, value] = entry.split('=');

        return [
          decodeURIComponent(key).replace(/\+/g, ' '),
          decodeURIComponent(value).replace(/\+/g, ' '),
        ];
      })
      .reduce((accumulator, [key, value]) => {
        return { ...accumulator, [key]: value };
      }, {}) as Data;

    console.log(data);

    headers.set('location', `/`);

    return new Response(null, {
      status: 303, // see other redirect
      headers,
    });
  },
};
