import type { JSX } from 'preact';
import type { Signal } from '@preact/signals';

import IconArrowUp from 'icons/arrow-up.tsx';
import IconArrowDown from 'icons/arrow-down.tsx';

import type {
  CharacterSorting,
  MediaSorting,
  SortingOrder,
} from '~/utils/types.ts';

const Sort = (
  { name, order, sorting, children, ...props }: {
    name: CharacterSorting | MediaSorting;
    sorting: Signal<CharacterSorting | MediaSorting>;
    order: Signal<SortingOrder>;
  } & JSX.HTMLAttributes<HTMLElement>,
) => {
  return (
    <i
      class={'basis-full flex flex-row gap-1 cursor-pointer'}
      {...props}
      onClick={() => {
        if (sorting.value !== name) {
          order.value = 'desc';
        } else {
          order.value = order.value === 'asc' ? 'desc' : 'asc';
        }

        sorting.value = name;
      }}
    >
      {children}
      {sorting.value === name
        ? (order.value === 'desc'
          ? <IconArrowDown class={'w-[18px] h-auto'} />
          : <IconArrowUp class={'w-[18px] h-auto'} />)
        : undefined}
    </i>
  );
};

export default Sort;
