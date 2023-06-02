import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import Dialog from './Dialog.tsx';

import colors from '../utils/theme.ts';

import IconClose from 'icons/x.tsx';
import IconImage from 'icons/photo-plus.tsx';

import type { Schema } from './Dashboard.tsx';

import strings from '../../i18n/en-US.json' assert { type: 'json' };

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
      gridTemplateColumns: 'min-content 1fr min-content',
      gridTemplateRows: 'min-content 1fr',
      padding: '2em',

      '> input': {
        color: '#ffffff',
        background: 'transparent',

        fontFamily: 'Noto Sans, sans-serif',
        fontWeight: 600,
        fontSize: '1.2em',

        lineHeight: 1.5,
        margin: '0 2em',

        border: '0',
        ':focus': {
          outline: '0',
        },
      },
    },
    image: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      width: '48px',
      height: '48px',

      borderRadius: '100%',
      border: `2px solid ${colors.grey}`,

      '> svg': {
        width: '28px',
        height: '28px',
        cursor: 'pointer',
        color: colors.grey,
      },
    },
    input: {
      //
    },
    close: {
      width: '32px',
      height: 'auto',
      cursor: 'pointer',
    },
  });

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>

      <Dialog
        name='manage'
        visible={true}
        class={styles.names.wrapper}
        action={'back'}
      >
        <form class={styles.names.container}>
          <div
            class={styles.names.image}
            style={{
              backgroundImage: `url(${pack.image})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          >
            {!pack.image ? <IconImage /> : undefined}
          </div>

          <input
            type='text'
            placeholder={strings.packTitle}
            value={pack.title ?? pack.id}
            class={styles.names.input}
          />

          <IconClose data-dialog-cancel={'manage'} class={styles.names.close} />
        </form>
      </Dialog>
    </>
  );
};
