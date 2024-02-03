import { Handlers, type PageProps } from '$fresh/server.ts';

import { getAccessToken } from '~/utils/oauth.ts';

import Login from '~/components/Login.tsx';

import Maintenance from '~/routes/_503.tsx';

import Dashboard, { type DashboardData } from '~/components/Dashboard.tsx';

import { i18nSSR } from '~/utils/i18n.ts';

import type { Pack, User } from '~/utils/types.ts';

export const production = !!Deno.env.get('DENO_DEPLOYMENT_ID');

export const handler: Handlers = {
  async GET(req, ctx) {
    const maintenance = Deno.env.get('MAINTENANCE') === '1';

    if (maintenance) {
      return ctx.render({ maintenance: true });
    }

    const packId = ctx.params.id;

    const data = { packs: {} } as DashboardData;

    const endpoint = Deno.env.get('API_ENDPOINT');

    const accessToken = getAccessToken(req);

    if (accessToken) {
      const response = await fetch('https://discord.com/api/users/@me', {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${accessToken}`,
        },
      })
        .catch(console.error);

      if (response?.ok && response?.status === 200) {
        data.user = await response.json() as User;
      }
    }

    if (data.user && endpoint) {
      const response = await fetch(`${endpoint}/user`, {
        method: 'GET',
        headers: { 'authorization': `Bearer ${accessToken}` },
      });

      const packs = (await response.json() as { data: Pack[] }).data;

      data.packs = packs.reduce((acc, pack) => {
        return { ...acc, [pack.manifest.id]: pack };
      }, {});
    }

    // if the selected pack is not found in the user's packs
    if (packId && !(packId in data.packs)) {
      return ctx.renderNotFound();
    }

    i18nSSR(req.headers.get('Accept-Language') ?? '');

    return ctx.render(data);
  },
};

export default (props: PageProps<DashboardData>) => {
  if (props.data.maintenance) {
    return <Maintenance />;
  }
  return props.data.user ? <Dashboard {...props} /> : <Login />;
};
