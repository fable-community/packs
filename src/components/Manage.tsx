import { useSignal } from '@preact/signals';

import { serialize } from 'bson';

import ImageInput, { type IImageInput } from './ImageInput.tsx';

import Dialog from './Dialog.tsx';
import Notice from './Notice.tsx';

import Media from './Media.tsx';
import Characters from './Characters.tsx';
import Maintainers from './Maintainers.tsx';

import IconClose from 'icons/x.tsx';

import { Schema } from './Dashboard.tsx';

import strings from '../../i18n/en-US.ts';

import type { Data } from '../api/publish.ts';

export default (props: {
  user: string;
  pack?: Schema.Pack;
  new?: boolean;
}) => {
  const pack: Readonly<Schema.Pack['manifest']> = props.pack?.manifest ??
    { id: '' };

  const loading = useSignal<boolean>(false);
  const error = useSignal<string | undefined>(undefined);

  const title = useSignal<string | undefined>(pack.title);
  const image = useSignal<IImageInput | undefined>(undefined);

  const media = useSignal(pack.media?.new ?? []);
  const characters = useSignal(pack.characters?.new ?? []);

  const onPublish = async () => {
    const body: Data = {
      old: pack,
      title: title.value,
      image: image.value,
      media: media.value,
      characters: characters.value,
    };

    loading.value = true;

    try {
      const response = await fetch(`api/publish`, {
        method: 'POST',
        body: serialize(body),
      });

      if (response.status === 200) {
        open('/?success', '_self');
      } else {
        const t = await response.json();
        console.error(error.value = t);
      }
    } catch (err) {
      console.error(error.value = err?.message);
    } finally {
      loading.value = false;
    }
  };

  return (
    <>
      {error.value ? <Notice text={error.value} type={'error'} /> : undefined}

      <Dialog
        visible={true}
        name={'manage'}
        class={'manage-wrapper'}
        action={'back'}
      >
        {/* this component require client-side javascript */}
        <noscript>{strings.noScript}</noscript>

        <div class={'manage-container'}>
          <div class={'manage-header'}>
            <ImageInput
              default={pack.image}
              accept={['image/png', 'image/jpeg', 'image/webp', 'image/gif']}
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

            <button disabled={loading} onClick={onPublish}>
              {props.new ? strings.publish : strings.save}
            </button>

            <IconClose data-dialog-cancel={'manage'} class={'manage-close'} />
          </div>

          <div class={'manage-boxes'}>
            <Characters characters={characters} />
            <Media media={media} />

            <i />

            <Maintainers
              list={props.new
                ? [props.user]
                : [props.pack?.owner, ...pack.maintainers ?? []]}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
