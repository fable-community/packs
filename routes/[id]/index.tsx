import { Handlers, type PageProps } from '$fresh/server.ts';

import View from '~/components/View.tsx';

import { getAccessToken } from '~/utils/oauth.ts';

import IconHome from 'icons/arrow-left.tsx';

import Maintenance from '~/routes/_503.tsx';

import { i18nSSR } from '~/utils/i18n.ts';

import type { Pack } from '~/utils/types.ts';

export interface ViewData {
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

    const data = {} as ViewData;

    const endpoint = Deno.env.get('API_ENDPOINT');

    const accessToken = getAccessToken(req);

    if (endpoint && packId) {
      const response = await fetch(`${endpoint}/pack/${packId}`, {
        method: 'GET',
        headers: accessToken
          ? { 'authorization': `Bearer ${accessToken}` }
          : undefined,
      });

      console.log(response.status, response.statusText);

      data.pack = await response.json() as Pack;
    }

    // deno-lint-ignore no-explicit-any
    const err = (data.pack as any)?.error;

    if (err === 'Not Found' || err === 'Forbidden') {
      return ctx.renderNotFound();
    } else if (err || !data.pack || !data.pack.manifest) {
      console.error(err);
      throw new Error(err);
    }

    i18nSSR(req.headers.get('Accept-Language') ?? '');

    return ctx.render(data);
  },
};

export default ({ data }: PageProps<ViewData>) => {
  if (data.maintenance) {
    return <Maintenance />;
  }

  return (
    <div
      class={'flex fixed top-0 left-0 w-full h-full bg-embed overflow-x-hidden overflow-y-auto'}
    >
      <div class={'flex flex-col m-4 gap-8 w-full h-full'}>
        <div class={'flex items-center gap-4 w-full'}>
          <a href={'/browse'}>
            <IconHome class={'w-[28px] h-[28px] cursor-pointer'} />
          </a>
        </div>

        <View pack={data.pack} />
      </div>
    </div>
  );
};
