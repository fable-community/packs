import { useSignal } from '@preact/signals';

import { serialize } from 'bson';

import ImageInput, { type IImageInput } from '../components/ImageInput.tsx';

import Dialog from '../components/Dialog.tsx';

import Notice, { Dismissible } from '../components/Notice.tsx';

import Media from '../components/Media.tsx';
import Characters from '../components/Characters.tsx';
import Maintainers from '../components/Maintainers.tsx';
import Conflicts from '../components/Conflicts.tsx';

import TextInput from '../components/TextInput.tsx';

import IconClose from 'icons/x.tsx';
import IconApply from 'icons/check.tsx';
import IconAdjustments from 'icons/adjustments-horizontal.tsx';
import IconClipboard from 'icons/clipboard-text.tsx';
import IconGrid from 'icons/layout-grid.tsx';
import IconTable from 'icons/table.tsx';

import nanoid from '../utils/nanoid.ts';
import compact from '../utils/compact.ts';

import { i18n, locale } from '../utils/i18n.ts';

import type { Data } from '../routes/api/publish.ts';

import {
  Character,
  Media as TMedia,
  MediaType,
  Pack,
  User,
} from '../utils/types.ts';

export default (props: {
  user: User;
  pack?: Pack;
  new?: boolean;
}) => {
  const servers = compact(props.pack?.servers ?? 0);

  const pack: Readonly<Pack['manifest']> = props.pack?.manifest
    ? JSON.parse(JSON.stringify(props.pack?.manifest))
    : { id: '' };

  const layout = useSignal<number>(1);
  const active = useSignal<number>(0);

  const loading = useSignal<boolean>(false);
  const error = useSignal<string | undefined>(undefined);

  const title = useSignal<string | undefined>(pack.title);
  const privacy = useSignal<boolean | undefined>(pack.private);
  const author = useSignal<string | undefined>(pack.author);
  const description = useSignal<string | undefined>(pack.description);
  const webhookUrl = useSignal<string | undefined>(pack.webhookUrl);
  const image = useSignal<IImageInput | undefined>(undefined);

  const media = useSignal(pack.media?.new ?? []);
  const characters = useSignal(pack.characters?.new ?? []);

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

  const getData = (): Data => ({
    old: props.pack?.manifest ?? pack,
    title: title.value,
    private: privacy.value,
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
      new: props.new,
      username: props.user.display_name ??
        props.user.username ?? 'undefined',
    };

    loading.value = true;

    try {
      const response = await fetch(`api/publish`, {
        method: 'POST',
        body: serialize(body),
      });

      if (response.status === 200) {
        open(props.new ? `/?success=${await response.text()}` : '/', '_self');
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
                document.querySelector('.manage-wrapper')
                  ?.setAttribute('shake', 'true');
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

  const onExport = () => {
    const data = getData();

    const blob = new Blob([
      JSON.stringify(data),
    ], { type: 'application/json' });

    const downloadFile = document.createElement('a');

    downloadFile.innerHTML = '';

    downloadFile.download = `${props.pack?.manifest?.id ?? 'new'}-export.json`;

    if (window.webkitURL) {
      // Chrome allows the link to be clicked without actually adding it to the DOM.
      downloadFile.href = window.webkitURL.createObjectURL(blob);
    } else {
      // Firefox requires the link to be added to the DOM before it can be clicked.

      downloadFile.href = window.URL.createObjectURL(blob);

      downloadFile.onclick = (ev) => {
        document.body.removeChild(ev.target as HTMLAnchorElement);
      };

      downloadFile.style.display = 'none';

      document.body.appendChild(downloadFile);
    }

    downloadFile.click();
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

      <Dialog
        visible={true}
        name={'manage'}
        class={'top-0 left-0 w-full h-full'}
        action={'back'}
      >
        {/* this component require client-side javascript enabled */}
        <noscript>{i18n('noScript')}</noscript>

        <Dialog
          name={'extra'}
          class={'flex items-center justify-center w-full h-full left-0 top-0 pointer-events-none'}
        >
          <div
            class={'metadata embed2 overflow-x-hidden overflow-y-auto rounded-[10px] m-4 p-4 h-[60vh] w-[60vw] max-w-[500px] pointer-events-auto'}
          >
            <IconApply
              data-dialog-cancel={'extra'}
              class={'cursor-pointer w-[28px] h-[28px] ml-auto'}
            />

            {!props.new
              ? (
                <>
                  <label>{i18n('packServers', servers)}</label>

                  <div
                    class={'install-info'}
                    data-clipboard={`/community install id: ${pack.id}`}
                  >
                    <i>{`/community install id: ${pack.id}`}</i>
                    <IconClipboard />
                  </div>
                </>
              )
              : undefined}

            {privacy.value
              ? (
                <>
                  <Notice type={'info'}>{i18n('privateNotice')}</Notice>
                  <button onClick={() => privacy.value = false}>
                    {i18n('setPublic')}
                  </button>
                </>
              )
              : (
                <>
                  <button onClick={() => privacy.value = true}>
                    {i18n('setPrivate')}
                  </button>
                </>
              )}

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

            <button onClick={onExport} class={'export'}>
              {i18n('export')}
            </button>
          </div>
        </Dialog>

        <div class={'embed m-4 w-full h-full'}>
          <div class={'manage-header flex items-center gap-4 w-full'}>
            <ImageInput
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
              class={'embed h-[48px] grow'}
              placeholder={i18n('packTitle')}
              onInput={(
                ev,
              ) => (title.value = (ev.target as HTMLInputElement).value)}
            />

            <div class={'flex fixed mx-2 my-4 bottom-0 right-0 gap-1 z-1'}>
              <button disabled={loading} onClick={onPublish}>
                {props.new ? i18n('publish') : i18n('save')}
              </button>

              <button
                data-dialog={'characters'}
                style={{ display: active.value === 0 ? '' : 'none' }}
                onClick={() => {
                  const item: Character = {
                    id: `${nanoid(4)}`,
                    name: { english: '' },
                  };

                  characters.value = [item, ...characters.value];

                  characterSignal.value = item;
                }}
              >
                {i18n('addNewCharacter')}
              </button>

              <button
                data-dialog={'media'}
                style={{ display: active.value === 1 ? '' : 'none' }}
                onClick={() => {
                  const item: TMedia = {
                    type: MediaType.Anime,
                    id: `${nanoid(4)}`,
                    title: { english: '' },
                  };

                  media.value = [item, ...media.value];

                  mediaSignal.value = item;
                }}
              >
                {i18n('addNewMedia')}
              </button>
            </div>

            {
              /* {[0, 1].includes(active.value)
              ? (
                layout.value === 0
                  ? <IconTable onClick={() => layout.value = 1} />
                  : <IconGrid onClick={() => layout.value = 0} />
              )
              : undefined} */
            }

            <IconAdjustments
              class={'w-[28px] h-[28px]'}
              data-dialog={'extra'}
            />
            <IconClose
              class={'w-[28px] h-[28px]'}
              data-dialog-cancel={'manage'}
            />
          </div>

          <div class={'grid grid-flow-col overflow-auto'}>
            {(i18n('tabs') as unknown as string[])
              .map((s, i) => (
                <div
                  key={i}
                  class={[
                    'text-center px-1 py-2 font-[600] uppercase cursor-pointer border-b-2 hover:border-white',
                    active.value === i ? 'border-white' : 'border-grey',
                  ].join(' ')}
                  onClick={() => active.value = i}
                >
                  {s}
                </div>
              ))}
          </div>

          <Characters
            layout={layout}
            signal={characterSignal}
            visible={active.value === 0}
            characters={characters}
            media={media}
          />

          <Media
            layout={layout}
            signal={mediaSignal}
            visible={active.value === 1}
            characters={characters}
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
      </Dialog>
    </>
  );
};
