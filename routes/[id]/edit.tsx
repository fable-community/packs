import { Handlers, type PageProps } from '$fresh/server.ts';

import { getAccessToken } from '~/utils/oauth.ts';

import Maintenance from '~/routes/_503.tsx';

import { i18nSSR } from '~/utils/i18n.ts';

import Login from '~/components/Login.tsx';

import Manage from '~/islands/Manage.tsx';

import type { Pack, User } from '~/utils/types.ts';

export interface EditData {
  user?: User;
  maintenance: boolean;
  pack: Pack;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const maintenance = Deno.env.get('MAINTENANCE') === '1';

    if (maintenance) {
      return ctx.render({ maintenance: true });
    }

    const packId = ctx.params.id;

    const data = {} as EditData;

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

    if (data.user && endpoint && packId) {
      const response = await fetch(`${endpoint}/pack/${packId}`, {
        method: 'GET',
        headers: { 'authorization': `Bearer ${accessToken}` },
      });

      data.pack = await response.json() as Pack;
    }

    // deno-lint-ignore no-explicit-any
    const err = (data.pack as any)?.error;

    if (data.user && err === 'Not Found') {
      return ctx.renderNotFound();
    } else if (err) {
      throw new Error(err);
    }

    i18nSSR(req.headers.get('Accept-Language') ?? '');

    return ctx.render(data);
  },
};

export default ({ data }: PageProps<EditData>) => {
  if (data.maintenance) {
    return <Maintenance />;
  } else if (!data.user) {
    return <Login />;
  }

  const user = data.user;

  return <Manage user={user} new={false} pack={data.pack} />;
};
