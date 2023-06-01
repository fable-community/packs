import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import Dialog from './Dialog.tsx';
import colors from '../theme.ts';

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
      cursor: 'pointer',
      backgroundColor: colors.grey,
      fontWeight: 600,
      padding: '1em',
      border: '0',
      minWidth: '160px',
      ':hover': {
        borderRadius: '2px',
        boxShadow: 'inset 0px 0px 0px 2px white',
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
          <button className={styles.names.button} type='submit'>Log Out</button>
        </form>
      </Dialog>
    </>
  );
};
