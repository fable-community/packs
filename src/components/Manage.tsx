import { useMemo } from 'preact/hooks';

import { computed, useSignal } from '@preact/signals';

import { serialize } from 'bson';

import Media, { Editable } from './Media.tsx';

import Maintainers from './Maintainers.tsx';

import ImageInput, { type IImageInput } from './ImageInput.tsx';

import Dialog from './Dialog.tsx';
import Notice from './Notice.tsx';

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

  const packTitle = useSignal<string | undefined>(pack.title);
  const packImage = useSignal<IImageInput | undefined>(undefined);

  const [readonly, signal] = useMemo(() => {
    const media: Editable[] = (pack.media?.new ?? []).map((media) => ({
      id: media.id,
      title: media.title.english,
      description: media.description,
      image: {
        url: media.images?.[0]?.url,
      } as IImageInput,
    }));

    const characters: Editable[] = (pack.characters?.new ?? []).map((char) => ({
      id: char.id,
      title: char.name.english,
      description: char.description,
      image: {
        url: char.images?.[0]?.url,
      } as IImageInput,
    }));

    const data = { media, characters };

    return [
      data,
      computed(() => {
        return { ...data };
      }),
    ];
  }, [pack]);

  const onPublish = async () => {
    const body: Data = {
      pack,
      packTitle: packTitle.value,
      packImage: packImage.value,
      media: signal.value.media,
      characters: signal.value.characters,
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
              onChange={(value) => packImage.value = value}
            />

            <input
              required
              type={'text'}
              value={packTitle}
              pattern='.{3,128}'
              placeholder={strings.packTitle}
              onInput={(
                ev,
              ) => (packTitle.value = (ev.target as HTMLInputElement).value)}
            />

            <button disabled={loading} onClick={onPublish}>
              {props.new ? strings.publish : strings.save}
            </button>

            <IconClose data-dialog-cancel={'manage'} class={'manage-close'} />
          </div>

          <div class={'manage-boxes'}>
            <Media
              name={'characters'}
              readonly={readonly}
              pack={signal.value}
            />

            <Media
              name={'media'}
              readonly={readonly}
              pack={signal.value}
            />

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
