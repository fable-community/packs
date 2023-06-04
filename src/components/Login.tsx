import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import colors from '../utils/theme.ts';

import DiscordIcon from 'icons/brand-discord-filled.tsx';

import strings from '../../i18n/en-US.json' assert { type: 'json' };

export default () => {
  const styles = createStyle({
    wrapper: {
      margin: '0 auto',
    },
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

      backgroundColor: colors.discord,

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
      <form class={styles.names.wrapper} method={'post'} action={'/api/login'}>
        <div class={styles.names.container}>
          <img src={'/icon.png'} class={styles.names.logo} />
          <button class={styles.names.button} type={'submit'}>
            {strings.loginWithDiscord}
            <DiscordIcon />
          </button>
        </div>
      </form>
    </>
  );
};
