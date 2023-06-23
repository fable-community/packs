import { Handlers, type PageProps } from '$fresh/server.ts';

import { getCookies } from '$std/http/cookie.ts';

import Login from '../components/Login.tsx';

import Dashboard, {
  type DashboardData,
  type User,
} from '../components/Dashboard.tsx';

import type { Pack } from '../utils/types.ts';

interface Cookies {
  accessToken?: string;
  refreshToken?: string;
}

export const production = !!Deno.env.get('DENO_DEPLOYMENT_ID');

export const handler: Handlers = {
  async GET(req, ctx) {
    const packId = ctx.params.id;

    const data = { packs: {} } as DashboardData;

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

      data.user = await response.json() as User;
    } else if (cookies.refreshToken) {
      // TODO support refreshing the access token #2
    }

    if (data.user && endpoint) {
      if (production) {
        const response = await fetch(`${endpoint}/${data.user.id}`, {
          method: 'GET',
        });

        const packs = (await response.json() as { data: Pack[] }).data;

        data.packs = packs.reduce((acc, pack) => {
          return { ...acc, [pack.manifest.id]: pack };
        }, {});
      } else {
        const { default: mock } = await import('../../mock.json', {
          assert: { type: 'json' },
        });

        const packs = [{
          servers: 200,
          approved: true,
          owner: data.user.id,
          manifest: { ...mock },
        }] as unknown as Pack[];

        data.packs = packs.reduce((acc, pack) => {
          return { ...acc, [pack.manifest.id]: pack };
        }, {});
      }
    }

    // if the selected pack is not found in the user's packs
    if (packId && !(packId in data.packs)) {
      return ctx.renderNotFound();
    }

    return ctx.render(data);
  },
};

export default (props: PageProps<DashboardData>) => {
  return props.data.user ? <Dashboard {...props} /> : <Login />;
};
