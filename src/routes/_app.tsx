import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import colors from '../utils/theme.ts';

import type { AppProps } from '$fresh/src/server/types.ts';

export default ({ Component }: AppProps) => {
  const styles = createStyle({
    body: {
      margin: '0',
      display: 'flex',
      minWidth: '100vw',
      minHeight: '100vh',
      backgroundColor: colors.background,
      color: colors.foreground,
      fontFamily: 'Noto Sans, sans-serif',
      fontWeight: '400',
      fontSize: 'calc(12px + 0.1vw + 0.1vh)',
      lineHeight: '1.5',
      alignItems: 'center',
      overflow: 'hidden auto',
      userSelect: 'none',

      ' button': {
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        fontWeight: 600,
        border: '0',
        ':hover': {
          borderRadius: '2px',
        },
      },

      ' a': {
        cursor: 'pointer',
        textDecoration: 'none',
      },

      ' input': {
        color: colors.foreground,
        background: 'transparent',

        border: '0',
        fontWeight: 600,
        fontFamily: 'inherit',
        fontSize: '1.2em',
        lineHeight: 'inherit',
        minWidth: '0',
        padding: '0',

        ':focus': {
          outline: '0',
        },
      },
    },
  });

  return (
    <html>
      <Head>
        <style>{styles.bundle}</style>
        <title>Community Packs</title>
        <link rel='manifest' href='/manifest.json' />
        <link rel='icon' type='image/x-icon' href='/favicon.ico' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          crossOrigin='anonymous'
          href='https://fonts.gstatic.com'
        />
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&display=swap'
        />

        {/* hint to browsers that the app is using a dark theme */}
        <style>{':root { color-scheme: dark; }'}</style>

        {/* binds code to handle displaying and hiding dialogs */}
        <script type='text/javascript' src='/dialogs.js' />
      </Head>
      <body class={styles.names.body}>
        <Component />
      </body>
    </html>
  );
};
