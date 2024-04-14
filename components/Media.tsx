import { useCallback, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import { hideDialog, showDialog } from '~/static/dialogs.js';

import Notice from '~/components/Notice.tsx';

import Dialog from '~/components/Dialog.tsx';

import Select from '~/components/Select.tsx';
import TextInput from '~/components/TextInput.tsx';
import ImageInput from '~/components/ImageInput.tsx';
import Sort from '~/components/Sort.tsx';

import IconTrash from 'icons/trash.tsx';
import IconPlus from 'icons/plus.tsx';
import IconApply from 'icons/check.tsx';

import comma from '~/utils/comma.ts';

import { i18n } from '~/utils/i18n.ts';

import { getRelativeTimeString } from '~/utils/timeString.ts';

import {
  type Media,
  type MediaSorting,
  MediaType,
  type SortingOrder,
} from '~/utils/types.ts';

import nanoid from '~/utils/nanoid.ts';

import type { Data } from '~/routes/api/autogen.ts';

const defaultImage =
  'https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg';

export default (
  { dirty, signal, media, visible, sorting, order, sortMedia }: {
    dirty: Signal<boolean>;
    signal: Signal<Media>;
    // characters: Signal<Character[]>;
    media: Signal<Media[]>;
    visible: boolean;
    sorting: Signal<MediaSorting>;
    order: Signal<SortingOrder>;
    sortMedia: () => void;
  },
) => {
  const [, updateState] = useState({});

  const descriptionLoading = useSignal(false);

  // used to force the entire component to redrew
  const forceUpdate = useCallback(() => updateState({}), []);

  const onMediaUpdate = useCallback(() => {
    dirty.value = true;
    signal.value.updated = new Date().toISOString();
    sortMedia();
  }, []);

  const newAliasValue = useSignal('');

  const substringQuery = useSignal('');

  const MediaFormat = {
    [i18n('anime')]: 'TV',
    [i18n('manga')]: 'MANGA',
    [i18n('movie')]: 'MOVIE',
    [i18n('OVA')]: 'OVA',
    [i18n('ONA')]: 'ONA',
    [i18n('oneShot')]: 'ONE_SHOT',
    [i18n('novel')]: 'NOVEL',
    [i18n('videoGame')]: 'VIDEO_GAME',
  };

  const MediaRelation = {
    [i18n('prequel')]: 'PREQUEL',
    [i18n('sequel')]: 'SEQUEL',
    [i18n('adaptation')]: 'ADAPTATION',
    [i18n('sideStory')]: 'SIDE_STORY',
    [i18n('spinoff')]: 'SPIN_OFF',
  };

  const onAutogenerate = useCallback(() => {
    descriptionLoading.value = true;

    const mediaTitle = signal.value.title.english;

    fetch('/api/autogen', {
      method: 'POST',
      body: JSON.stringify({ mediaTitle } satisfies Data),
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
        onMediaUpdate();
      });
  }, [signal.value]);

  return (
    <div class={visible ? '' : 'hidden'}>
      <div
        class={'flex flex-col gap-8 max-w-[980px] mx-auto pb-[15vh] pt-[2.5vh]'}
      >
        <button
          data-dialog={'media'}
          class={'flex justify-start gap-2 bg-transparent'}
          onClick={() => {
            const item: Media = {
              id: `${nanoid(4)}`,
              title: { english: '' },
              type: MediaType.Anime,
              added: new Date().toISOString(),
            };

            media.value = [item, ...media.value];

            signal.value = item;
          }}
        >
          <IconPlus class={'w-4 h-4'} />
          {i18n('addNewMedia')}
        </button>
        <TextInput
          placeholder={i18n('searchMediaPlaceholder')}
          class={'border-b-2 border-grey border-solid rounded-[0px]'}
          onInput={(value) => substringQuery.value = value}
          value={substringQuery.value}
        />
        <div
          class={'flex flex-row max-h-[30px] items-center border-grey border-b-2 py-8 gap-3'}
        >
          <div class={'w-auto h-[90px] aspect-[90/127] mr-4'} />
          <Sort name={'title'} order={order} sorting={sorting}>
            {i18n('title')}
          </Sort>
          <Sort name={'popularity'} order={order} sorting={sorting}>
            {i18n('popularity')}
          </Sort>
          <Sort name={'updated'} order={order} sorting={sorting}>
            {i18n('updated')}
          </Sort>
        </div>

        {Object.values(media.value)
          .map((_media, i) => {
            const title = _media.title.english ?? '';

            const substringIndex = title.toLocaleLowerCase().indexOf(
              substringQuery.value.toLocaleLowerCase(),
            );

            if (
              substringQuery.value.length > 0 &&
              substringIndex <= -1
            ) {
              return undefined;
            }

            const date = _media.updated ?? _media.added;

            const timeString = date
              ? getRelativeTimeString(new Date(date))
              : '';

            const titleBeforeSubstring = title.slice(0, substringIndex);
            const titleSubstring = title.slice(
              substringIndex,
              substringIndex + substringQuery.value.length,
            );
            const titleAfterSubstring = title.slice(
              substringIndex + substringQuery.value.length,
            );

            return (
              <div
                key={media.value[i].id}
                class={'flex flex-row items-center p-2 gap-3 cursor-pointer hover:bg-highlight'}
                onClick={() => {
                  signal.value = media.value[i];
                  requestAnimationFrame(() => showDialog('media'));
                }}
              >
                <img
                  class={'bg-grey w-auto h-[90px] aspect-[90/127] mr-4 object-cover object-center'}
                  src={_media.images?.[0]?.url ?? defaultImage}
                />
                <i class={'basis-full'}>
                  {titleBeforeSubstring}
                  <span class={'bg-yellow-300 text-embed'}>
                    {titleSubstring}
                  </span>
                  {titleAfterSubstring}
                </i>
                <i class={'basis-full'}>
                  {comma(_media.popularity ?? 0)}
                </i>
                <i class={'basis-full'}>
                  {timeString}
                </i>
              </div>
            );
          })}
      </div>

      <Dialog
        name={'media'}
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
                requestAnimationFrame(() => hideDialog('media'));
              }}
            />

            <IconTrash
              class={'w-[24px] h-[24px] cursor-pointer text-red'}
              onClick={() => {
                const i = media.value.findIndex(({ id }) =>
                  signal.value.id === id
                );

                if (i > -1 && confirm(i18n('deleteMedia'))) {
                  media.value.splice(i, 1);
                  forceUpdate();
                  requestAnimationFrame(() => hideDialog('media'));
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
                onMediaUpdate();
                forceUpdate();
              }}
            />
            <div class={'flex flex-col grow gap-4 h-min my-auto'}>
              <TextInput
                class={'text-disabled'}
                placeholder={i18n('imageUrl').toUpperCase()}
                value={signal.value.images?.[0]?.file?.name ??
                  signal.value.images?.[0]?.url}
                onInput={(value) => {
                  signal.value.images = [{ url: value }];
                  onMediaUpdate();
                  forceUpdate();
                }}
                key={`${signal.value.id}-imageurl`}
              />
              <button class={'flex-row w-full grow'}>
                <label class={'grow cursor-pointer'} for={signal.value.id}>
                  {i18n('uploadFromPC')}
                </label>
              </button>
            </div>
          </div>

          <Select
            required
            list={MediaType}
            label={i18n('type')}
            defaultValue={signal.value.type}
            onChange={(t: MediaType) => {
              signal.value.type = t;
              onMediaUpdate();
            }}
          />

          <TextInput
            required
            pattern='.{1,128}'
            label={i18n('title')}
            value={signal.value.title.english ?? ''}
            onInput={(value) => {
              signal.value.title.english = value;
              onMediaUpdate();
            }}
            key={`${signal.value.id}-title`}
          />

          <Select
            list={MediaFormat}
            label={i18n('format')}
            defaultValue={signal.value.format}
            onChange={(f) => {
              // deno-lint-ignore no-explicit-any
              signal.value.format = (f as any) || undefined;
              onMediaUpdate();
            }}
          />

          <TextInput
            min={0}
            max={2147483647}
            type={'number'}
            label={i18n('popularity')}
            value={signal.value.popularity ?? 0}
            hint={i18n('popularityHint')}
            onInput={(value) => {
              signal.value.popularity = Number(value ?? 0);
              onMediaUpdate();
            }}
            key={`${signal.value.id}-popularity`}
          />

          <TextInput
            multiline
            disabled={descriptionLoading}
            pattern='.{1,2048}'
            label={i18n('description')}
            placeholder={i18n('placeholderMediaDescription')}
            value={signal.value.description}
            class={'min-h-[20vh]'}
            onInput={(value) => {
              signal.value.description = value;
              onMediaUpdate();
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

          <div class={'flex flex-col gap-2'}>
            <label class={'uppercase text-disabled text-[0.8rem]'}>
              {i18n('aliases')}
            </label>
            <label class={'text-disabled text-[0.75rem]'}>
              {i18n('aliasesHint')}
            </label>
            <div class={'flex flex-wrap gap-2'}>
              {signal.value.title.alternative?.map((alias, i) => (
                <div
                  class={'flex items-center justify-center bg-embed rounded-[100vw] px-6 py-4 gap-2'}
                  key={i}
                >
                  <i>{alias}</i>
                  <IconTrash
                    class={'w-[16px] h-auto cursor-pointer text-red'}
                    onClick={() => {
                      // deno-lint-ignore no-non-null-assertion
                      signal.value.title.alternative!.splice(i, 1);
                      onMediaUpdate();
                      forceUpdate();
                    }}
                  />
                </div>
              ))}

              {(signal.value.title.alternative?.length ?? 0) < 5
                ? (
                  <div
                    class={'flex items-center justify-center bg-embed rounded-[100vw] px-6 py-4 gap-2'}
                  >
                    <input
                      placeholder={'Harry Potter: 11th Book'}
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
                        if (!signal.value.title.alternative) {
                          signal.value.title.alternative = [];
                        }

                        signal.value.title.alternative.push(
                          newAliasValue.value,
                        );

                        newAliasValue.value = '';

                        onMediaUpdate();

                        forceUpdate();
                      }}
                    />
                  </div>
                )
                : undefined}
            </div>
          </div>

          <div class={'flex flex-col'}>
            <label class={'uppercase text-disabled text-[0.8rem]'}>
              {i18n('relations')}
            </label>
            <div class={'flex flex-col gap-2'}>
              {media.value
                .filter(({ id }) => id !== signal.value.id)
                .map((media, i) => {
                  const defaultValue = Number(
                    signal.value.relations?.findIndex((r) =>
                      r.mediaId === media.id
                    ),
                  );

                  return (
                    <div class={'grid grid-flow-col gap-2'} key={i}>
                      <i class={'flex items-center font-[700]'}>
                        {media.title.english}
                      </i>
                      <Select
                        nullLabel={i18n('none')}
                        list={MediaRelation}
                        defaultValue={defaultValue > -1
                          // deno-lint-ignore no-non-null-assertion
                          ? signal.value.relations![defaultValue].relation
                          : undefined}
                        onChange={(r) => {
                          const exists = Number(
                            signal.value.relations?.findIndex((r) =>
                              r.mediaId === media.id
                            ),
                          );

                          if (exists > -1) {
                            if (r) {
                              // deno-lint-ignore  no-non-null-assertion
                              signal.value.relations![exists].relation =
                                // deno-lint-ignore no-explicit-any
                                r as any;
                            } else {
                              // deno-lint-ignore no-non-null-assertion
                              signal.value.relations!.splice(exists, 1);
                            }
                          } else {
                            if (!signal.value.relations) {
                              signal.value.relations = [];
                            }

                            signal.value.relations.push({
                              mediaId: media.id,
                              // deno-lint-ignore no-explicit-any
                              relation: r as any,
                            });

                            onMediaUpdate();
                          }
                        }}
                      />
                    </div>
                  );
                })}
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
                      onMediaUpdate();
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
                      onMediaUpdate();
                    }}
                    key={`${signal.value.id}-link-${i}-url`}
                  />
                  <IconTrash
                    class={'w-[24px] h-auto cursor-pointer text-red'}
                    onClick={() => {
                      // deno-lint-ignore no-non-null-assertion
                      signal.value.externalLinks!.splice(i, 1);
                      onMediaUpdate();
                      forceUpdate();
                    }}
                  />
                </div>
              ))}
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
            </div>
          </div>
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
