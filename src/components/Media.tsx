import '#filter-boolean';

import { useCallback, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import { hideDialog, showDialog } from '../../static/js/dialogs.js';

import { defaultImage } from './Dashboard.tsx';

import Notice from './Notice.tsx';

import Dialog from './Dialog.tsx';

import Select from './Select.tsx';
import TextInput from './TextInput.tsx';
import ImageInput from './ImageInput.tsx';

import IconTrash from 'icons/trash.tsx';
import IconPlus from 'icons/plus.tsx';
import IconApply from 'icons/check.tsx';

import comma from '../utils/comma.ts';

import strings from '../../i18n/en-US.ts';

import {
  Character,
  type Media,
  MediaFormat,
  MediaType,
} from '../utils/types.ts';

export default (
  { layout, signal, media, visible }: {
    layout: Signal<number>;
    signal: Signal<Media>;
    characters: Signal<Character[]>;
    media: Signal<Media[]>;
    visible: boolean;
  },
) => {
  const [, updateState] = useState({});

  // used to force the entire component to redrew
  const forceUpdate = useCallback(() => updateState({}), []);

  const newAliasValue = useSignal('');

  return (
    <div style={{ display: visible ? '' : 'none' }}>
      <div class={'media'} data-layout={layout.value}>
        <div class={'item'}>
          <div />
          <i>{strings.title}</i>
          <i>{strings.popularity}</i>
        </div>

        {Object.values(media.value)
          .map((_media, i) => {
            return (
              <div
                key={media.value[i].id}
                class={`item _${media.value[i].id}`}
                onClick={() => {
                  signal.value = media.value[i];
                  requestAnimationFrame(() => showDialog('media'));
                }}
              >
                <img
                  src={_media.images?.[0]?.url ?? defaultImage}
                  style={{
                    backgroundColor: _media.images?.[0]?.url
                      ? undefined
                      : 'transparent',
                  }}
                />
                <i>{_media.title.english}</i>
                <i>{comma(_media.popularity ?? 0)}</i>
              </div>
            );
          })}
      </div>

      <Dialog name={'media'} class={'dialog-normal'}>
        <div class={'manage-dialog-media'}>
          <div class={'buttons'}>
            <IconApply
              onClick={() => {
                forceUpdate();

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

          <ImageInput
            key={`${signal.value.id}-image`}
            default={signal.value.images?.[0]?.url ?? ''}
            accept={['image/png', 'image/jpeg', 'image/webp']}
            onChange={(image) => {
              signal.value.images = [image];
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
              onInput={(value) => signal.value.popularity = Number(value ?? 0)}
              key={`${signal.value.id}-popularity`}
            />

            <TextInput
              multiline
              pattern='.{1,2048}'
              label={strings.description}
              placeholder={strings.placeholder.mediaDescription}
              value={signal.value.description}
              onInput={(value) => signal.value.description = value}
              key={`${signal.value.id}-description`}
            />

            <div class={'group-colum'}>
              <label class={'label'}>{strings.aliases}</label>
              <label class={'hint'}>{strings.aliasesHint}</label>
              <div class={'aliases'}>
                {signal.value.title.alternative?.map((alias, i) => (
                  <div class={'alias'}>
                    <i>{alias}</i>
                    <IconTrash
                      class={'delete'}
                      onClick={() => {
                        // deno-lint-ignore no-non-null-assertion
                        signal.value.title.alternative!.splice(i, 1);
                        forceUpdate();
                      }}
                    />
                  </div>
                ))}

                {(signal.value.title.alternative?.length ?? 0) < 5
                  ? (
                    <div class={'alias'}>
                      <input
                        required
                        pattern='.{1,128}'
                        placeholder={'Harry Potter: 11th Book'}
                        value={newAliasValue}
                        onInput={(event) =>
                          newAliasValue.value =
                            (event.target as HTMLInputElement).value}
                      />
                      <IconPlus
                        onClick={() => {
                          if (!signal.value.title.alternative) {
                            signal.value.title.alternative = [];
                          }

                          signal.value.title.alternative.push(
                            newAliasValue.value,
                          );

                          newAliasValue.value = '';

                          forceUpdate();
                        }}
                      />
                    </div>
                  )
                  : undefined}
              </div>
            </div>

            <div class={'group-colum'}>
              <label class={'label'}>{strings.links}</label>
              <Notice type={'info'}>{strings.linksNotice}</Notice>
              <div class={'links'}>
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
                        forceUpdate();
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    // deno-lint-ignore no-non-null-assertion
                    signal.value.externalLinks!.push({ site: '', url: '' });
                    forceUpdate();
                  }}
                >
                  <IconPlus />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
