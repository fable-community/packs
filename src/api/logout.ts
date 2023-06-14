import { Handlers } from '$fresh/server.ts';

import { deleteCookie, getCookies } from '$std/http/cookie.ts';

export const handler: Handlers = {
  async POST(req) {
    const url = new URL(req.url);

    const headers = new Headers();

    const clientId = Deno.env.get('CLIENT_ID');
    const clientSecret = Deno.env.get('CLIENT_SECRET');

    if (Deno.env.get('CORS') !== url.origin) {
      return new Response(undefined, {
        status: 403,
        statusText: 'Forbidden',
      });
    }

    if (!clientId || !clientSecret) {
      return Response.error();
    }

    const cookies = getCookies(req.headers);

    // request discord to revoke the access token
    if (cookies.accessToken) {
      const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        token: cookies.accessToken,
      });

      await fetch(
        'https://discord.com/api/oauth2/token/revoke',
        {
          body,
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
        },
      );
    }

    // delete all stored cookies
    Object.keys(cookies).forEach((key) =>
      deleteCookie(headers, key, {
        domain: url.hostname,
        path: '/',
      })
    );

    headers.set('location', `/`);

    return new Response(null, {
      status: 303, // see other redirect
      headers,
    });
  },
};
