import type {
  CharacterSorting,
  DisaggregatedCharacter,
  DisaggregatedMedia,
  MediaSorting,
  SortingOrder,
} from './types.ts';

const orderByUpdate = (
  a: DisaggregatedCharacter | DisaggregatedMedia,
  b: DisaggregatedCharacter | DisaggregatedMedia,
) => {
  const dateA = a.updated ?? a.added;
  const dateB = b.updated ?? b.added;

  if (dateA && !dateB) {
    return -1;
  } else if (!dateA && dateB) {
    return 1;
  } else if (dateA && dateB) {
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  } else {
    return 0;
  }
};

export const sortCharacters = (
  list: DisaggregatedCharacter[],
  sorting: CharacterSorting,
  order: SortingOrder,
): DisaggregatedCharacter[] => {
  const sortedList = list.toSorted((a, b) => {
    switch (sorting) {
      case 'updated':
        return orderByUpdate(a, b);
      default:
        throw new Error('Not Implemented');
    }
  });

  if (order === 'asc') {
    return sortedList.toReversed();
  }

  return sortedList;
};

export const sortMedia = (
  list: DisaggregatedMedia[],
  sorting: MediaSorting,
  order: SortingOrder,
): DisaggregatedMedia[] => {
  const sortedList = list.toSorted((a, b) => {
    switch (sorting) {
      case 'updated':
        return orderByUpdate(a, b);
      default:
        throw new Error('Not Implemented');
    }
  });

  if (order === 'asc') {
    return sortedList.toReversed();
  }

  return sortedList;
};
