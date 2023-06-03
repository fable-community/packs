import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import colors from '../utils/theme.ts';

import Dialog from './Dialog.tsx';

import IconLogout from 'icons/logout.tsx';

import strings from '../../i18n/en-US.json' assert { type: 'json' };

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
    container: {
      top: 'calc(2em - 3px)',
      right: 'calc(3.5em + 32px)',
    },
    button: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gridAutoFlow: 'column',
      alignItems: 'center',
      gap: '0.5em',

      backgroundColor: colors.red,

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

      <Dialog name={'logout'} class={styles.names.container}>
        <form method='post' action='/api/logout'>
          <button class={styles.names.button} type='submit'>
            {strings.logout}
            <IconLogout />
          </button>
        </form>
      </Dialog>
    </>
  );
};
