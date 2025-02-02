import { useSignal } from '@preact/signals';

import PackTile from '~/components/PackTile.tsx';

import type { PackWithCount } from '~/utils/types.ts';

interface Props {
  popularPacks: PackWithCount[];
  updatedPacks: PackWithCount[];
}

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
