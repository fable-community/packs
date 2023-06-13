// deno-lint-ignore-file no-external-import

import type {
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Modify,
} from 'https://raw.githubusercontent.com/ker0olos/fable/main/src/types.ts';

import type { IImageInput } from '../components/ImageInput.tsx';

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
  type DisaggregatedCharacter,
  type DisaggregatedMedia,
  MediaFormat,
  MediaType,
  type Schema,
} from 'https://raw.githubusercontent.com/ker0olos/fable/main/src/types.ts';
