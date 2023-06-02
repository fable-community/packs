import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import colors from '../utils/theme.ts';

import type { Schema } from './Dashboard.tsx';

export default ({ pack }: { pack: Schema.Pack }) => {
  const styles = createStyle({
    card: {
      cursor: 'pointer',

      width: '128px',
      minHeight: '32px',

      color: 'inherit',
      backgroundColor: colors.embed,
      textDecoration: 'none',

      borderRadius: '8px',
      padding: '24px 16px',

      transition: 'background-color .125s, box-shadow .125s, transform .125s',

      ':hover': {
        backgroundColor: 'rgb(35, 36, 40)',
        transform: 'translateY(-8px)',
        boxShadow: '0 8px 16px rgba(0,0,0,.2)',
      },
    },
    image: {
      width: '128px',
      height: '128px',
      objectFit: 'cover',
      borderRadius: '8px',
    },
    title: {
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
  });

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>

      <a class={styles.names.card} href={pack.manifest.id}>
        {pack.manifest.image
          ? (
            <img
              src={pack.manifest.image}
              class={styles.names.image}
            />
          )
          : undefined}
        <div class={styles.names.title}>
          {pack.manifest.title ?? pack.manifest.id}
        </div>
      </a>
    </>
  );
};
