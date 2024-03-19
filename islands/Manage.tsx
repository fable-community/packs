import { useSignal } from '@preact/signals';

import { useCallback, useEffect } from 'preact/hooks';

import { serialize } from 'bson';

import ImageInput, { type IImageInput } from '~/components/ImageInput.tsx';

import Dialog from '~/components/Dialog.tsx';

import { Dismissible } from '~/components/Notice.tsx';

import Media from '~/components/Media.tsx';
import Characters from '~/components/Characters.tsx';
import Maintainers from '~/components/Maintainers.tsx';
import Conflicts from '~/components/Conflicts.tsx';

import TextInput from '~/components/TextInput.tsx';
import PublishPopup from '~/components/PublishPopup.tsx';

import HowToInstallDialog from '~/components/HowToInstallDialog.tsx';

import { useEffectIgnoreMount } from '~/components/useEffectIgnoreMount.tsx';

import IconHome from 'icons/arrow-left.tsx';
import IconApply from 'icons/check.tsx';
import IconAdjustments from 'icons/adjustments-horizontal.tsx';
import IconCheckmark from 'icons/check.tsx';
import IconClipboard from 'icons/clipboard-text.tsx';
import IconWorld from 'icons/world.tsx';
import IconLock from 'icons/lock.tsx';
import IconDownload from 'icons/download.tsx';
import IconAlert from 'icons/alert-triangle.tsx';

import compact from '~/utils/compact.ts';

import {
  sortCharacters as _sortCharacters,
  sortMedia as _sortMedia,
} from '~/utils/sorting.ts';

import { i18n } from '~/utils/i18n.ts';

import type { Data } from '~/routes/api/publish.ts';

import {
  type Character,
  type CharacterSorting,
  type Media as TMedia,
  type MediaSorting,
  MediaType,
  type Pack,
  type SortingOrder,
  type User,
} from '~/utils/types.ts';

