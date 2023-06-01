import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import colors from '../theme.ts';

import DiscordIcon from 'icons/brand-discord-filled.tsx';

export default () => {
  const styles = createStyle({
    container: {
      display: 'flex',
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.embed,
      borderRadius: '10px',
      padding: '0 5em',
      height: '60vh',
    },
    logo: {
      position: 'absolute',
      width: '32px',
      height: 'auto',
      top: '2em',
    },
    button: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gridAutoFlow: 'column',
      alignItems: 'center',
      gap: '0.5em',

      color: 'inherit',
      cursor: 'pointer',
      backgroundColor: colors.discord,
      fontFamily: 'inherit',
      fontSize: 'inherit',
      fontWeight: '600',

      border: '0',
      minWidth: '160px',
      padding: '0.75em 1em',

      ':hover': {
        borderRadius: '2px',
        boxShadow: 'inset 0px 0px 0px 2px white',
      },

      '> svg': {
        marginTop: '2px',
        stroke: 'none',
        width: '16px',
        height: 'auto',
      },
    },
  });

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>
      <form method='post' action='/api/login'>
        <div class={styles.names.container}>
          <img src='/icon.png' class={styles.names.logo} />
          <button class={styles.names.button} type='submit'>
            Login with Discord
            <DiscordIcon />
          </button>
        </div>
      </form>
    </>
  );
};
