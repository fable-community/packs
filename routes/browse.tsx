import { Handlers, type PageProps } from '$fresh/server.ts';

import NavBar from '~/components/NavBar.tsx';
import Avatar from '~/components/Avatar.tsx';
import Browse from '~/islands/Browse.tsx';

import { DiscordButton } from '~/components/Login.tsx';

import Maintenance from '~/routes/_503.tsx';

import { fetchUser } from '~/utils/oauth.ts';
import { i18nSSR } from '~/utils/i18n.ts';

import type { User } from '~/utils/types.ts';

interface BrowseData {
  user?: User;
  maintenance?: boolean;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const maintenance = Deno.env.get('MAINTENANCE') === '1';

    if (maintenance) {
      return ctx.render({ maintenance: true });
    }

    const data = { popularPacks: [], updatedPacks: [] } as BrowseData;

    const [
      { user, setCookie },
    ] = await Promise.all(
      [
        fetchUser(req),
      ],
    );

    data.user = user;

    i18nSSR(req.headers.get('Accept-Language') ?? '');

    const resp = await ctx.render(data);

    if (setCookie) {
      resp.headers.set('set-cookie', setCookie);
    }

    return resp;
  },
};

export default ({ data }: PageProps<BrowseData>) => {
  if (data.maintenance) {
    return <Maintenance />;
  }

  const { user } = data;

  return (
    <div className='flex flex-col grow w-full my-[2rem] gap-[5vh]'>
      <div class={'flex mx-[2rem] items-center'}>
        <NavBar active='browse' />
        {user
          ? <Avatar id={user.id} avatar={user.avatar} />
          : <DiscordButton className='h-[32px]' />}
      </div>

      <Browse />
    </div>
  );
};
