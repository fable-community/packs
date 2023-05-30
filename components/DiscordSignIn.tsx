import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import colors from '../theme.ts';

const styles = createStyle({
  button: {
    cursor: 'pointer',
    backgroundColor: colors.blue,
    border: '0',
    padding: '0.5rem',
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
    margin: '0 0.5em',
  },
});

export default function () {
  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>
      <div
        style={{
          display: 'flex',
          backgroundColor: colors.background,
          width: '100%',
          padding: '1em',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src='/icon.png'
          style={{
            position: 'fixed',
            width: 38,
            height: 'auto',
            top: '1em',
            left: '1em',
          }}
        />
        <form method='post' action='/api/login'>
          <button className={styles.names.button} type='submit'>
            <i class={`fa-brands fa-discord ${styles.names.icon}`} />
            Log In with Discord
          </button>
        </form>
      </div>
    </>
  );
}
