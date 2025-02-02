import { Handlers, type PageProps } from '$fresh/server.ts';

import NavBar from '~/components/NavBar.tsx';
import Avatar from '~/components/Avatar.tsx';
import Browse from '~/islands/Browse.tsx';

import { DiscordButton } from '~/components/Login.tsx';

import Maintenance from '~/routes/_503.tsx';

import { fetchUser } from '~/utils/oauth.ts';
import { i18nSSR } from '~/utils/i18n.ts';

import type { PackWithCount, User } from '~/utils/types.ts';

interface BrowseData {
  user?: User;
  maintenance?: boolean;
  popularPacks: PackWithCount[];
  updatedPacks: PackWithCount[];
}

async function fetchPopularPacks() {
  let packs: PackWithCount[] = [];

  const endpoint = Deno.env.get('API_ENDPOINT');

  if (endpoint) {
    const response = await fetch(`${endpoint}/popular?limit=10`, {
      method: 'GET',
    });

    const { packs: fetchedPacks } = (await response.json()) as {
      packs: PackWithCount[];
      length: number;
      offset: number;
      limit: number;
    };

    packs = fetchedPacks.filter(({ servers }) => (servers ?? 0) >= 3);
  }

  return packs;
}

async function fetchLastUpdatedPacks() {
  let packs: PackWithCount[] = [];

  const endpoint = Deno.env.get('API_ENDPOINT');

  if (endpoint) {
    const response = await fetch(`${endpoint}/updated?limit=10`, {
      method: 'GET',
    });

    const { packs: fetchedPacks } = (await response.json()) as {
      packs: PackWithCount[];
      length: number;
      offset: number;
      limit: number;
    };

    packs = fetchedPacks;
  }

  return packs;
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
      popularPacks,
      updatedPacks,
    ] = await Promise.all(
      [
        fetchUser(req),
        fetchPopularPacks(),
        fetchLastUpdatedPacks(),
      ],
    );

    data.user = user;
    data.popularPacks = popularPacks;
    data.updatedPacks = updatedPacks;

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

      <Browse
        popularPacks={data.popularPacks}
        updatedPacks={data.updatedPacks}
      />
    </div>
  );
};
