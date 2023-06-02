import { Handlers, type PageProps } from '$fresh/server.ts';

import { getCookies } from '$std/http/cookie.ts';

import Login from '../components/Login.tsx';

import Dashboard, { type DashboardData } from '../components/Dashboard.tsx';

// TODO REMOVE DEBUG CODE
import mock from '../../tests/mock.json' assert { type: 'json' };

interface Cookies {
  accessToken?: string;
  refreshToken?: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const data: DashboardData = {};

    const selectedPackId = ctx.params.id;

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

      data.user = await response.json() as DashboardData['user'];
    } else if (cookies.refreshToken) {
      // TODO support refreshing the access token
    }

    if (data.user && endpoint) {
      // const response = await fetch(`${endpoint}/${data.user.id}`, {
      //   method: 'GET',
      // });

      // data.packs = (await response.json() as { data: DashboardData['packs'] }).data;

      // TODO REMOVE DEBUG CODE
      // deno-lint-ignore no-explicit-any
      data.packs = [{ manifest: mock } as any];
    }

    if (
      // if the selected pack is not found in the user's packs
      selectedPackId &&
      !data.packs?.some(({ manifest }) => manifest.id === selectedPackId)
    ) {
      return ctx.renderNotFound();
    }

    return ctx.render(data);
  },
};

export default (props: PageProps<DashboardData>) => {
  return props.data.user ? <Dashboard {...props} /> : <Login />;
};
