import { Handlers } from '$fresh/server.ts';

import { setCookie } from '$std/http/cookie.ts';

import nanoid from '../utils/nanoid.ts';

export const handler: Handlers = {
  POST(req) {
    const url = new URL(req.url);

    const headers = new Headers();

    const state = nanoid();

    const clientId = Deno.env.get('CLIENT_ID');

    if (Deno.env.get('CORS') !== url.origin) {
      return new Response(undefined, {
        status: 403,
        statusText: 'Forbidden',
      });
    }

    if (!clientId) {
      return Response.error();
    }

    const query = new URLSearchParams({
      scope: 'identify',
      client_id: clientId,
      response_type: 'code',
      redirect_uri: `${url.origin}/callback`,
      state,
    }).toString();

    setCookie(headers, {
      secure: true,
      name: 'state',
      value: state,
      maxAge: 1000 * 60 * 5,
      sameSite: 'Lax',
      domain: url.hostname,
      path: '/',
    });

    headers.set(
      'location',
      `https://discord.com/oauth2/authorize?${query}`,
    );

    return new Response(null, {
      status: 303, // see other redirect
      headers,
    });
  },
};
