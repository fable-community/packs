import { useSignal } from '@preact/signals';

import { Approved } from '~/islands/Approved.tsx';

import { i18n } from '~/utils/i18n.ts';

import compact from '~/utils/compact.ts';

import IconDownload from 'icons/download.tsx';
import IconCharacter from 'icons/user.tsx';

import type { PackWithCount } from '~/utils/types.ts';

interface Props {
  popularPacks: PackWithCount[];
  updatedPacks: PackWithCount[];
}

const defaultImage =
  'https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg';

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
          {pack.servers
            ? (
              <>
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
              </>
            )
            : undefined}

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

export default ({ popularPacks, updatedPacks }: Props) => {
  const currTab = useSignal<'popular' | 'updated'>('popular');

  return (
    <div class={'flex grow justify-center items-center mx-[2rem]'}>
      <div
        class={'flex flex-col items-center w-full max-w-[800px] gap-8'}
      >
        <div class='flex w-full mb-4 rounded-lg overflow-hidden'>
          <div
            onClick={() => currTab.value = 'popular'}
            class={`flex-1 py-2 text-center font-bold cursor-pointer hover:bg-highlight transition-colors ${
              currTab.value === 'popular'
                ? 'bg-embed pointer-events-none'
                : 'bg-embed2'
            }`}
          >
            Popular
          </div>
          <div
            onClick={() => currTab.value = 'updated'}
            class={`flex-1 py-2 text-center font-bold cursor-pointer hover:bg-highlight transition-colors ${
              currTab.value === 'updated'
                ? 'bg-embed pointer-events-none'
                : 'bg-embed2'
            }`}
          >
            Recently Updated
          </div>
        </div>

        {currTab.value === 'popular'
          ? popularPacks.map((pack, index) => (
            <PackTile pack={pack} index={index} />
          ))
          : updatedPacks.map((pack, index) => (
            <PackTile pack={pack} index={index} />
          ))}
      </div>
    </div>
  );
};
