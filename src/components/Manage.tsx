import { useSignal } from '@preact/signals';

import Media from './Media.tsx';

import Maintainers from './Maintainers.tsx';

import ImageInput from './ImageInput.tsx';

import Dialog from './Dialog.tsx';

import IconClose from 'icons/x.tsx';

import { Schema } from './Dashboard.tsx';

import strings from '../../i18n/en-US.ts';

const imagesTypes = ['image/png', 'image/jpeg', 'image/webp'];

export default (props: { user: string; pack?: Schema.Pack; new?: boolean }) => {
  const data: Partial<Schema.Pack> = props.pack ?? {};
  const pack: Partial<Schema.Pack['manifest']> = data.manifest ?? {};

  const packTitle = useSignal(pack.title ?? pack.id);
  const packImage = useSignal<Blob | undefined>(undefined);

  const onClick = () => {
    console.log(packTitle.value);
    console.log(packImage.value);
  };

  return (
    <>
      <Dialog
        visible={true}
        action={'back'}
        name={'manage'}
        class={'manage-wrapper'}
      >
        <div class={'manage-container'}>
          <ImageInput
            name={'pack_image'}
            default={pack.image}
            accept={[...imagesTypes, 'image/gif']}
            onChange={(value) => packImage.value = value}
          />

          <input
            type={'text'}
            name={'pack_title'}
            placeholder={strings.packTitle}
            value={packTitle}
            onInput={(
              event,
              // deno-lint-ignore ban-ts-comment
              // @ts-ignore
            ) => (packTitle.value = event.target.value)}
          />

          <IconClose data-dialog-cancel={'manage'} class={'manage-close'} />

          <div class={'manage-boxes'}>
            <Media pack={pack} show={'characters'} />
            <Media pack={pack} show={'media'} />
            <i />
            <Maintainers
              list={props.new
                ? [props.user]
                : [data.owner, ...pack.maintainers ?? []]}
            />
          </div>

          <button class={'manage-publish'} disabled onClick={onClick}>
            {props.new ? strings.publish : strings.save}
          </button>
        </div>
      </Dialog>
    </>
  );
};
