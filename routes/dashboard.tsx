import { Head } from '$fresh/runtime.ts';

import { Handlers, PageProps } from '$fresh/server.ts';

import { getCookies } from '$std/http/cookie.ts';

import Login from '../components/Login.tsx';

import Dashboard from '../components/Dashboard.tsx';

import type { User } from '$fable/src/discord.ts';

import type { Schema } from '$fable/src/types.ts';

import mock from '../tests/mock.json' assert { type: 'json' };

interface Cookies {
  accessToken?: string;
  refreshToken?: string;
}

interface Data {
  user?: User;
  packs?: Schema.Pack[];
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const data: Data = {};

    const cookies = getCookies(req.headers) as Cookies;

    const endpoint = Deno.env.get('API_ENDPOINT');

    const pathname = new URL(req.url).pathname.substring(1);

    if (cookies.accessToken) {
      const response = await fetch('https://discord.com/api/users/@me', {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${cookies.accessToken}`,
        },
      });

      data.user = await response.json() as Data['user'];
    } else if (cookies.refreshToken) {
      // TODO support refreshing the access token
    }

    if (data.user && endpoint) {
      // const response = await fetch(`${endpoint}/${data.user.id}`, {
      //   method: 'GET',
      // });

      // data.packs = (await response.json() as { data: Pack[] }).data;

      // TODO REMOVE DEBUG CODE
      // deno-lint-ignore no-explicit-any
      data.packs = [{ manifest: mock } as any];
    }

    if (
      pathname && !data.packs?.some(({ manifest }) => manifest.id === pathname)
    ) {
      return ctx.renderNotFound();
    }

    return ctx.render(data);
  },
};

export default ({ data }: PageProps<Data>) => {
  return data.user
    ? <Dashboard user={data.user} packs={data.packs ?? []} />
    : <Login />;
};
