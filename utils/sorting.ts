import type { DisaggregatedCharacter, DisaggregatedMedia } from './types.ts';

export const sortCharacters = (
  list: DisaggregatedCharacter[],
): DisaggregatedCharacter[] => {
  return list.toSorted((a, b) => {
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
  });
};

export const sortMedia = (
  list: DisaggregatedMedia[],
): DisaggregatedMedia[] => {
  return list.toSorted((a, b) => {
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
  });
};
