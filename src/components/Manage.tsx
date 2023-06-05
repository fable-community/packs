import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import { Static as Media } from './Media.tsx';
import { Static as Maintainers } from './Maintainers.tsx';
import { Static as ImageInput } from './ImageInput.tsx';

import Dialog from './Dialog.tsx';

import colors from '../utils/theme.ts';

import IconClose from 'icons/x.tsx';
import IconImage from 'icons/photo-plus.tsx';

import type { Schema } from './Dashboard.tsx';

import strings from '../../i18n/en-US.json' assert { type: 'json' };

const imagesTypes = ['image/png', 'image/jpeg', 'image/webp'];

export default (props: { user: string; pack?: Schema.Pack; new?: boolean }) => {
  const data: Partial<Schema.Pack> = props.pack ?? {};
  const pack: Partial<Schema.Pack['manifest']> = data.manifest ?? {};

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
      gridTemplateRows: '48px 1fr',
      gridTemplateAreas: '". . ." "_ _ _"',
      margin: '1.5em',
      width: 'calc(100% - 3em)',
      height: 'calc(100% - 3em)',
      gap: '2em',
    },
    threeBoxes: {
      gridArea: '_',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',

      '> div': {
        padding: '1em',
        border: `2px solid ${colors.grey}`,
        boxSizing: 'border-box',
        borderRadius: '12px',
        overflow: 'hidden auto',
        margin: '1.5em',
      },

      '@media (min-width: 850px)': {
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
        overflow: 'hidden',
        '> div': {
          maxWidth: '400px',
          width: 'calc(50% - 3em)',
          height: 'calc(50% - 3em)',
        },
        '> i': {
          flexBasis: '100%',
        },
      },
    },
    publish: {
      position: 'fixed',
      backgroundColor: colors.discord,
      margin: '1.5em 3em',
      bottom: '0',
      right: '0',
    },
  });

  const header = createStyle({
    packImage: {
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

      '> input': { width: '0' },

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
  });

  return (
    <>
      <Head>
        <style>{styles.bundle + header.bundle}</style>
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

          <IconClose data-dialog-cancel={'manage'} class={header.names.close} />

          <div class={styles.names.threeBoxes}>
            <Media pack={pack} show={'characters'} />
            <Media pack={pack} show={'media'} />
            <i />
            <Maintainers
              list={props.new
                ? [props.user]
                : [data.owner, ...pack.maintainers ?? []]}
            />
          </div>

          <button disabled class={styles.names.publish} type={'submit'}>
            {props.new ? strings.publish : strings.save}
          </button>
        </form>
      </Dialog>
    </>
  );
};
