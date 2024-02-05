import { Handlers, type PageProps } from '$fresh/server.ts';

import { fetchUser } from '~/utils/oauth.ts';

import Card from '~/components/Card.tsx';
import Avatar from '~/components/Avatar.tsx';
import NavBar from '~/components/NavBar.tsx';
import Login from '~/components/Login.tsx';

import Maintenance from '~/routes/_503.tsx';

import { i18nSSR } from '~/utils/i18n.ts';

import IconPlus from 'icons/plus.tsx';

import type { Pack, User } from '~/utils/types.ts';

interface DashboardData {
  user?: User;
  maintenance: boolean;
  packs: Pack[];
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const maintenance = Deno.env.get('MAINTENANCE') === '1';

    if (maintenance) {
      return ctx.render({ maintenance: true });
    }

    const data = { packs: {} } as DashboardData;

    const endpoint = Deno.env.get('API_ENDPOINT');

    const { user, accessToken, headers } = await fetchUser(req);

    data.user = user;

    if (data.user && endpoint) {
      const response = await fetch(`${endpoint}/user`, {
        method: 'GET',
        headers: { 'authorization': `Bearer ${accessToken}` },
      });

      // TODO impl loading all packs from the response pagination
      const { packs } = (await response.json()) as {
        packs: Pack[];
        length: number;
        offset: number;
        limit: number;
      };

      data.packs = packs;
    }

    i18nSSR(req.headers.get('Accept-Language') ?? '');

    return ctx.render(data, { headers });
  },
};

export default ({ data }: PageProps<DashboardData>) => {
  if (data.maintenance) {
    return <Maintenance />;
  } else if (!data.user) {
    return <Login />;
  }

  const { user } = data;

  return (
    <div className='flex flex-col w-full grow my-[2rem] gap-[5vh]'>
      <div class={'flex mx-[2rem] items-center'}>
        <NavBar active='create' />
        <Avatar id={user.id} avatar={user.avatar} />
      </div>

      <div class={'flex grow justify-center items-center mx-[2rem]'}>
        <div
          class={'flex flex-wrap justify-center w-full gap-8 '}
        >
          {data.packs.map((pack) => (
            <Card
              key={pack.manifest.id}
              pack={pack}
            />
          ))}

          <a
            href={`/new`}
            class={'flex items-center justify-center w-[128px] min-h-[32px] rounded-xl border-2 px-[16px] py-[24px] border-dashed border-grey hover:translate-y-[-8px] transition-all duration-150'}
          >
            <IconPlus class={'w-[32px] h-auto text-grey'} />
          </a>
        </div>
      </div>
    </div>
  );
};
