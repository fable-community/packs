import { Handlers, type PageProps } from '$fresh/server.ts';

import NavBar from '~/components/NavBar.tsx';
import Avatar from '~/components/Avatar.tsx';

import { DiscordButton } from '~/components/Login.tsx';
import { Approved } from '~/components/Approved.tsx';

import Maintenance from '~/routes/_503.tsx';

import { fetchUser } from '~/utils/oauth.ts';
import { i18n, i18nSSR } from '~/utils/i18n.ts';

import compact from '~/utils/compact.ts';

import IconDownload from 'icons/download.tsx';
import IconCharacter from 'icons/user.tsx';
// import IconMedia from 'icons/photo.tsx';

import type { Pack, PackWithCount, User } from '~/utils/types.ts';

interface BrowseData {
  user?: User;
  maintenance: boolean;
  packs: PackWithCount[];
}

const defaultImage =
  'https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg';

async function fetchPopularPacks() {
  let packs: PackWithCount[] = [];

  const endpoint = Deno.env.get('API_ENDPOINT');

  if (endpoint) {
    const response = await fetch(`${endpoint}/popular`, {
      method: 'GET',
    });

    const { packs: fetchedPacks } = (await response.json()) as {
      packs: PackWithCount[];
      length: number;
      offset: number;
      limit: number;
    };

    packs = fetchedPacks.filter(({ servers }) => servers >= 3);
  }

  return packs;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const maintenance = Deno.env.get('MAINTENANCE') === '1';

    if (maintenance) {
      return ctx.render({ maintenance: true });
    }

    const data = { packs: {} } as BrowseData;

    const [{ user, setCookie }, packs] = await Promise.all([
      fetchUser(req),
      fetchPopularPacks(),
    ]);

    data.user = user;
    data.packs = packs;

    i18nSSR(req.headers.get('Accept-Language') ?? '');

    const resp = await ctx.render(data);

    if (setCookie) {
      resp.headers.set('set-cookie', setCookie);
    }

    return resp;
  },
};

const PackTile = ({ pack, index }: { pack: PackWithCount; index: number }) => {
  return (
    <a
      href={`/${pack.manifest.id}`}
      class={'grid grid-cols-[auto_auto_1fr] w-full gap-8 p-8 hover:bg-embed2 rounded-lg cursor-pointer'}
    >
      <i class={'text-[4rem] w-[4rem] font-bold'}>{index + 1}</i>

      <img
        src={pack.manifest.image ?? defaultImage}
        class={'bg-grey w-[92px] min-w-[92px] h-[92px] object-cover object-center rounded-[14px]'}
      />

      <div class={'flex flex-col gap-1 justify-center'}>
        <i class={'flex flex-row items-center font-bold text-[0.95rem]'}>
          {pack.manifest.title ?? pack.manifest.id}
          {pack.manifest.approved ? <Approved /> : undefined}
        </i>

        {pack.manifest.description
          ? (
            <p
              class={'text-[0.85rem] opacity-80 line-clamp-2 overflow-hidden overflow-ellipsis'}
            >
              {pack.manifest.description}
            </p>
          )
          : undefined}

        <div class={'flex gap-3 text-white opacity-80 mt-3 uppercase'}>
          <div class={'flex gap-1'}>
            <IconDownload class={'w-4 h-4 mt-0.5'} />
            <p>{i18n('packServers', compact(pack.servers))}</p>
          </div>

          <p>
            {
              // deno-lint-ignore prefer-ascii
              `•`
            }
          </p>

          <div class={'flex gap-1'}>
            <IconCharacter class={'w-4 h-4 mt-0.5'} />
            <p>
              {`${pack.manifest.characters ?? 0} ${i18n('characters')}`}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
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

      <div class={'flex grow justify-center items-center mx-[2rem]'}>
        <div
          class={'flex flex-col items-center w-full max-w-[800px] gap-8'}
        >
          {data.packs.map((pack, index) => (
            <PackTile pack={pack} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};
