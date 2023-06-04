import '#filter-boolean';

import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import colors from '../utils/theme.ts';

import IconPlus from 'icons/plus.tsx';

export default ({ list }: { list: (string | undefined)[] }) => {
  const styles = createStyle({
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, 32px)',
      gridTemplateRows: 'repeat(auto-fill, 32px)',
      justifyContent: 'center',
      gap: '1em',

      '> *': {
        width: '100%',
        height: '100%',
        borderRadius: '100%',
        color: colors.grey,
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
        width: '18px',
        height: '18px',
      },
    },
  });

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>
      <div class={styles.names.container}>
        {list
          .filter(Boolean)
          .map((id) => (
            <img
              src={`https://discord-avatar.deno.dev/?id=${id}`}
            />
          ))}
        <div disabled class={styles.names.button}>
          <IconPlus />
        </div>
      </div>
    </>
  );
};
