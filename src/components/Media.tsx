import '#filter-boolean';

import { useCallback, useState } from 'preact/hooks';

import { useSignal } from '@preact/signals';

import Dialog from './Dialog.tsx';

import { showDialog } from '../../static/js/dialogs.js';

import ImageInput from './ImageInput.tsx';

import IconPlus from 'icons/plus.tsx';
import IconClose from 'icons/x.tsx';

import TextInput from './TextInput.tsx';

import { defaultImage } from './Dashboard.tsx';

export interface Editable {
  id: string;
  title?: string;
  description?: string;
  image?: string;
}

export default ({ name, media }: {
  name: 'media' | 'characters';
  readonly: {
    media: Readonly<Record<string, Editable>>;
    characters: Readonly<Record<string, Editable>>;
  };
  media: {
    media: Record<string, Editable>;
    characters: Record<string, Editable>;
  };
}) => {
  const [, updateState] = useState({});

  // used to force the entire component to redrew
  const forceUpdate = useCallback(() => updateState({}), []);

  const signal = useSignal<Editable>({ id: '' });

  return (
    <div class={'media'}>
      {Object.values(media[name])
        .map(({ id, image }) => (
          <img
            id={id}
            key={id}
            src={image ?? defaultImage}
            style={{ backgroundColor: image ? undefined : 'transparent' }}
            onClick={() => {
              signal.value = media[name][id];
              requestAnimationFrame(() => showDialog(name));
            }}
          />
        ))}

      {
        <div
          data-dialog={name}
          onClick={() => {
            const existing = [
              ...Object.keys(media.media),
              ...Object.keys(media.characters),
            ];

            let generatedId = 0;

            while (existing.includes(`${generatedId}`)) {
              generatedId += 1;
            }

            signal.value = media[name][`${generatedId}`] = {
              id: `${generatedId}`,
            };
          }}
        >
          <IconPlus />
        </div>
      }

      {/* dialog */}

      <Dialog name={name} class={'manage-dialog'}>
        <div class={'manage-dialog-media'}>
          <IconClose data-dialog-cancel={name} />

          {/* <button onClick={onRevert}>{'Revert'}</button> */}

          <>
            <ImageInput
              default={signal.value.image ?? ''}
              accept={['image/png', 'image/jpeg', 'image/webp']}
              // force update to redraw the image in the outside container as well
              onChange={(url) => (signal.value.image = url, forceUpdate())}
              key={`${signal.value.id}-image`}
            />

            <TextInput
              label={'name'}
              value={signal.value.title}
              onInput={(value) => signal.value.title = value}
              key={`${signal.value.id}-title`}
            />

            <TextInput
              multiline
              label={'description'}
              value={signal.value.description}
              onInput={(value) => signal.value.description = value}
              key={`${signal.value.id}-description`}
            />
          </>
        </div>
      </Dialog>
    </div>
  );
};
