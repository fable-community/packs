import { Head } from '$fresh/runtime.ts';

import { Handlers, PageProps } from '$fresh/server.ts';

import { getCookies } from '$std/http/cookie.ts';

import Login from '../components/Login.tsx';

import Dashboard from '../components/Dashboard.tsx';

import type { User } from '$fable/src/discord.ts';

import type { Schema } from '$fable/src/types.ts';

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
      const response = await fetch(
        `https://github.com/fable-community/fable-pack-utawarerumono/raw/main/manifest.json`,
      );
      // deno-lint-ignore no-explicit-any
      data.packs = [{ manifest: await response.json() } as any];
    }

    return ctx.render(data);
  },
};

export default ({ data }: PageProps<Data>) => {
  return data.user
    ? <Dashboard user={data.user} packs={data.packs ?? []} />
    : <Login />;
};
