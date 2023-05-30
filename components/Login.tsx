import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import colors from '../theme.ts';

export default function () {
  const styles = createStyle({
    button: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      backgroundColor: colors.blue,
      border: '0',
      padding: '0.75em 1em',
      fontFamily: 'Noto Sans',
      fontWeight: '600',
      color: '#ffffff',
      fontSize: '14px',
      overflow: 'hidden',
      ':hover': {
        borderRadius: '2px',
        border: '2px solid white',
      },
    },
    icon: {
      color: '#ffffff',
      margin: '2px 0.5em 0',
      fontSize: '16px',
      fontWeight: '400',
    },
  });

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>
      <form method='post' action='/api/login'>
        <button className={styles.names.button} type='submit'>
          Login with Discord
          <i class={`bx bxl-discord-alt ${styles.names.icon}`} />
        </button>
      </form>
    </>
  );
}
