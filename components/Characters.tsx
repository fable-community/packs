import '#filter-boolean';

import { useCallback, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import { hideDialog, showDialog } from '../static/js/dialogs.js';

import { getPopularity, getRating } from '../utils/rating.ts';

import { defaultImage } from './Dashboard.tsx';

import Notice from './Notice.tsx';

import Dialog from './Dialog.tsx';

import Star from './Star.tsx';

import Select from './Select.tsx';
import TextInput from './TextInput.tsx';
import ImageInput from './ImageInput.tsx';

import IconTrash from 'icons/trash.tsx';
import IconPlus from 'icons/plus.tsx';
import IconApply from 'icons/check.tsx';
import IconAdd from 'icons/circle-plus.tsx';
import IconRemove from 'icons/circle-minus.tsx';
import IconReset from 'icons/circle-x.tsx';

import { i18n } from '../utils/i18n.ts';

import { type Character, CharacterRole, type Media } from '../utils/types.ts';

export default (
  { signal, media, characters, visible }: {
    signal: Signal<Character>;
    characters: Signal<Character[]>;
    media: Signal<Media[]>;
    visible: boolean;
  },
) => {
  const [, updateState] = useState({});

  // used to force the entire component to redrew
  const forceUpdate = useCallback(() => updateState({}), []);

  const newAliasValue = useSignal('');

  const primaryMedia = signal.value.media?.[0];

  const primaryMediaRef = primaryMedia
    ? media.value.find(({ id }) => primaryMedia.mediaId === id)
    : undefined;

  const rating = getRating({
    popularity: signal.value.popularity ?? primaryMediaRef?.popularity ?? 0,
    role: !signal.value.popularity && primaryMediaRef
      ? primaryMedia?.role
      : undefined,
  });

  return (
    <div class={visible ? '' : 'hidden'}>
      <div
        class={'flex flex-col gap-8 max-w-[980px] mx-auto pb-[15vh] pt-[2.5vh]'}
      >
        <div
          class={'flex flex-row items-center border-grey border-b-2 p-2 gap-2'}
        >
          <div class={'w-auto h-[90px] aspect-[90/127] mr-4'} />
          <i class={'basis-full'}>{i18n('name')}</i>
          <i class={'basis-full'}>{i18n('primaryMedia')}</i>
          <i class={'basis-full'}>{i18n('role')}</i>
          <i class={'basis-full'}>{i18n('rating')}</i>
        </div>

        {Object.values(characters.value)
          .map((char, i) => {
            const primaryMedia = char.media?.[0];

            const primaryMediaRef = primaryMedia
              ? media.value.find(({ id }) => primaryMedia.mediaId === id)
              : undefined;

            const rating = char.popularity
              ? getRating({ popularity: char.popularity })
              : getRating({
                popularity: primaryMediaRef?.popularity ?? 0,
                role: primaryMediaRef ? primaryMedia?.role : undefined,
              });

            return (
              <div
                class={'flex flex-row items-center p-2 gap-2'}
                key={characters.value[i].id}
                onClick={() => {
                  signal.value = characters.value[i];
                  requestAnimationFrame(() => showDialog('characters'));
                }}
              >
                <img
                  class={'bg-grey w-auto h-[90px] aspect-[90/127] mr-4 object-cover object-center'}
                  src={char.images?.[0]?.url ?? defaultImage}
                />
                <i class={'basis-full'}>
                  {char.name.english}
                </i>
                <i class={'basis-full'}>
                  {primaryMediaRef?.title.english ?? ''}
                </i>
                <i class={'basis-full'}>
                  {primaryMedia?.role
                    ? `${primaryMedia.role.substring(0, 1)}${
                      primaryMedia.role.substring(1).toLowerCase()
                    }`
                    : ''}
                </i>
                <i class={'basis-full'}>
                  {rating}
                </i>
              </div>
            );
          })}
      </div>

      <Dialog
        name={'characters'}
        class={'flex items-center justify-center w-full h-full left-0 top-0 pointer-events-none'}
      >
        <div
          class={'bg-embed2 flex flex-col gap-y-6 overflow-x-hidden overflow-y-auto rounded-[10px] m-4 p-4 h-[80vh] w-[80vw] max-w-[680px] pointer-events-auto'}
        >
          <div class={'flex flex-row-reverse ml-auto gap-2'}>
            <IconApply
              class={'w-[24px] h-[24px] cursor-pointer'}
              onClick={() => {
                forceUpdate();
                requestAnimationFrame(() => hideDialog('characters'));
              }}
            />

            <IconTrash
              class={'w-[24px] h-[24px] cursor-pointer text-red'}
              onClick={() => {
                const i = characters.value.findIndex(({ id }) =>
                  signal.value.id === id
                );

                if (i > -1 && window.confirm(i18n('deleteCharacter'))) {
                  characters.value.splice(i, 1);
                  forceUpdate();
                  requestAnimationFrame(() => hideDialog('characters'));
                }
              }}
            />
          </div>

          <ImageInput
            key={`${signal.value.id}-image`}
            class={'w-auto h-[192px] object-cover object-center aspect-[90/127] mx-auto flex-shrink-0'}
            default={signal.value.images?.[0]?.url ?? ''}
            accept={['image/png', 'image/jpeg', 'image/webp']}
            onChange={(image) => {
              signal.value.images = [image];
              forceUpdate();
            }}
          />

          <TextInput
            required
            pattern='.{1,128}'
            label={i18n('name')}
            value={signal.value.name.english ?? ''}
            onInput={(value) => signal.value.name.english = value}
            key={`${signal.value.id}-title`}
          />

          <div class={'flex flex-wrap gap-2'}>
            <Select
              class={'grow'}
              label={i18n('primaryMedia')}
              data-warning={!signal.value.media?.length}
              defaultValue={signal.value.media?.[0]?.mediaId}
              list={media.value.reduce((acc, media) => {
                return media.title.english
                  ? { ...acc, [media.title.english]: media.id }
                  : acc;
              }, {})}
              onChange={(mediaId: string) => {
                signal.value.media = mediaId
                  ? [{ mediaId, role: CharacterRole.Main }]
                  : undefined;
                forceUpdate();
              }}
            />
            {signal.value.media?.length
              ? (
                <Select
                  required
                  label={i18n('role')}
                  list={CharacterRole}
                  // deno-lint-ignore no-non-null-assertion
                  defaultValue={signal.value.media![0].role}
                  onChange={(role: CharacterRole) => {
                    // deno-lint-ignore no-non-null-assertion
                    signal.value.media![0].role = role;
                    forceUpdate();
                  }}
                />
              )
              : undefined}
          </div>

          {!signal.value.media?.length
            ? (
              <Notice type={'warn'}>
                {i18n('primaryMediaNotice')}
              </Notice>
            )
            : undefined}

          <div class={'flex flex-col gap-2'}>
            <label class={'uppercase text-disabled text-[0.8rem]'}>
              {i18n('rating')}
              {': '}
              {typeof signal.value.popularity === 'number'
                ? i18n('basedOnIndividual')
                : i18n('basedOnMedia')}
            </label>
            <div class={'flex'}>
              <div class={'flex grow'}>
                <Star
                  class={'w-[28px] h-auto transition-all duration-250 fill-fable'}
                />
                <Star
                  class={[
                    rating >= 2 ? 'fill-fable' : 'fill-disabled',
                    'w-[28px] h-auto transition-all duration-250',
                  ].join(' ')}
                />
                <Star
                  class={[
                    rating >= 3 ? 'fill-fable' : 'fill-disabled',
                    'w-[28px] h-auto transition-all duration-250',
                  ].join(' ')}
                />
                <Star
                  class={[
                    rating >= 4 ? 'fill-fable' : 'fill-disabled',
                    'w-[28px] h-auto transition-all duration-250',
                  ].join(' ')}
                />
                <Star
                  class={[
                    rating >= 5 ? 'fill-fable' : 'fill-disabled',
                    'w-[28px] h-auto transition-all duration-250',
                  ].join(' ')}
                />
              </div>
              <div class={'flex'}>
                {typeof signal.value.popularity === 'number'
                  ? (
                    <div
                      onClick={() => {
                        delete signal.value.popularity;
                        forceUpdate();
                      }}
                    >
                      <IconReset class={'w-[28px] h-auto cursor-pointer'} />
                    </div>
                  )
                  : undefined}
                <div
                  onClick={() => {
                    const target = Math.min(5, rating + 1);
                    signal.value.popularity = getPopularity(target);
                    forceUpdate();
                  }}
                >
                  <IconAdd class={'w-[28px] h-auto cursor-pointer'} />
                </div>
                <div
                  onClick={() => {
                    const target = Math.max(1, rating - 1);
                    signal.value.popularity = getPopularity(target);
                    forceUpdate();
                  }}
                >
                  <IconRemove class={'w-[28px] h-auto cursor-pointer'} />
                </div>
              </div>
            </div>
          </div>

          <div class={'flex flex-row gap-2'}>
            <TextInput
              class={'grow'}
              label={i18n('age')}
              placeholder={i18n('placeholderAge')}
              value={signal.value.age ?? ''}
              onInput={(value) => signal.value.age = value || undefined}
              key={`${signal.value.id}-age`}
            />

            <TextInput
              class={'grow'}
              label={i18n('gender')}
              placeholder={i18n('placeholderGender')}
              value={signal.value.gender ?? ''}
              onInput={(value) => signal.value.gender = value || undefined}
              key={`${signal.value.id}-gender`}
            />
          </div>

          <TextInput
            multiline
            pattern='.{1,2048}'
            label={i18n('description')}
            placeholder={i18n('placeholderCharDescription')}
            value={signal.value.description}
            onInput={(value) => signal.value.description = value || undefined}
            key={`${signal.value.id}-description`}
          />

          <div class={'flex flex-col gap-4'}>
            <div class={'flex flex-col gap-2'}>
              <label class={'uppercase text-disabled text-[0.8rem]'}>
                {i18n('aliases')}
              </label>
              <label class={'text-disabled text-[0.75rem]'}>
                {i18n('aliasesHint')}
              </label>
            </div>

            <div class={'flex flex-wrap gap-2'}>
              {signal.value.name.alternative?.map((alias, i) => (
                <div
                  class={'flex items-center justify-center bg-embed rounded-[100vw] px-6 py-4 gap-2'}
                  key={i}
                >
                  <i>{alias}</i>
                  <IconTrash
                    class={'w-[16px] h-auto cursor-pointer text-red'}
                    onClick={() => {
                      // deno-lint-ignore no-non-null-assertion
                      signal.value.name.alternative!.splice(i, 1);
                      forceUpdate();
                    }}
                  />
                </div>
              ))}

              {(signal.value.name.alternative?.length ?? 0) < 5
                ? (
                  <div
                    class={'flex items-center justify-center bg-embed rounded-[100vw] px-6 py-4 gap-2'}
                  >
                    <input
                      placeholder={'Batman'}
                      value={newAliasValue}
                      class={'border-0 p-0 rounded-[100vw] bg-embed text-[0.8rem] w-[180px]'}
                      onInput={(event) =>
                        newAliasValue.value =
                          (event.target as HTMLInputElement).value}
                    />
                    <IconPlus
                      class={[
                        'w-[16px] h-auto',
                        (newAliasValue.value?.length || 0) <= 0
                          ? 'pointer-events-none opacity-60'
                          : 'cursor-pointer',
                      ].join(' ')}
                      onClick={() => {
                        if (!signal.value.name.alternative) {
                          signal.value.name.alternative = [];
                        }

                        const length = newAliasValue.value?.length || 0;

                        if (length >= 1 && length <= 128) {
                          signal.value.name.alternative.push(
                            newAliasValue.value,
                          );

                          newAliasValue.value = '';

                          forceUpdate();
                        }
                      }}
                    />
                  </div>
                )
                : undefined}
            </div>
          </div>

          <div class={'flex flex-col'}>
            <label class={'uppercase text-disabled text-[0.8rem]'}>
              {i18n('links')}
            </label>
            <Notice type={'info'}>{i18n('linksNotice')}</Notice>
            <div class={'flex flex-col gap-2'}>
              {signal.value.externalLinks?.map((link, i) => (
                <div class={'flex items-center flex-wrap gap-2'}>
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
                    pattern={'^(https:\\/\\/)?(www\\.)?(youtube\\.com|twitch\\.tv|netflix\\.com|crunchyroll\\.com|tapas\\.io|webtoons\\.com|amazon\\.com)[\\S]*$'}
                    placeholder={'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                    onInput={(url) =>
                      // deno-lint-ignore no-non-null-assertion
                      signal.value.externalLinks![i].url = url}
                    key={`${signal.value.id}-link-${i}-url`}
                  />
                  <IconTrash
                    class={'w-[24px] h-auto cursor-pointer text-red'}
                    onClick={() => {
                      // deno-lint-ignore no-non-null-assertion
                      signal.value.externalLinks!.splice(i, 1);
                      forceUpdate();
                    }}
                  />
                </div>
              ))}
              {(signal.value.externalLinks?.length ?? 0) < 5
                ? (
                  <button
                    onClick={() => {
                      if (!signal.value.externalLinks) {
                        signal.value.externalLinks = [];
                      }

                      signal.value.externalLinks.push({
                        site: '',
                        url: '',
                      });

                      forceUpdate();
                    }}
                  >
                    <IconPlus />
                  </button>
                )
                : undefined}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
