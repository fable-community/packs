// deno-lint-ignore-file camelcase

import type { Plugin } from '$fresh/server.ts';

import {
  type Cookie,
  deleteCookie,
  getCookies,
  setCookie,
} from '$std/http/cookie.ts';

import type { User } from '~/utils/types.ts';

export const COOKIE_BASE = {
  secure: true,
  path: '/',
  httpOnly: true,
  // 90 days
  maxAge: 7776000,
  sameSite: 'Lax',
} as Required<Pick<Cookie, 'path' | 'httpOnly' | 'maxAge' | 'sameSite'>>;

interface DiscordToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  scope: string;
}

interface Cookies {
  accessToken?: string;
  refreshToken?: string;
}

export const getAccessToken = (req: Request) => {
  const cookies = getCookies(req.headers) as Cookies;

  return cookies.accessToken;
};

export async function fetchUser(
  req: Request,
): Promise<{
  user?: User;
  accessToken?: string;
  setCookie?: string;
}> {
  let user: User | undefined = undefined;

  const headers = new Headers(req.headers);

  let { accessToken, refreshToken } = getCookies(req.headers) as Cookies;

  const clientId = Deno.env.get('DISCORD_CLIENT_ID');
  const clientSecret = Deno.env.get('DISCORD_CLIENT_SECRET');

  if (!accessToken && refreshToken && clientId && clientSecret) {
    accessToken = await getAndStoreNewToken(
      headers,
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    );
  }

  if (accessToken) {
    const response = await fetch('https://discord.com/api/users/@me', {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${accessToken}`,
      },
    }).catch(console.error);

    if (response?.ok && response?.status === 200) {
      user = await response.json() as User;
    } else {
      // clean up invalid access tokens
      deleteCookie(headers, 'accessToken');
    }
  }

  return {
    user,
    accessToken,
    setCookie: headers.get('set-cookie') || undefined,
  };
}

const getAndStoreNewToken = async (
  headers: Headers,
  params: URLSearchParams,
) => {
  const response = await fetch('https://discord.com/api/oauth2/token', {
    body: params,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  });

  const token = await response.json() as DiscordToken;

  if (response.status === 200 && 'access_token' in token) {
    setCookie(headers, {
      ...COOKIE_BASE,
      name: 'accessToken',
      value: token.access_token,
      maxAge: token.expires_in,
    });

    setCookie(headers, {
      ...COOKIE_BASE,
      name: 'refreshToken',
      value: token.refresh_token,
      maxAge: 31_536_000, // one year
    });
  }

  return token.access_token;
};

export const plugin: Plugin = {
  name: 'oauth',
  routes: [
    {
      path: '/login',
      handler: (req) => {
        const url = new URL(req.url);

        const headers = new Headers();

        const state = crypto.randomUUID();

        const clientId = Deno.env.get('DISCORD_CLIENT_ID');

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
          ...COOKIE_BASE,
          name: 'state',
          value: state,
          maxAge: 10 * 60, // 10 minutes
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
    },
    {
      path: '/callback',
      handler: async (req) => {
        const url = new URL(req.url);

        const cookies = getCookies(req.headers);

        const headers = new Headers(req.headers);

        const clientId = Deno.env.get('DISCORD_CLIENT_ID');
        const clientSecret = Deno.env.get('DISCORD_CLIENT_SECRET');

        if (!clientId || !clientSecret) {
          return Response.error();
        }

        const state = url.searchParams.get('state');
        const code = url.searchParams.get('code');

        if (code && state === cookies.state) {
          await getAndStoreNewToken(
            headers,
            new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: 'authorization_code',
              redirect_uri: `${url.origin}/callback`,
              code,
            }),
          );

          deleteCookie(headers, 'state');
        }

        headers.set('location', '/dashboard');

        return new Response(null, {
          status: 303, // see other redirect
          headers,
        });
      },
    },
    {
      path: '/logout',
      handler: async (req) => {
        const headers = new Headers();

        const clientId = Deno.env.get('DISCORD_CLIENT_ID');
        const clientSecret = Deno.env.get('DISCORD_CLIENT_SECRET');

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
        Object.keys(cookies)
          .forEach((name) => deleteCookie(headers, name));

        headers.set('location', `/`);

        return new Response(null, {
          status: 303, // see other redirect
          headers,
        });
      },
    },
  ],
};
