import '#filter-boolean';

import { useCallback, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import { hideDialog, showDialog } from '../../static/js/dialogs.js';

import nanoid from '../utils/nanoid.ts';

import Notice from './Notice.tsx';

import Dialog from './Dialog.tsx';

import Select from './Select.tsx';
import TextInput from './TextInput.tsx';
import ImageInput from './ImageInput.tsx';

import IconTrash from 'icons/trash.tsx';
import IconPlus from 'icons/folder-plus.tsx';
import IconPlus2 from 'icons/plus.tsx';
import IconApply from 'icons/check.tsx';

import strings from '../../i18n/en-US.ts';

import { defaultImage } from './Dashboard.tsx';

import {
  Character,
  type Media,
  MediaFormat,
  MediaType,
} from '../utils/types.ts';

export default (
  { media }: {
    characters: Signal<Character[]>;
    media: Signal<Media[]>;
  },
) => {
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
              type: MediaType.Anime,
              id: `${nanoid(4)}`,
              title: { english: '' },
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
              onChange={(image) => {
                signal.value.images = [image];
                // required to redraw the image in the outside container as well
                forceUpdate();
              }}
            />

            <Select
              required
              list={MediaType}
              label={strings.type}
              defaultValue={signal.value.type}
              onChange={(t: MediaType) => signal.value.type = t}
            />

            <TextInput
              required
              pattern='.{1,128}'
              label={strings.title}
              value={signal.value.title.english ?? ''}
              onInput={(value) => signal.value.title.english = value}
              key={`${signal.value.id}-title`}
            />

            <div class={'other'}>
              <Select
                list={MediaFormat}
                label={strings.format}
                defaultValue={signal.value.format}
                onChange={(f: MediaFormat) =>
                  signal.value.format = f || undefined}
              />

              <TextInput
                min={0}
                max={2147483647}
                type={'number'}
                label={strings.popularity}
                value={signal.value.popularity ?? 0}
                hint={strings.popularityHint}
                onInput={(value) =>
                  signal.value.popularity = Number(value ?? 0)}
                key={`${signal.value.id}-popularity`}
              />

              <TextInput
                markdown
                multiline
                pattern='.{1,2048}'
                label={strings.description}
                placeholder={strings.placeholder.mediaDescription}
                value={signal.value.description}
                onInput={(value) => signal.value.description = value}
                key={`${signal.value.id}-description`}
              />

              <div class={'links'}>
                <label class={'label'}>{strings.links}</label>
                <Notice type={'info'}>{strings.linksNotice}</Notice>
                {signal.value.externalLinks?.map((link, i) => (
                  <div class={'group'}>
                    <TextInput
                      required
                      value={link.site}
                      placeholder={'YouTube'}
                      onInput={(site) =>
                        // deno-lint-ignore no-non-null-assertion
                        signal.value.externalLinks![i].site = site}
                      key={`${signal.value.id}-link-${i}-site`}
                    />
                    <TextInput
                      required
                      value={link.url}
                      pattern={'^(https:\\/\\/)?(www\\.)?(youtube\\.com|twitch\\.tv|crunchyroll\\.com|tapas\\.io|webtoon\\.com|amazon\\.com)[\\S]*$'}
                      placeholder={'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                      onInput={(url) =>
                        // deno-lint-ignore no-non-null-assertion
                        signal.value.externalLinks![i].url = url}
                      key={`${signal.value.id}-link-${i}-url`}
                    />
                    <IconTrash
                      onClick={() => {
                        // deno-lint-ignore no-non-null-assertion
                        signal.value.externalLinks!.splice(i, 1);
                        // required since updating the links doesn't update the component
                        forceUpdate();
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    // deno-lint-ignore no-non-null-assertion
                    signal.value.externalLinks!.push({ site: '', url: '' });
                    // required since updating the links doesn't update the component
                    forceUpdate();
                  }}
                >
                  <IconPlus2 />
                </button>
              </div>
            </div>
          </>
        </div>
      </Dialog>
    </div>
  );
};
