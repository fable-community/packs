import { CharacterRole } from './types.ts';

// https://raw.githubusercontent.com/ker0olos/fable/main/src/rating.ts

export const getRating = (
  { role, popularity }: { popularity: number; role?: CharacterRole },
) => {
  if (
    role === CharacterRole.Background ||
    !popularity || popularity < 50_000
  ) {
    return 1;
  } else if (popularity < 200_000) {
    if (role === CharacterRole.Main) {
      return 3;
    } else {
      return 2;
    }
  } else if (popularity < 400_000) {
    if (role === CharacterRole.Main) {
      return 4;
    } else {
      return 3;
    }
  } else if (popularity >= 400_000) {
    if (role === CharacterRole.Main) {
      return 5;
    } else if (!role && popularity >= 1_000_000) {
      return 5;
    } else {
      return 4;
    }
  } else {
    throw new Error();
  }
};

export const getPopularity = (rating: number) => {
  switch (rating) {
    case 5:
      return 1_000_000;
    case 4:
      return 400_000;
    case 3:
      return 201_000;
    case 2:
      return 55_000;
    case 1:
      return 1_000;
    default:
      throw new Error();
  }
};
