import '#filter-boolean';

import { useCallback, useState } from 'preact/hooks';

import { useSignal } from '@preact/signals';

import Dialog from './Dialog.tsx';

import { hideDialog, showDialog } from '../../static/js/dialogs.js';

import ImageInput, { type IImageInput } from './ImageInput.tsx';

import IconPlus from 'icons/plus.tsx';
import IconClose from 'icons/x.tsx';

import TextInput from './TextInput.tsx';

import { defaultImage } from './Dashboard.tsx';

export interface Editable {
  id: string;
  title?: string;
  description?: string;
  image?: IImageInput;
}

export default ({ name, pack }: {
  name: 'media' | 'characters';
  readonly: {
    media: Readonly<Editable[]>;
    characters: Readonly<Editable[]>;
  };
  pack: {
    media: Editable[];
    characters: Editable[];
  };
}) => {
  const [, updateState] = useState({});

  // used to force the entire component to redrew
  const forceUpdate = useCallback(() => updateState({}), []);

  const signal = useSignal<Editable>({
    id: '',
    title: '',
  });

  return (
    <div class={'media'}>
      {Object.values(pack[name])
        .map(({ image }, i) => (
          <img
            key={i}
            src={image?.url ?? defaultImage}
            style={{ backgroundColor: image?.url ? undefined : 'transparent' }}
            onClick={() => {
              signal.value = pack[name][i];
              requestAnimationFrame(() => showDialog(name));
            }}
          />
        ))}

      {
        <div
          data-dialog={name}
          onClick={() => {
            const existingIds = [
              ...pack.media,
              ...pack.characters,
            ].map(({ id }) => id);

            let generatedId = 0;

            while (existingIds.includes(`${generatedId}`)) {
              generatedId += 1;
            }

            const item = {
              title: '',
              id: `${generatedId}`,
            };

            pack[name].push(item);

            signal.value = item;
          }}
        >
          <IconPlus />
        </div>
      }

      {/* dialog */}

      <Dialog name={name} class={'manage-dialog'}>
        <div class={'manage-dialog-media'}>
          <IconClose
            onClick={() => {
              requestAnimationFrame(() => hideDialog(name));
            }}
          />

          <>
            <ImageInput
              default={signal.value.image?.url ?? ''}
              accept={['image/png', 'image/jpeg', 'image/webp']}
              // force update to redraw the image in the outside container as well
              onChange={(url) => (signal.value.image = url, forceUpdate())}
              key={`${signal.value.id}-image`}
            />

            <TextInput
              required
              label={'name'}
              pattern='.{1,128}'
              value={signal.value.title}
              onInput={(value) => signal.value.title = value as string}
              key={`${signal.value.id}-title`}
            />

            <TextInput
              multiline
              label={'description'}
              pattern='.{1,2048}'
              value={signal.value.description}
              onInput={(value) => signal.value.description = value as string}
              key={`${signal.value.id}-description`}
            />
          </>
        </div>
      </Dialog>
    </div>
  );
};
