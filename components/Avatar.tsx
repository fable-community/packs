import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

export default function ({ id, avatar }: { id?: string; avatar?: string }) {
  const styles = createStyle({
    logo: {
      position: 'fixed',
      width: '32px',
      height: '32px',
      top: '2em',
      right: '2em',
      borderRadius: '100%',
    },
  });

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>
      <img
        class={styles.names.logo}
        src={`https://cdn.discordapp.com/${
          id && avatar ? `avatars/${id}/${avatar}.png` : 'embed/avatars/0.png'
        }`}
      />
      {
        /*
        <form method='post' action='/api/logout'>
          <button type='submit'>Log Out</button>
        </form>
        */
      }
    </>
  );
}
