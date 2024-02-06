import { Handlers, type PageProps } from '$fresh/server.ts';

import { fetchUser } from '~/utils/oauth.ts';

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

    const { user, accessToken, setCookie } = await fetchUser(req);

    data.user = user;

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
      console.error(err);
      throw new Error(err);
    }

    i18nSSR(req.headers.get('Accept-Language') ?? '');

    const resp = await ctx.render(data);

    if (setCookie) {
      resp.headers.set('set-cookie', setCookie);
    }

    return resp;
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
