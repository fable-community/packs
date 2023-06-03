import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import Dialog from './Dialog.tsx';

import colors from '../utils/theme.ts';

import IconClose from 'icons/x.tsx';
import IconImage from 'icons/photo-plus.tsx';

import type { Schema } from './Dashboard.tsx';

import strings from '../../i18n/en-US.json' assert { type: 'json' };

const imagesTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
];

export default (props: { pack?: Schema.Pack }) => {
  const pack: Partial<Schema.Pack['manifest']> = props.pack?.manifest ?? {};

  const styles = createStyle({
    wrapper: {
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: colors.embedHighlight,
    },
    container: {
      display: 'grid',
      alignItems: 'center',
      gridTemplateColumns: '48px 1fr 32px',
      gridTemplateRows: '48px auto',
      gridTemplateAreas: '". . ." "_ _ _"',
      padding: '1.5em',
      gap: '2em',
    },
    image: {
      display: 'flex',
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',

      overflow: 'hidden',
      borderRadius: '100%',
      height: '100%',
      width: '100%',

      border: `2px solid ${colors.grey}`,

      '> input': {
        width: '0',
      },

      '> img': {
        position: 'absolute',
        objectFit: 'cover',
        objectPosition: 'center',
        textIndent: '-100vh',
        height: '100%',
        width: '100%',
      },

      '> label': {
        position: 'absolute',
        width: '100%',
        height: '100%',
        cursor: 'pointer',
      },

      '> svg': {
        position: 'absolute',
        width: '28px',
        height: 'auto',
        color: colors.grey,
      },
    },
    close: {
      width: '100%',
      height: 'auto',
      cursor: 'pointer',
    },
    button: {
      position: 'fixed',
      backgroundColor: colors.discord,
      bottom: '0',
      right: '0',
      margin: '1.5em 3em',
    },
    body: {
      gridArea: '_',
      background: colors.red,
      height: '100px',
    },
  });

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>

      <Dialog
        action={'back'}
        name={'manage'}
        visible={true}
        class={styles.names.wrapper}
      >
        <form
          method={'post'}
          action={'/api/publish'}
          encType={'multipart/form-data'}
          class={styles.names.container}
        >
          {/* used as a hack to send the existing pack json to the server with the post request */}
          <input type={'hidden'} name={'pack'} value={JSON.stringify(pack)} />

          <div class={styles.names.image}>
            <IconImage />
            <img src={pack.image ?? ''} data-image-cb={'pack_image'} />
            <label for={'pack_image'} />
            <input
              type={'file'}
              id={'pack_image'}
              name={'pack_image'}
              data-image={'pack_image'}
              accept={[...imagesTypes, 'image/gif'].join(',')}
            />
          </div>

          <input
            type={'text'}
            name={'pack_title'}
            placeholder={strings.packTitle}
            value={pack.title ?? pack.id}
          />

          <IconClose data-dialog-cancel={'manage'} class={styles.names.close} />

          {
            // <button class={styles.names.button} type='submit'>
            //   {strings.publish}
            // </button>
          }

          <div class={styles.names.body}>
            {/*  */}
          </div>
        </form>
      </Dialog>
    </>
  );
};
