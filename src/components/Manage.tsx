import { useMemo } from 'preact/hooks';

import { computed, useSignal } from '@preact/signals';

import Media, { Editable } from './Media.tsx';

import Maintainers from './Maintainers.tsx';

import ImageInput from './ImageInput.tsx';

import Dialog from './Dialog.tsx';

import IconClose from 'icons/x.tsx';

import { Schema } from './Dashboard.tsx';

import strings from '../../i18n/en-US.ts';

export default (props: {
  user: string;
  dryRun?: boolean;
  pack?: Schema.Pack;
  new?: boolean;
}) => {
  const data: Partial<Schema.Pack> = props.pack ?? {};
  const pack: Partial<Schema.Pack['manifest']> = data.manifest ?? {};

  const packTitle = useSignal<string | undefined>(pack.title);
  const packImage = useSignal<string | undefined>(undefined);

  const [readonly, signal] = useMemo(() => {
    const media: Record<string, Editable> = {};
    const characters: Record<string, Editable> = {};

    (pack.media?.new ?? []).map((_mdia) =>
      media[_mdia.id] = {
        id: _mdia.id,
        title: _mdia.title.english,
        description: _mdia.description,
        image: _mdia.images?.[0].url,
      }
    );

    (pack.characters?.new ?? []).map((char) =>
      characters[char.id] = {
        id: char.id,
        title: char.name.english,
        description: char.description,
        image: char.images?.[0].url,
      }
    );

    const data = { media, characters };

    return [
      data,
      computed(() => {
        return { ...data };
      }),
    ];
  }, [pack]);

  const onClick = () => {
    if (props.dryRun) {
      console.warn('opt out of publishing (dry run is set to "1")');
      console.log(packTitle.value);
      console.log(packImage.value);
      console.log(signal.peek().media);
      console.log(signal.peek().characters);
      return;
    }
  };

  return (
    <>
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
              onChange={(url) => packImage.value = url}
            />

            <input
              type={'text'}
              value={packTitle}
              placeholder={strings.packTitle}
              onInput={(
                ev,
              ) => (packTitle.value = (ev.target as HTMLInputElement).value)}
            />

            <button disabled={!props.dryRun} onClick={onClick}>
              {props.new ? strings.publish : strings.save}
            </button>

            <IconClose data-dialog-cancel={'manage'} class={'manage-close'} />
          </div>

          <div class={'manage-boxes'}>
            <Media
              name={'characters'}
              readonly={readonly}
              media={signal.value}
            />

            <Media
              name={'media'}
              readonly={readonly}
              media={signal.value}
            />

            <i />

            <Maintainers
              list={props.new
                ? [props.user]
                : [data.owner, ...pack.maintainers ?? []]}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
