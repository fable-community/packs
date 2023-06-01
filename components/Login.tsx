import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import colors from '../theme.ts';

export default function () {
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
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      backgroundColor: colors.discord,
      border: '0',
      padding: '0.75em 1em',
      fontFamily: 'inherit',
      color: 'inherit',
      fontSize: 'inherit',
      fontWeight: '600',
      overflow: 'hidden',
      borderRadius: '100vw',
      minWidth: '160px',
      ':hover': {
        borderRadius: '2px',
        boxShadow: 'inset 0px 0px 0px 2px white',
      },
    },
    icon: {
      color: 'inherit',
      margin: '2px 0.5em 0',
      fontSize: '16px',
    },
  });

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>
      <form method='post' action='/api/login'>
        <div className={styles.names.container}>
          <img src='/icon.png' class={styles.names.logo} />
          <button className={styles.names.button} type='submit'>
            Login with Discord
            <i class={`bx bxl-discord-alt ${styles.names.icon}`} />
          </button>
        </div>
      </form>
    </>
  );
}
