import { Handlers, type PageProps } from '$fresh/server.ts';

import { getAccessToken } from '~/utils/oauth.ts';

import Maintenance from '~/routes/_503.tsx';

import { i18nSSR } from '~/utils/i18n.ts';

import Login from '~/components/Login.tsx';

import Manage from '~/islands/Manage.tsx';

import type { User } from '~/utils/types.ts';

export interface NewData {
  user?: User;
  maintenance: boolean;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const maintenance = Deno.env.get('MAINTENANCE') === '1';

    if (maintenance) {
      return ctx.render({ maintenance: true });
    }

    const data = {} as NewData;

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

    i18nSSR(req.headers.get('Accept-Language') ?? '');

    return ctx.render(data);
  },
};

export default ({ data }: PageProps<NewData>) => {
  if (data.maintenance) {
    return <Maintenance />;
  } else if (!data.user) {
    return <Login />;
  }

  const user = data.user;

  return <Manage user={user} new={true} />;
};
