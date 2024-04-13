import { Handlers, type PageProps } from '$fresh/server.ts';

import { fetchUser } from '~/utils/oauth.ts';

import Maintenance from '~/routes/_503.tsx';

import { i18nSSR } from '~/utils/i18n.ts';

import Login from '~/components/Login.tsx';

import New from '~/islands/New.tsx';

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

    const { user, setCookie } = await fetchUser(req);

    data.user = user;

    i18nSSR(req.headers.get('Accept-Language') ?? '');

    const resp = await ctx.render(data);

    if (setCookie) {
      resp.headers.set('set-cookie', setCookie);
    }

    return resp;
  },
};

export default ({ data }: PageProps<NewData>) => {
  if (data.maintenance) {
    return <Maintenance />;
  } else if (!data.user) {
    return <Login />;
  }

  return <New user={data.user} />;
};
