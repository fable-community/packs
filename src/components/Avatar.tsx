import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import colors from '../utils/theme.ts';

import Dialog from './Dialog.tsx';

import LogoutIcon from 'icons/logout.tsx';

export default ({ id, avatar }: { id?: string; avatar?: string }) => {
  const styles = createStyle({
    logo: {
      cursor: 'pointer',
      position: 'fixed',
      width: '32px',
      height: '32px',
      top: '2em',
      right: '2em',
      borderRadius: '100%',
    },
    button: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gridAutoFlow: 'column',
      alignItems: 'center',
      gap: '0.5em',

      cursor: 'pointer',
      backgroundColor: colors.grey,
      fontFamily: 'inherit',
      fontSize: 'inherit',
      fontWeight: 600,

      border: '0',
      minWidth: '160px',
      padding: '0.75em 1em',

      ':hover': {
        borderRadius: '2px',
        boxShadow: 'inset 0px 0px 0px 2px white',
      },

      '> svg': {
        width: '21px',
        height: 'auto',
      },
    },
  });

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>
      <img
        data-dialog={'logout'}
        class={styles.names.logo}
        src={`https://cdn.discordapp.com/${
          id && avatar ? `avatars/${id}/${avatar}.png` : 'embed/avatars/0.png'
        }`}
      />

      <Dialog name={'logout'}>
        <form method='post' action='/api/logout'>
          <button class={styles.names.button} type='submit'>
            Log Out
            <LogoutIcon />
          </button>
        </form>
      </Dialog>
    </>
  );
};
