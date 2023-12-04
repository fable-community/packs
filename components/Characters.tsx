import '#filter-boolean';

import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import { hideDialog, showDialog } from '../static/dialogs.js';

import { getPopularity, getRating } from '../utils/rating.ts';

import { defaultImage } from './Dashboard.tsx';

import Notice from './Notice.tsx';

import Dialog from './Dialog.tsx';

import Star from './Star.tsx';

import Select from './Select.tsx';
import TextInput from './TextInput.tsx';
import ImageInput from './ImageInput.tsx';
import Sort from './Sort.tsx';

import { ZeroChanModal } from './ZeroChanModal.tsx';

import IconTrash from 'icons/trash.tsx';
import IconPlus from 'icons/plus.tsx';
import IconApply from 'icons/check.tsx';

import { i18n } from '../utils/i18n.ts';

import { getRelativeTimeString } from '../utils/timeString.ts';

import {
  type Character,
  CharacterRole,
  type CharacterSorting,
  type Media,
  type SortingOrder,
} from '../utils/types.ts';

import type { Data, Image } from '../routes/api/zerochan.ts';

export default (
  { signal, media, characters, visible, sorting, order, sortCharacters }: {
    signal: Signal<Character>;
    characters: Signal<Character[]>;
    media: Signal<Media[]>;
    visible: boolean;
    sorting: Signal<CharacterSorting>;
    order: Signal<SortingOrder>;
    sortCharacters: () => void;
  },
) => {
  const [, updateState] = useState({});

  const zeroChanImages = useSignal<Image[]>([]);
  const zeroChanModal = useSignal(false);

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

  const onCharacterUpdate = useCallback(() => {
    signal.value.updated = new Date().toISOString();
    sortCharacters();
  }, []);

  const substringQuery = useSignal('');

  const onZeroChan = useCallback(async () => {
    zeroChanModal.value = true;

    const data = await fetch('/api/zerochan', {
      method: 'POST',
      body: JSON.stringify(
        {
          query: [
            primaryMediaRef?.title.english,
            signal.value.name.english,
          ]
            .filter(Boolean),
        } satisfies Data,
      ),
    });

    const images: Image[] = await data.json();

    zeroChanImages.value = images;
  }, [primaryMediaRef, signal]);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // deno-lint-ignore no-non-null-assertion
    requestAnimationFrame(() => dialogRef.current!.scrollTop = 0);
  }, [zeroChanModal.value]);

  return (
    <div class={visible ? '' : 'hidden'}>
      <div
        class={'flex flex-col gap-8 max-w-[980px] mx-auto pb-[15vh] pt-[2.5vh]'}
      >
        <TextInput
          placeholder={i18n('searchCharactersPlaceholder')}
          class={'border-b-2 border-grey border-solid rounded-[0px]'}
          onInput={(value) => substringQuery.value = value}
          value={substringQuery.value}
        />
        <div
          class={'flex flex-row max-h-[30px] items-center border-grey border-b-2 py-8 gap-3'}
        >
          <div class={'w-auto h-[90px] aspect-[90/127] mr-4'} />
          <Sort name={'name'} order={order} sorting={sorting}>
            {i18n('name')}
          </Sort>
          <Sort name={'media'} order={order} sorting={sorting}>
            {i18n('primaryMedia')}
          </Sort>
          <Sort name={'role'} order={order} sorting={sorting}>
            {i18n('role')}
          </Sort>
          <Sort name={'rating'} order={order} sorting={sorting}>
            {i18n('rating')}
          </Sort>
          <Sort name={'updated'} order={order} sorting={sorting}>
            {i18n('updated')}
          </Sort>
        </div>

        {Object.values(characters.value)
          .map((char, i) => {
            const name = char.name.english ?? '';

            const substringIndex = name.toLocaleLowerCase().indexOf(
              substringQuery.value.toLocaleLowerCase(),
            );

            if (
              substringQuery.value.length > 0 &&
              substringIndex <= -1
            ) {
              return undefined;
            }

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

            const date = char.updated ?? char.added;

            const timeString = date
              ? getRelativeTimeString(new Date(date))
              : '';

            const nameBeforeSubstring = name.slice(0, substringIndex);
            const nameSubstring = name.slice(
              substringIndex,
              substringIndex + substringQuery.value.length,
            );
            const nameAfterSubstring = name.slice(
              substringIndex + substringQuery.value.length,
            );

            return (
              <div
                class={'flex flex-row items-center p-2 gap-3 cursor-pointer hover:bg-highlight'}
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
                  {nameBeforeSubstring}
                  <span class={'bg-yellow-300 text-embed'}>
                    {nameSubstring}
                  </span>
                  {nameAfterSubstring}
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
                <i class={'basis-full'}>
                  {timeString}
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
          ref={dialogRef}
          class={'bg-embed2 flex flex-col gap-y-6 overflow-x-hidden overflow-y-auto rounded-[10px] m-4 p-4 h-[80vh] w-[80vw] max-w-[680px] pointer-events-auto'}
        >
          {zeroChanModal.value
            ? (
              <ZeroChanModal
                visible={zeroChanModal}
                images={zeroChanImages}
                callback={(imageUrl) => {
                  signal.value.images = [{ url: imageUrl }];
                  onCharacterUpdate();
                  forceUpdate();
                }}
              />
            )
            : (
              <>
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

                <div class={'flex gap-8 flex-wrap'}>
                  <ImageInput
                    name={signal.value.id}
                    key={`${signal.value.id}-image`}
                    class={'w-auto h-[192px] object-cover object-center aspect-[90/127] mx-auto flex-shrink-0'}
                    default={signal.value.images?.[0]?.url ?? ''}
                    accept={['image/png', 'image/jpeg', 'image/webp']}
                    onChange={(image) => {
                      signal.value.images = [image];
                      onCharacterUpdate();
                      forceUpdate();
                    }}
                  />
                  <div class={'flex flex-col grow gap-4 h-min my-auto'}>
                    <button>
                      <label
                        for={signal.value.id}
                        class={'w-full cursor-pointer'}
                      >
                        {i18n('uploadFromPC')}
                      </label>
                    </button>
                    <TextInput
                      class={'w-full text-disabled'}
                      label={i18n('imageUrl')}
                      value={signal.value.images?.[0]?.file?.name ??
                        signal.value.images?.[0]?.url}
                      onInput={(value) => {
                        signal.value.images = [{ url: value }];
                        onCharacterUpdate();
                        forceUpdate();
                      }}
                      key={`${signal.value.id}-imageurl`}
                    >
                      <button class={'min-w-[0]'} onClick={onZeroChan}>
                        <svg
                          viewBox='0 0 512 512'
                          class={'text-disabled w-[21px] h-[21px]'}
                        >
                          <use href='/zerochan.svg#layer1' />
                        </svg>
                      </button>
                    </TextInput>
                  </div>
                </div>

                <TextInput
                  required
                  pattern='.{1,128}'
                  label={i18n('name')}
                  value={signal.value.name.english ?? ''}
                  onInput={(value) => {
                    signal.value.name.english = value;
                    onCharacterUpdate();
                  }}
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
                      onCharacterUpdate();
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
                          onCharacterUpdate();
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
                  </label>
                  <div class={'flex'}>
                    <div class={'flex grow'}>
                      <Star
                        class={'w-[28px] h-auto cursor-pointer transition-all duration-250 fill-fable'}
                        onClick={() => {
                          signal.value.popularity = getPopularity(1);
                          onCharacterUpdate();
                          forceUpdate();
                        }}
                      />
                      <Star
                        class={[
                          rating >= 2 ? 'fill-fable' : 'fill-disabled',
                          'w-[28px] h-auto cursor-pointer transition-all duration-250',
                        ].join(' ')}
                        onClick={() => {
                          signal.value.popularity = getPopularity(2);
                          onCharacterUpdate();
                          forceUpdate();
                        }}
                      />
                      <Star
                        class={[
                          rating >= 3 ? 'fill-fable' : 'fill-disabled',
                          'w-[28px] h-auto cursor-pointer transition-all duration-250',
                        ].join(' ')}
                        onClick={() => {
                          signal.value.popularity = getPopularity(3);
                          onCharacterUpdate();
                          forceUpdate();
                        }}
                      />
                      <Star
                        class={[
                          rating >= 4 ? 'fill-fable' : 'fill-disabled',
                          'w-[28px] h-auto cursor-pointer transition-all duration-250',
                        ].join(' ')}
                        onClick={() => {
                          signal.value.popularity = getPopularity(4);
                          onCharacterUpdate();
                          forceUpdate();
                        }}
                      />
                      <Star
                        class={[
                          rating >= 5 ? 'fill-fable' : 'fill-disabled',
                          'w-[28px] h-auto cursor-pointer transition-all duration-250',
                        ].join(' ')}
                        onClick={() => {
                          signal.value.popularity = getPopularity(5);
                          onCharacterUpdate();
                          forceUpdate();
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div class={'flex flex-row gap-2'}>
                  <TextInput
                    class={'grow'}
                    label={i18n('age')}
                    placeholder={i18n('placeholderAge')}
                    value={signal.value.age ?? ''}
                    onInput={(value) => {
                      signal.value.age = value || undefined;
                      onCharacterUpdate();
                    }}
                    key={`${signal.value.id}-age`}
                  />

                  <TextInput
                    class={'grow'}
                    label={i18n('gender')}
                    placeholder={i18n('placeholderGender')}
                    value={signal.value.gender ?? ''}
                    onInput={(value) => {
                      signal.value.gender = value || undefined;
                      onCharacterUpdate();
                    }}
                    key={`${signal.value.id}-gender`}
                  />
                </div>

                <TextInput
                  multiline
                  pattern='.{1,2048}'
                  label={i18n('description')}
                  placeholder={i18n('placeholderCharDescription')}
                  value={signal.value.description}
                  onInput={(value) => {
                    signal.value.description = value || undefined;
                    onCharacterUpdate();
                  }}
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
                            onCharacterUpdate();
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

                                onCharacterUpdate();

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
                          onInput={(site) => {
                            // deno-lint-ignore no-non-null-assertion
                            signal.value.externalLinks![i].site = site;
                            onCharacterUpdate();
                          }}
                          key={`${signal.value.id}-link-${i}-site`}
                        />
                        <TextInput
                          required
                          value={link.url}
                          pattern={'^(https:\\/\\/)?(www\\.)?(youtube\\.com|twitch\\.tv|netflix\\.com|crunchyroll\\.com|tapas\\.io|webtoons\\.com|amazon\\.com)[\\S]*$'}
                          placeholder={'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                          onInput={(url) => {
                            // deno-lint-ignore no-non-null-assertion
                            signal.value.externalLinks![i].url = url;
                            onCharacterUpdate();
                          }}
                          key={`${signal.value.id}-link-${i}-url`}
                        />
                        <IconTrash
                          class={'w-[24px] h-auto cursor-pointer text-red'}
                          onClick={() => {
                            // deno-lint-ignore no-non-null-assertion
                            signal.value.externalLinks!.splice(i, 1);
                            onCharacterUpdate();
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
              </>
            )}
        </div>
      </Dialog>
    </div>
  );
};
