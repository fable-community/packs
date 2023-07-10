import { useSignal } from '@preact/signals';

import { serialize } from 'bson';

import ImageInput, { type IImageInput } from './ImageInput.tsx';

import Dialog from './Dialog.tsx';

import Notice, { Dismissible } from './Notice.tsx';

import Media from './Media.tsx';
import Characters from './Characters.tsx';
import Maintainers from './Maintainers.tsx';
import Conflicts from './Conflicts.tsx';

import TextInput from './TextInput.tsx';

import IconClose from 'icons/x.tsx';
import IconApply from 'icons/check.tsx';
import IconAdjustments from 'icons/adjustments-horizontal.tsx';
import IconClipboard from 'icons/clipboard-text.tsx';
import IconGrid from 'icons/layout-grid.tsx';
import IconTable from 'icons/table.tsx';

import nanoid from '../utils/nanoid.ts';
import compact from '../utils/compact.ts';

import strings from '../../i18n/en-US.ts';

import type { Data } from '../api/publish.ts';

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

  const onPublish = async () => {
    const body: Data = {
      new: props.new,
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
        class={'manage-wrapper'}
        action={'back'}
      >
        {/* this component require client-side javascript */}
        <noscript>{strings.noScript}</noscript>

        <Dialog name={'extra'} class={'dialog-normal'}>
          <div class={'metadata'}>
            <IconApply data-dialog-cancel={'extra'} class={'close'} />

            {!props.new
              ? (
                <>
                  <label>{strings.packServers.replace(/%/g, servers)}</label>

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
                  <Notice type={'info'}>{strings.privateNotice}</Notice>
                  <button onClick={() => privacy.value = false}>
                    {strings.setPublic}
                  </button>
                </>
              )
              : (
                <>
                  <button onClick={() => privacy.value = true}>
                    {strings.setPrivate}
                  </button>
                </>
              )}

            <TextInput
              value={author}
              label={strings.packAuthor}
              placeholder={strings.placeholder.packAuthor}
              onInput={(value) => author.value = value}
            />

            <TextInput
              multiline
              value={description}
              label={strings.packDescription}
              placeholder={strings.placeholder.packDescription}
              onInput={(value) => description.value = value}
            />

            <TextInput
              value={webhookUrl}
              label={strings.packWebhookUrl}
              hint={strings.packWebhookUrlHint}
              pattern={'https:\/\/discord\.com\/api\/webhooks\/[0-9]{18,19}\/.+'}
              placeholder={'https://discord.com/api/webhooks/185033133521895424/AAabbb'}
              onInput={(value) => webhookUrl.value = value}
            />
          </div>
        </Dialog>

        <div class={'manage-container'}>
          <div class={'manage-header'}>
            <ImageInput
              default={pack.image}
              accept={['image/png', 'image/jpeg', 'image/webp']}
              onChange={(value) => image.value = value}
            />

            <input
              required
              type={'text'}
              value={title}
              pattern='.{3,128}'
              placeholder={strings.packTitle}
              onInput={(
                ev,
              ) => (title.value = (ev.target as HTMLInputElement).value)}
            />

            <div class={'buttons'}>
              <button disabled={loading} onClick={onPublish}>
                {props.new ? strings.publish : strings.save}
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
                {strings.addNewCharacter}
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
                {strings.addNewMedia}
              </button>
            </div>

            {[0, 1].includes(active.value)
              ? (
                layout.value === 0
                  ? <IconTable onClick={() => layout.value = 1} />
                  : <IconGrid onClick={() => layout.value = 0} />
              )
              : undefined}

            <IconAdjustments data-dialog={'extra'} />

            <IconClose data-dialog-cancel={'manage'} />
          </div>

          <div class={'tabs'}>
            {strings.tabs.map((s, i) => (
              <div
                key={i}
                data-selected={active.value === i}
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
