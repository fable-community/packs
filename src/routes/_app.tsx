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

      color: colors.foreground,
      backgroundColor: colors.background,

      fontWeight: '400',
      fontFamily: '"Noto Sans", sans-serif',
      fontSize: 'calc(12px + 0.1vw + 0.1vh)',
      lineHeight: '1.5',

      alignItems: 'center',
      overflow: 'hidden auto',
      userSelect: 'none',

      ' [disabled]': {
        opacity: '0.3',
        pointerEvents: 'none',
      },

      ' button': {
        border: '0',
        fontWeight: 600,
        minWidth: '160px',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        padding: '0.75em 1em',
        cursor: 'pointer',

        ':hover': {
          borderRadius: '2px',
          boxShadow: 'inset 0px 0px 0px 2px white',
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
    <>
      <Head>
        <title>Community Packs</title>
        <link rel='manifest' href='/manifest.json' />
        <meta
          name='description'
          content='A portal app to create, manage and publish Fable Community Packs'
        />
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

        {/* binds code to handle displaying and hiding dialogs */}
        <script async src='/_dialogs.js' />

        {/* binds code to handle previewing input images */}
        <script async src='/_images.js' />

        {/* hint to browsers that the app is using a dark theme */}
        <style>{':root { color-scheme: dark; }'}</style>

        <style>{styles.bundle}</style>
      </Head>
      <body class={styles.names.body}>
        <Component />
      </body>
    </>
  );
};
