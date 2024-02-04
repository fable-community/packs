import { Handlers, type PageProps } from '$fresh/server.ts';

import NavBar from '~/components/NavBar.tsx';

import Maintenance from '~/routes/_503.tsx';

import { i18nSSR } from '~/utils/i18n.ts';

import type { Pack } from '~/utils/types.ts';

interface BrowseData {
  maintenance: boolean;
  packs: Pack[];
}

const defaultImage =
  'https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg';

export const handler: Handlers = {
  async GET(req, ctx) {
    const maintenance = Deno.env.get('MAINTENANCE') === '1';

    if (maintenance) {
      return ctx.render({ maintenance: true });
    }

    const data = { packs: {} } as BrowseData;

    const endpoint = Deno.env.get('API_ENDPOINT');

    if (endpoint) {
      const response = await fetch(`${endpoint}/popular`, {
        method: 'GET',
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

    return ctx.render(data);
  },
};

export default ({ data }: PageProps<BrowseData>) => {
  if (data.maintenance) {
    return <Maintenance />;
  }

  return (
    <div className='flex flex-col grow w-full my-[2rem] gap-[5vh]'>
      <div class={'flex w-full mx-[2rem]'}>
        <NavBar active='browse' />
      </div>

      <div class={'flex grow justify-center items-center mx-[2rem]'}>
        <div
          class={'flex flex-col items-center w-full gap-8 max-w-[800px]'}
        >
          {data.packs.map((pack, index) => (
            <div
              class={'flex w-full gap-3 p-8 hover:bg-embed2 rounded-lg cursor-pointer'}
            >
              <i class={'text-[4rem] font-bold'}>{index + 1}</i>

              <img
                src={pack.manifest.image ?? defaultImage}
                class={'w-[92px] min-w-[92px] h-[92px] object-cover object-center rounded-[14px]'}
              />

              <div class={'flex flex-col justify-center m-4'}>
                <i class={'font-bold text-[0.95rem]'}>
                  {pack.manifest.title ?? pack.manifest.id}
                </i>
                <p class={'text-[0.85rem]'}>{pack.manifest.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
