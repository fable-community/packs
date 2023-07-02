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

export { Modify };

export {
  CharacterRole,
  type DisaggregatedCharacter,
  type DisaggregatedMedia,
  MediaFormat,
  MediaRelation,
  MediaType,
  type Pack,
} from 'https://raw.githubusercontent.com/ker0olos/fable/main/src/types.ts';
