import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import { hideDialog, showDialog } from '~/static/dialogs.js';

import { getPopularity, getRating } from '~/utils/rating.ts';

import Notice from '~/components/Notice.tsx';

import Dialog from '~/components/Dialog.tsx';

import Star from '~/components/Star.tsx';

import Select from '~/components/Select.tsx';
import TextInput from '~/components/TextInput.tsx';
import ImageInput from '~/components/ImageInput.tsx';
import Sort from '~/components/Sort.tsx';

import { ZeroChanModal } from '~/components/ZeroChanModal.tsx';

import IconTrash from 'icons/trash.tsx';
import IconPlus from 'icons/plus.tsx';
import IconApply from 'icons/check.tsx';

import { i18n } from '~/utils/i18n.ts';

import { getRelativeTimeString } from '~/utils/timeString.ts';

import {
  type Character,
  CharacterRole,
  type CharacterSorting,
  type Media,
  type SortingOrder,
} from '~/utils/types.ts';

import nanoid from '~/utils/nanoid.ts';

import type { Data } from '~/routes/api/autogen.ts';

const defaultImage =
  'https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg';

export default (
  { dirty, signal, media, characters, visible, sorting, order, sortCharacters }:
    {
      dirty: Signal<boolean>;
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

  const dialogRef = useRef<HTMLDivElement>(null);

  const zeroChanModal = useSignal(false);
  const descriptionLoading = useSignal(false);

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
    dirty.value = true;
    signal.value.updated = new Date().toISOString();
    sortCharacters();
  }, []);

  const substringQuery = useSignal('');

  const onZeroChan = () => zeroChanModal.value = true;

  const onAutogenerate = useCallback(() => {
    descriptionLoading.value = true;

    const characterName = signal.value.name.english;

    const _media = signal.value.media?.[0];

    const mediaTitle = _media
      ? media.value.find(({ id }) => _media.mediaId === id)?.title
        ?.english
      : undefined;

    fetch('/api/autogen', {
      method: 'POST',
      body: JSON.stringify({ mediaTitle, characterName } satisfies Data),
    })
      .then(async (response) => {
        const stream = response.body;

        if (!stream) {
          signal.value.description = 'internal Server Error';
          return;
        }

        signal.value.description = '';

        const reader = response.body.getReader();

        let result = await reader.read();

        while (!result.done) {
          const chunk = result.value;

          signal.value.description += new TextDecoder().decode(chunk);
          signal.value.description = signal.value.description?.trim();
          forceUpdate();

          result = await reader.read();
        }
      })
      .finally(() => {
        descriptionLoading.value = false;
        onCharacterUpdate();
      });
  }, [signal.value]);

  // reset zerochan
  useEffect(() => {
    zeroChanModal.value = false;
  }, [signal.value]);

  // reset dialog scroll y
  useEffect(() => {
    // deno-lint-ignore no-non-null-assertion
    requestAnimationFrame(() => dialogRef.current!.scrollTop = 0);
  }, [signal.value, zeroChanModal.value]);

  return (
    <div class={visible ? '' : 'hidden'}>
      <div
        class={'flex flex-col gap-8 max-w-[980px] mx-auto pb-[15vh] pt-[2.5vh]'}
      >
        <button
          data-dialog={'characters'}
          class={'flex justify-start gap-2 bg-transparent'}
          onClick={() => {
            const item: Character = {
              id: `${nanoid(4)}`,
              name: { english: '' },
              added: new Date().toISOString(),
            };

            characters.value = [item, ...characters.value];

            signal.value = item;
          }}
        >
          <IconPlus class={'w-4 h-4'} />
          {i18n('addNewCharacter')}
        </button>
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
                character={signal.value.name.english}
                media={primaryMediaRef?.title.english}
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

                      if (i > -1 && confirm(i18n('deleteCharacter'))) {
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
                    <TextInput
                      class={'w-full text-disabled'}
                      placeholder={i18n('imageUrl').toUpperCase()}
                      value={signal.value.images?.[0]?.file?.name ??
                        signal.value.images?.[0]?.url}
                      onInput={(value) => {
                        signal.value.images = [{ url: value }];
                        onCharacterUpdate();
                        forceUpdate();
                      }}
                      key={`${signal.value.id}-imageurl`}
                    />

                    <div class={'flex flex-row w-full gap-2'}>
                      <button
                        class={'flex-row w-full grow'}
                      >
                        <label
                          class={'grow cursor-pointer'}
                          for={signal.value.id}
                        >
                          {i18n('uploadFromPC')}
                        </label>
                      </button>
                      <button class={'min-w-[0]'} onClick={onZeroChan}>
                        <svg
                          viewBox='0 0 512 512'
                          class={'text-disabled w-[21px] h-[21px]'}
                        >
                          <use href='/zerochan.svg#layer1' />
                        </svg>
                      </button>
                    </div>
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
                  <label class={'text-disabled text-[0.75rem]'}>
                    {i18n('ratingHint')}
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
                  disabled={descriptionLoading}
                  pattern='.{1,2048}'
                  label={i18n('description')}
                  placeholder={i18n('placeholderCharDescription')}
                  value={signal.value.description}
                  class={'min-h-[20vh]'}
                  onInput={(value) => {
                    signal.value.description = value || undefined;
                    onCharacterUpdate();
                  }}
                  key={`${signal.value.id}-description`}
                >
                  {!signal.value.description && !descriptionLoading.value
                    ? (
                      <button
                        onClick={onAutogenerate}
                        class={'absolute bottom-3 left-[50%] translate-x-[-50%] bg-highlight'}
                      >
                        {i18n('autoGen')}
                      </button>
                    )
                    : undefined}
                  {descriptionLoading.value
                    ? (
                      <LoadingSpinner class='absolute right-6 bottom-4 inline w-8 h-8 animate-spin text-grey fill-white' />
                    )
                    : undefined}
                </TextInput>

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

const LoadingSpinner = (props: { class: string }) => {
  return (
    <svg
      class={props.class}
      viewBox='0 0 100 101'
    >
      <path
        d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
        fill='currentColor'
      />
      <path
        d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
        fill='currentFill'
      />
    </svg>
  );
};