export default (props: {
  user: User;
  pack?: Pack;
  new?: boolean;
}) => {
  const pack: Readonly<Pack['manifest']> = props.pack?.manifest
    ? JSON.parse(JSON.stringify(props.pack?.manifest))
    : { id: '' };

  const active = useSignal(0);

  const dirty = useSignal(false);
  const loading = useSignal(false);
  const error = useSignal<string | undefined>(undefined);

  const newPack = useSignal(props.new || false);

  const howToInstallVisible = useSignal(false);

  const packId = useSignal<string>(pack.id);
  const title = useSignal<string | undefined>(pack.title);
  const privacy = useSignal<boolean | undefined>(pack.private);
  const nsfw = useSignal<boolean | undefined>(pack.nsfw);
  const author = useSignal<string | undefined>(pack.author);
  const description = useSignal<string | undefined>(pack.description);
  const webhookUrl = useSignal<string | undefined>(pack.webhookUrl);
  const image = useSignal<IImageInput | undefined>(undefined);

  const maintainers = useSignal(pack.maintainers ?? []);
  const conflicts = useSignal(pack.conflicts ?? []);

  const characterSignal = useSignal<Character>({
    name: { english: '' },
    id: '',
  });

  const mediaSignal = useSignal<TMedia>({
    type: MediaType.Anime,
    title: { english: '' },
    id: '',
  });

  const mediaSorting = useSignal<MediaSorting>('updated');
  const mediaSortingOrder = useSignal<SortingOrder>('desc');

  const charactersSorting = useSignal<CharacterSorting>('updated');
  const charactersSortingOrder = useSignal<SortingOrder>('desc');

  const media = useSignal(
    _sortMedia(
      pack.media?.new ?? [],
      mediaSorting.value,
      mediaSortingOrder.value,
    ),
  );

  const characters = useSignal(
    _sortCharacters(
      pack.characters?.new ?? [],
      media.value,
      charactersSorting.value,
      charactersSortingOrder.value,
    ),
  );

  const sortMedia = useCallback(() => {
    media.value = _sortMedia(
      media.value,
      mediaSorting.value,
      mediaSortingOrder.value,
    );
  }, []);

  const sortCharacters = useCallback(() => {
    characters.value = _sortCharacters(
      characters.value,
      media.value,
      charactersSorting.value,
      charactersSortingOrder.value,
    );
  }, []);

  useEffect(() => {
    sortMedia();
  }, [mediaSorting.value, mediaSortingOrder.value]);

  useEffect(() => {
    sortCharacters();
  }, [charactersSorting.value, charactersSortingOrder.value]);

  useEffectIgnoreMount(() => {
    dirty.value = true;
  }, [
    title.value,
    nsfw.value,
    privacy.value,
    author.value,
    description.value,
    webhookUrl.value,
    image.value,
    //
    media.value.length,
    characters.value.length,
    maintainers.value.length,
    conflicts.value.length,
  ]);

  const getData = (): Data => ({
    old: props.pack?.manifest ?? pack,
    title: title.value,
    private: privacy.value,
    nsfw: nsfw.value,
    author: author.value,
    description: description.value,
    webhookUrl: webhookUrl.value,
    image: image.value,
    media: media.value,
    characters: characters.value,
    maintainers: maintainers.value,
    conflicts: conflicts.value,
  });

  const onPublish = async () => {
    const body = {
      ...getData(),
      new: newPack.value,
      username: props.user.display_name ??
        props.user.username ?? 'undefined',
    };

    loading.value = true;

    try {
      const response = await fetch(`/api/publish`, {
        method: 'POST',
        body: serialize(body),
      });

      if (response.status === 200) {
        packId.value = await response.text();

        dirty.value = false;
        loading.value = false;
        howToInstallVisible.value = newPack.value;
        newPack.value = false;
      } else {
        const { errors, pack } = await response.json() as {
          pack: {
            media?: { id: string }[];
            characters?: { id: string }[];
          };
          errors: {
            instancePath: string;
            keyword: string;
            message: string;
            params: { limit?: number };
            schemaPath: string;
          }[];
        };

        document.querySelectorAll(`[invalid]`).forEach((ele) =>
          ele.removeAttribute(`invalid`)
        );

        document.querySelectorAll(`[shake]`).forEach((ele) =>
          ele.removeAttribute(`shake`)
        );

        console.error(errors);

        errors.forEach((err) => {
          const path = err.instancePath
            .substring(1)
            .split('/');

          console.error(path);

          if (path[0] === 'media' || path[0] === 'characters') {
            if (path[1] === 'new') {
              const i = parseInt(path[2]);

              const item = path[0] === 'characters'
                // deno-lint-ignore no-non-null-assertion
                ? pack.characters![i]
                // deno-lint-ignore no-non-null-assertion
                : pack.media![i];

              const child = document.querySelector(`._${item.id}`);

              setTimeout(() => {
                child?.setAttribute('shake', 'true');
                child?.setAttribute('invalid', 'true');
              }, 100);
            }
          }
        });
      }
    } catch (err) {
      console.error(error.value = err?.message);
    } finally {
      loading.value = false;
    }
  };

  return (
    <>
      {error.value
        ? (
          <Dismissible type={'error'}>
            {error.value}
          </Dismissible>
        )
        : undefined}

      <div
        class={'flex fixed top-0 left-0 w-full h-full bg-embed overflow-x-hidden overflow-y-auto'}
      >
        {/* this component require client-side javascript enabled */}
        <noscript>{i18n('noScript')}</noscript>

        <HowToInstallDialog
          packId={packId.value}
          visible={howToInstallVisible.value}
        />

        <div class={'m-4 w-full h-full'}>
          <div class={'flex items-center gap-4 w-full'}>
            <a href={'/dashboard'}>
              <IconHome class={'w-[28px] h-[28px] cursor-pointer'} />
            </a>

            <ImageInput
              name={'pack-image'}
              default={pack.image}
              class={'w-[44px] aspect-square rounded-full'}
              accept={['image/png', 'image/jpeg', 'image/webp']}
              onChange={(value) => image.value = value}
            />

            <input
              required
              type={'text'}
              value={title}
              pattern='.{3,128}'
              class={'bg-embed h-[48px] grow'}
              placeholder={i18n('packTitle')}
              onInput={(
                ev,
              ) => (title.value = (ev.target as HTMLInputElement).value)}
            />

            <PublishPopup
              new={newPack.value}
              loading={loading.value}
              dirty={dirty.value}
              onPublish={onPublish}
            />

            <IconAdjustments
              class={'w-[28px] h-[28px] cursor-pointer'}
              data-dialog={'extra'}
            />
          </div>

          <div class={'grid grid-flow-col overflow-auto mt-2'}>
            {(i18n('tabs') as unknown as string[])
              .map((s, i) => (
                <div
                  key={i}
                  class={[
                    'text-center px-1 py-4 font-[600] uppercase cursor-pointer border-b-2 hover:border-white',
                    active.value === i ? 'border-white' : 'border-grey',
                  ].join(' ')}
                  onClick={() => active.value = i}
                >
                  {s}
                </div>
              ))}
          </div>

          <Characters
            dirty={dirty}
            signal={characterSignal}
            visible={active.value === 0}
            order={charactersSortingOrder}
            sorting={charactersSorting}
            sortCharacters={sortCharacters}
            characters={characters}
            media={media}
          />

          <Media
            dirty={dirty}
            signal={mediaSignal}
            visible={active.value === 1}
            order={mediaSortingOrder}
            sorting={mediaSorting}
            sortMedia={sortMedia}
            // characters={characters}
            media={media}
          />

          <Maintainers
            visible={active.value === 2}
            owner={props.pack?.owner ?? props.user.id}
            maintainers={maintainers}
          />

          <Conflicts
            visible={active.value === 3}
            conflicts={conflicts}
          />
        </div>

        <Dialog
          name={'extra'}
          class={'flex items-center justify-center w-full h-full left-0 top-0 pointer-events-none'}
        >
          <div
            class={'flex flex-col gap-6 bg-embed2 overflow-x-hidden overflow-y-auto rounded-xl m-4 p-6 h-[80vh] w-[70vw]  pointer-events-auto'}
          >
            <IconApply
              data-dialog-cancel={'extra'}
              class={'cursor-pointer w-[28px] h-[28px] ml-auto shrink-0	'}
            />

            {!newPack.value
              ? (
                <>
                  {/* TODO not currently available */}
                  {
                    /* <div class={'flex gap-3 text-white opacity-90 uppercase'}>
                    <IconDownload class={'w-4 h-4'} />
                    {i18n('packServers', props.pack?.servers)}
                  </div> */
                  }

                  <div
                    class={'bg-highlight flex items-center p-4 rounded-xl'}
                    data-clipboard={`/packs install id: ${packId.value}`}
                  >
                    <i class={'italic grow select-all'}>
                      {`/packs install id: ${packId.value}`}
                    </i>
                    <IconClipboard class={'w-[18px] h-[18px] cursor-pointer'} />
                  </div>
                </>
              )
              : undefined}

            <div class={'flex flex-col grow gap-2'}>
              <label class={'uppercase text-[0.8rem] text-disabled'}>
                {i18n('packVisibility')}
              </label>

              <div
                class={'flex flex-col rounded-xl overflow-hidden'}
              >
                <button
                  onClick={() => privacy.value = false}
                  class={'py-4 justify-start text-left flex gap-4 bg-embed hover:shadow-none'}
                >
                  <IconCheckmark
                    class={['w-[24px]', privacy.value ? 'opacity-0' : ''].join(
                      ' ',
                    )}
                  />
                  <span class={'grow'}>{i18n('publicPackNotice')}</span>
                  <IconWorld class={'w-6 h-6'} />
                </button>
                <button
                  onClick={() => privacy.value = true}
                  class={'py-4 justify-start text-left flex gap-4 bg-embed hover:shadow-none'}
                >
                  <IconCheckmark
                    class={['w-[24px]', privacy.value ? '' : 'opacity-0'].join(
                      ' ',
                    )}
                  />
                  <span class={'grow'}>{i18n('privatePackNotice')}</span>
                  <IconLock class={'w-6 h-6'} />
                </button>
              </div>
            </div>

            <div class={'flex flex-col grow gap-2'}>
              <label class={'uppercase text-[0.8rem] text-disabled'}>
                {i18n('packNSFW')}
              </label>

              <div
                class={'flex flex-col rounded-xl overflow-hidden'}
              >
                <button
                  onClick={() => nsfw.value = !nsfw.value}
                  class={'py-4 justify-start text-left flex gap-4 bg-embed hover:shadow-none'}
                >
                  <IconCheckmark
                    class={['w-[24px]', !nsfw.value ? 'opacity-0' : ''].join(
                      ' ',
                    )}
                  />
                  <span class={'grow'}>{i18n('packNSFWHint')}</span>
                  <IconAlert class={'w-6 h-6'} />
                </button>
              </div>
            </div>

            <TextInput
              value={author}
              label={i18n('packAuthor')}
              placeholder={i18n('placeholderPackAuthor')}
              onInput={(value) => author.value = value}
            />

            <TextInput
              multiline
              value={description}
              label={i18n('packDescription')}
              placeholder={i18n('placeholderPackDescription')}
              onInput={(value) => description.value = value}
            />

            <TextInput
              value={webhookUrl}
              label={i18n('packWebhookUrl')}
              hint={i18n('packWebhookUrlHint')}
              pattern={'https:\/\/discord\.com\/api\/webhooks\/[0-9]{18,19}\/.+'}
              placeholder={'https://discord.com/api/webhooks/185033133521895424/AAabbb'}
              onInput={(value) => webhookUrl.value = value}
            />
          </div>
        </Dialog>
      </div>
    </>
  );
};
