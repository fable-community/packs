import type {
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Manifest,
  Modify,
} from '~/utils/fable-types.ts';

import type { IImageInput } from '~/components/ImageInput.tsx';

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

export type SortingOrder = 'asc' | 'desc';

export type CharacterSorting = 'name' | 'media' | 'role' | 'rating' | 'updated';
export type MediaSorting = 'title' | 'popularity' | 'updated';

export { Modify };

export {
  type Alias,
  CharacterRole,
  type DisaggregatedCharacter,
  type DisaggregatedMedia,
  type Manifest,
  MediaType,
} from '~/utils/fable-types.ts';

export interface Pack {
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  manifest: Manifest;
  approved: boolean;
  hidden: boolean;
}

export interface PackWithCount {
  servers?: number;
  manifest: {
    id: string;
    title?: string;
    description?: string;
    image?: string;
    media: number;
    characters: number;
    createdAt: Date;
    updatedAt: Date;
    approved: boolean;
  };
}
