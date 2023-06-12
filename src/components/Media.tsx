import '#filter-boolean';

import { useCallback, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import { hideDialog, showDialog } from '../../static/js/dialogs.js';

import nanoid from '../utils/nanoid.ts';

import Dialog from './Dialog.tsx';

import TextInput from './TextInput.tsx';

import ImageInput from './ImageInput.tsx';

import IconTrash from 'icons/trash.tsx';
import IconPlus from 'icons/folder-plus.tsx';
import IconApply from 'icons/check.tsx';

import { defaultImage } from './Dashboard.tsx';

import { type Media, MediaType } from '../utils/types.ts';

export default ({ media }: { media: Signal<Media[]> }) => {
  const [, updateState] = useState({});

  // used to force the entire component to redrew
  const forceUpdate = useCallback(() => updateState({}), []);

  const signal = useSignal<Media>({
    type: MediaType.Anime,
    title: { english: '' },
    id: '',
  });

  return (
    <div class={'media'}>
      {Object.values(media.value)
        .map(({ images }, i) => (
          <img
            key={i}
            src={images?.[0]?.url ?? defaultImage}
            style={{
              backgroundColor: images?.[0]?.url ? undefined : 'transparent',
            }}
            onClick={() => {
              signal.value = media.value[i];
              requestAnimationFrame(() => showDialog('media'));
            }}
          />
        ))}

      {
        <div
          data-dialog={'media'}
          onClick={() => {
            const item: Media = {
              id: `${nanoid(4)}`,
              title: { english: '' },
              type: MediaType.Anime,
            };

            media.value.push(item);

            signal.value = item;
          }}
        >
          <IconPlus />
        </div>
      }

      {/* dialog */}

      <Dialog name={'media'} class={'dialog-normal'}>
        <div class={'manage-dialog-media'}>
          <div class={'buttons'}>
            <IconApply
              onClick={() => {
                requestAnimationFrame(() => hideDialog('media'));
              }}
            />

            <IconTrash
              onClick={() => {
                const i = media.value.findIndex(({ id }) =>
                  signal.value.id === id
                );

                if (i > -1) {
                  media.value.splice(i, 1);
                }

                forceUpdate();

                requestAnimationFrame(() => hideDialog('media'));
              }}
            />
          </div>

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
              value={signal.value.title.english ?? ''}
              onInput={(value) => signal.value.title.english = value as string}
              key={`${signal.value.id}-title`}
            />

            <TextInput
              min={0}
              max={2147483647}
              type={'number'}
              label={'popularity'}
              value={signal.value.popularity ?? 0}
              onInput={(value) => signal.value.popularity = Number(value ?? 0)}
              key={`${signal.value.id}-popularity`}
            />

            <div>
              <TextInput
                multiline
                label={'description'}
                pattern='.{1,2048}'
                value={signal.value.description}
                onInput={(value) => signal.value.description = value as string}
                key={`${signal.value.id}-description`}
              />
            </div>
          </>
        </div>
      </Dialog>
    </div>
  );
};
