// deno-lint-ignore-file no-external-import

import type {
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Modify,
} from 'https://raw.githubusercontent.com/ker0olos/fable/main/src/types.ts';

import type { IImageInput } from '../components/ImageInput.tsx';

export type User = {
  id: string;
  username: string;
  avatar?: string;
  discriminator?: string;
  // deno-lint-ignore camelcase
  display_name?: string;
};

export type Entity = {
  id: string;
  alias?: string;
  image?: string;
};

export type Media = Modify<
  DisaggregatedMedia,
  { images?: IImageInput[] }
>;

export type Character = Modify<
  DisaggregatedCharacter,
  { images?: IImageInput[] }
>;

export enum MediaFormat {
  'Anime' = 'TV',
  // 'Tv Short' = 'TV_SHORT',
  'Manga' = 'MANGA',
  'Movie' = 'MOVIE',
  // 'Special' = 'SPECIAL',
  'OVA' = 'OVA',
  'ONA' = 'ONA',
  'One Shot' = 'ONE_SHOT',
  // 'Music' = 'MUSIC',
  'Novel' = 'NOVEL',
  'Video Game' = 'VIDEO_GAME',
}

export enum MediaRelation {
  'is a Prequel' = 'PREQUEL',
  'is a Sequel' = 'SEQUEL',
  // Parent = 'PARENT',
  // Contains = 'CONTAINS',
  'is an Adaptation' = 'ADAPTATION',
  'is a Side Story' = 'SIDE_STORY',
  // Character = 'CHARACTER',
  // Summary = 'SUMMARY',
  // Alternative = 'ALTERNATIVE',
  'is a Spin Off' = 'SPIN_OFF',
  // Other = 'OTHER',
  // Source = 'SOURCE',
  // Compilation = 'COMPILATION',
}

export { Modify };

export {
  CharacterRole,
  type DisaggregatedCharacter,
  type DisaggregatedMedia,
  // MediaFormat,
  // MediaRelation,
  MediaType,
  type Pack,
} from 'https://raw.githubusercontent.com/ker0olos/fable/main/src/types.ts';
