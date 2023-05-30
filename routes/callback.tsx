// deno-lint-ignore-file camelcase

import { Handlers } from '$fresh/server.ts';

import { deleteCookie, getCookies, setCookie } from '$std/http/cookie.ts';

interface DiscordToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  scope: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);

    const cookies = getCookies(req.headers);

    const headers = new Headers(req.headers);

    const clientId = Deno.env.get('CLIENT_ID');
    const clientSecret = Deno.env.get('CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return Response.error();
    }

    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');

    if (code && state === cookies.state) {
      const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: `${url.origin}/callback`,
        code,
      });

      const response = await fetch('https://discord.com/api/oauth2/token', {
        body,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        method: 'POST',
      });

      const token = await response.json() as DiscordToken;

      if (response.status === 200 && 'access_token' in token) {
        setCookie(headers, {
          secure: true,
          name: 'accessToken',
          value: token.access_token,
          maxAge: token.expires_in,
          sameSite: 'Lax',
          domain: url.hostname,
          path: '/',
        });

        setCookie(headers, {
          secure: true,
          name: 'refreshToken',
          value: token.refresh_token,
          maxAge: 31_536_000, // one year
          sameSite: 'Lax',
          domain: url.hostname,
          path: '/',
        });

        deleteCookie(headers, 'state', {
          domain: url.hostname,
          path: '/',
        });
      }
    }

    headers.set('location', '/');

    return new Response(null, {
      status: 303, // see other redirect
      headers,
    });
  },
};
