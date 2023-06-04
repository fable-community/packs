import '#filter-boolean';

import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import colors from '../utils/theme.ts';

import IconPlus from 'icons/plus.tsx';

import type { Schema } from './Dashboard.tsx';

export default (
  { show, pack }: {
    show: 'media' | 'characters';
    pack: Partial<Schema.Pack['manifest']>;
  },
) => {
  const styles = createStyle({
    container: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: '1em',

      '> *': {
        objectFit: 'cover',
        objectPosition: 'center',
        aspectRatio: '90/127',
        color: colors.grey,
        width: 'auto',
        height: '90px',
      },

      '> img': {
        backgroundColor: colors.grey,
      },
    },
    button: {
      display: 'flex',
      cursor: 'pointer',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      border: `2px solid ${colors.grey}`,

      '> svg': {
        width: '32px',
        height: '32px',
      },
    },
  });

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>
      <div class={styles.names.container}>
        {pack[show]?.new?.map((t) => <img src={t.images?.[0].url} />)}
        {
          <div disabled class={styles.names.button}>
            <IconPlus />
          </div>
        }
      </div>
    </>
  );
};
