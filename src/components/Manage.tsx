import Media from './Media.tsx';
import Maintainers from './Maintainers.tsx';

import ImageInput from './ImageInput.tsx';

import Dialog from './Dialog.tsx';

import IconClose from 'icons/x.tsx';

import type { Schema } from './Dashboard.tsx';

import strings from '../../i18n/en-US.ts';

const imagesTypes = ['image/png', 'image/jpeg', 'image/webp'];

export default (props: { user: string; pack?: Schema.Pack; new?: boolean }) => {
  const data: Partial<Schema.Pack> = props.pack ?? {};
  const pack: Partial<Schema.Pack['manifest']> = data.manifest ?? {};

  return (
    <>
      <Dialog
        visible={true}
        action={'back'}
        name={'manage'}
        class={'manage-wrapper'}
      >
        <form
          method={'post'}
          action={'/api/publish'}
          encType={'multipart/form-data'}
          class={'manage-container'}
        >
          {/* used as a hack to send the existing pack json to the server with the post request */}
          <input type={'hidden'} name={'pack'} value={JSON.stringify(pack)} />

          <ImageInput
            name={'pack_image'}
            default={pack.image}
            accept={[...imagesTypes, 'image/gif']}
          />

          <input
            type={'text'}
            name={'pack_title'}
            placeholder={strings.packTitle}
            value={pack.title ?? pack.id}
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

          <button disabled class={'manage-publish'} type={'submit'}>
            {props.new ? strings.publish : strings.save}
          </button>
        </form>
      </Dialog>
    </>
  );
};
