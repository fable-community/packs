import { useEffect } from 'preact/hooks';

import { useSignal } from '@preact/signals';

import IconArrowUp from 'icons/arrow-up.tsx';
import IconCalendarTime from 'icons/calendar-time.tsx';
import IconSearch from 'icons/search.tsx';

import PackTile from '~/components/PackTile.tsx';

import { useDebounce } from '~/utils/useDebounce.tsx';

import type { PackWithCount } from '~/utils/types.ts';

// async function fetchPopularPacks() {
//   const response = await fetch(`/api/popular`, {
//     method: 'GET',
//   });

//   const { packs } = (await response.json()) as {
//     packs: PackWithCount[];
//   };

//   return packs;
// }

async function fetchLastUpdatedPacks() {
  const response = await fetch(`/api/updated`, {
    method: 'GET',
  });

  const { packs } = (await response.json()) as {
    packs: PackWithCount[];
  };

  return packs;
}

async function searchPacks(q: string) {
  const response = await fetch(`/api/search?q=${q}`, {
    method: 'GET',
  });

  const { packs } = (await response.json()) as {
    packs: PackWithCount[];
  };

  return packs;
}

export default ({ popularPacks }: { popularPacks: PackWithCount[] }) => {
  const currTab = useSignal<'popular' | 'updated'>('popular');

  const updatedPacks = useSignal<PackWithCount[]>([]);
  const loading = useSignal(false);

  const [debouncedQuery, query, setQuery] = useDebounce('', 300);

  useEffect(() => {
    if (debouncedQuery) return;

    // if (currTab.value === 'popular') {
    //   loading.value = true;
    //   fetchPopularPacks().then((packs) => {
    //     popularPacks.value = packs;
    //     loading.value = false;
    //   });
    // }

    if (currTab.value === 'updated') {
      loading.value = true;
      fetchLastUpdatedPacks().then((packs) => {
        updatedPacks.value = packs;
        loading.value = false;
      });
    }
  }, [currTab.value, debouncedQuery]);

  useEffect(() => {
    if (!debouncedQuery) return;

    loading.value = true;
    currTab.value = 'updated';
    searchPacks(debouncedQuery).then((packs) => {
      updatedPacks.value = packs;
      loading.value = false;
    });
  }, [debouncedQuery]);

  return (
    <div class={'flex grow justify-center bg-background mx-[2rem]'}>
      <div
        class={'flex flex-col items-center w-full max-w-[800px] gap-8'}
      >
        <div class='flex flex-col gap-4 w-full'>
          <div class='flex w-full h-12 rounded-lg overflow-hidden'>
            <div
              onClick={() => currTab.value = 'popular'}
              class={`flex grow justify-center items-center gap-2 py-2 text-center font-bold cursor-pointer hover:bg-white hover:text-embed transition-colors ${
                currTab.value === 'popular'
                  ? 'bg-white text-embed pointer-events-none'
                  : 'bg-embed'
              }`}
            >
              <IconArrowUp class='w-5 h-5' />
              Popular
            </div>
            <div
              onClick={() => currTab.value = 'updated'}
              class={`flex grow justify-center items-center gap-2 py-2 text-center font-bold cursor-pointer hover:bg-white hover:text-embed transition-colors ${
                currTab.value === 'updated'
                  ? 'bg-white text-embed pointer-events-none'
                  : 'bg-embed'
              }`}
            >
              <IconCalendarTime class='w-5 h-5' />
              Recent
            </div>
          </div>

          <div class='flex w-full h-12 p-4 gap-4 rounded-lg bg-embed justify-center items-center overflow-hidden'>
            <IconSearch class='w-5 mx-4 h-5' />
            <input
              class='w-full'
              placeholder={'Search'}
              onInput={(ev) => setQuery((ev.target as HTMLInputElement).value)}
              value={query}
            >
            </input>
          </div>
        </div>

        {!loading.value && debouncedQuery
          ? (
            <span class='font-bold uppercase'>
              {updatedPacks.value.length} Results Found
            </span>
          )
          : undefined}

        {loading.value
          ? (
            <LoadingSpinner class='inline w-8 h-8 animate-spin text-grey fill-white' />
          )
          : currTab.value === 'popular'
          ? popularPacks.map((pack, index) => (
            <PackTile pack={pack} index={index} />
          ))
          : updatedPacks.value.map((pack, index) => (
            <PackTile pack={pack} index={index} />
          ))}
      </div>
    </div>
  );
};

const LoadingSpinner = (props: { class: string }) => {
  return (
    <svg
      class={props.class}
      viewBox='0 0 100 101'
    >
      <path
        d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
        fill='currentColor'
      />
      <path
        d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
        fill='currentFill'
      />
    </svg>
  );
};
