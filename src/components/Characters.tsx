import '#filter-boolean';

import { useCallback, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import { hideDialog, showDialog } from '../../static/js/dialogs.js';

import nanoid from '../utils/nanoid.ts';

import Notice from './Notice.tsx';

import Dialog from './Dialog.tsx';

import Star from './Star.tsx';

import Select from './Select.tsx';
import TextInput from './TextInput.tsx';
import ImageInput from './ImageInput.tsx';

import IconTrash from 'icons/trash.tsx';
import IconPlus from 'icons/user-plus.tsx';
import IconApply from 'icons/check.tsx';
import IconAdd from 'icons/circle-plus.tsx';
import IconRemove from 'icons/circle-minus.tsx';

import { defaultImage } from './Dashboard.tsx';

import { getPopularity, getRating } from '../utils/rating.ts';

import strings from '../../i18n/en-US.ts';

import { type Character, CharacterRole, type Media } from '../utils/types.ts';

export default (
  { media, characters }: {
    characters: Signal<Character[]>;
    media: Signal<Media[]>;
  },
) => {
  const [, updateState] = useState({});

  // used to force the entire component to redrew
  const forceUpdate = useCallback(() => updateState({}), []);

  const signal = useSignal<Character>({
    name: { english: '' },
    id: '',
  });

  const primaryMedia = signal.value.media?.[0];

  const primaryMediaRef = primaryMedia
    ? media.value.find(({ id }) => primaryMedia.mediaId === id)
    : undefined;

  const rating = getRating({
    popularity: signal.value.popularity ?? primaryMediaRef?.popularity ?? 0,
    role: !signal.value.popularity ? primaryMedia?.role : undefined,
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

      <Dialog name={'characters'} class={'dialog-normal'}>
        <div class={'manage-dialog-media'}>
          <div class={'buttons'}>
            <IconApply
              onClick={() => {
                requestAnimationFrame(() => hideDialog('characters'));
              }}
            />

            <IconTrash
              onClick={() => {
                const i = characters.value.findIndex(({ id }) =>
                  signal.value.id === id
                );

                if (i > -1) {
                  characters.value.splice(i, 1);
                }

                forceUpdate();

                requestAnimationFrame(() => hideDialog('characters'));
              }}
            />
          </div>

          <>
            <ImageInput
              key={`${signal.value.id}-image`}
              default={signal.value.images?.[0]?.url ?? ''}
              accept={['image/png', 'image/jpeg', 'image/webp']}
              onChange={(image) => {
                signal.value.images = [image];
                // required to redraw the image in the outside container as well
                forceUpdate();
              }}
            />

            <TextInput
              required
              label={strings.name}
              pattern='.{1,128}'
              value={signal.value.name.english ?? ''}
              onInput={(value) => signal.value.name.english = value}
              key={`${signal.value.id}-title`}
            />

            <Select
              label={strings.primaryMedia}
              defaultValue={signal.value.media?.[0].mediaId}
              list={media.value.reduce((acc, media) => {
                return media.title.english
                  ? { ...acc, [media.title.english]: media.id }
                  : acc;
              }, {})}
              onChange={(mediaId: string) => {
                signal.value.media = mediaId
                  // TODO allow selecting character role
                  ? [{ mediaId, role: CharacterRole.Main }]
                  : undefined;
                // required to show warning notice if no media is assigned
                forceUpdate();
              }}
            />

            <div class={'other'}>
              {!signal.value.media?.length
                ? (
                  <Notice type={'warn'}>
                    {strings.primaryMediaNotice}
                  </Notice>
                )
                : undefined}

              <div class={'rating'}>
                <label>{strings.rating}</label>
                <div>
                  <div>
                    <Star class={'star'} data-on={true} />
                    <Star class={'star'} data-on={rating >= 2} />
                    <Star class={'star'} data-on={rating >= 3} />
                    <Star class={'star'} data-on={rating >= 4} />
                    <Star class={'star'} data-on={rating >= 5} />
                  </div>
                  <div>
                    <div
                      onClick={() => {
                        const target = Math.min(5, rating + 1);
                        signal.value.popularity = getPopularity(target);
                        // required since update the popularity doesn't update the component
                        forceUpdate();
                      }}
                    >
                      <IconAdd class={'button'} />
                    </div>
                    <div
                      onClick={() => {
                        const target = Math.max(1, rating - 1);
                        signal.value.popularity = getPopularity(target);
                        // required since update the popularity doesn't update the component
                        forceUpdate();
                      }}
                    >
                      <IconRemove class={'button'} />
                    </div>
                  </div>
                </div>
              </div>

              <div class={'group'}>
                <TextInput
                  label={strings.age}
                  value={signal.value.age ?? ''}
                  onInput={(value) => signal.value.age = value || undefined}
                  key={`${signal.value.id}-age`}
                />

                <TextInput
                  label={strings.gender}
                  value={signal.value.gender ?? ''}
                  onInput={(value) => signal.value.gender = value || undefined}
                  key={`${signal.value.id}-gender`}
                />
              </div>

              <TextInput
                multiline
                label={strings.description}
                pattern='.{1,2048}'
                value={signal.value.description}
                onInput={(value) =>
                  signal.value.description = value || undefined}
                key={`${signal.value.id}-description`}
              />
            </div>
          </>
        </div>
      </Dialog>
    </div>
  );
};
