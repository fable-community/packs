import '#filter-boolean';

import { useCallback, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import { hideDialog, showDialog } from '../../static/js/dialogs.js';

import nanoid from '../utils/nanoid.ts';

import Dialog from './Dialog.tsx';

import TextInput from './TextInput.tsx';

import ImageInput from './ImageInput.tsx';

import IconPlus from 'icons/user-plus.tsx';
import IconApply from 'icons/check.tsx';

import { defaultImage } from './Dashboard.tsx';

import type { Character } from '../utils/types.ts';

export default ({ characters }: { characters: Signal<Character[]> }) => {
  const [, updateState] = useState({});

  // used to force the entire component to redrew
  const forceUpdate = useCallback(() => updateState({}), []);

  const signal = useSignal<Character>({
    name: { english: '' },
    id: '',
  });

  return (
    <div class={'characters'}>
      {Object.values(characters.value)
        .map(({ images }, i) => (
          <img
            key={i}
            src={images?.[0]?.url ?? defaultImage}
            style={{
              backgroundColor: images?.[0]?.url ? undefined : 'transparent',
            }}
            onClick={() => {
              signal.value = characters.value[i];
              requestAnimationFrame(() => showDialog('characters'));
            }}
          />
        ))}

      {
        <div
          data-dialog={'characters'}
          onClick={() => {
            const item: Character = {
              id: `${nanoid(4)}`,
              name: { english: '' },
            };

            characters.value.push(item);

            signal.value = item;
          }}
        >
          <IconPlus />
        </div>
      }

      {/* dialog */}

      <Dialog name={'characters'} class={'manage-dialog'}>
        <div class={'manage-dialog-media'}>
          <IconApply
            onClick={() => {
              requestAnimationFrame(() => hideDialog('characters'));
            }}
          />

          <>
            <ImageInput
              key={`${signal.value.id}-image`}
              default={signal.value.images?.[0]?.url ?? ''}
              accept={['image/png', 'image/jpeg', 'image/webp']}
              // force update to redraw the image in the outside container as well
              onChange={(image) => {
                signal.value.images = [image];
                forceUpdate();
              }}
            />

            <TextInput
              required
              label={'name'}
              pattern='.{1,128}'
              value={signal.value.name.english ?? ''}
              onInput={(value) => signal.value.name.english = value as string}
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
