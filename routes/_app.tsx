import { Head } from '$fresh/runtime.ts';

import { AppProps } from '$fresh/src/server/types.ts';

import colors from '../theme.ts';

export default ({ Component }: AppProps) => {
  return (
    <html>
      <Head>
        <title>Community Packs</title>
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
      <body
        style={{
          margin: 0,
          display: 'flex',
          minWidth: '100vw',
          minHeight: '100vh',
          backgroundColor: colors.background,
          color: '#ffffff',
          fontFamily: '"Noto Sans", sans-serif',
          fontWeight: '400',
          fontSize: 'calc(12px + 0.1vw + 0.1vh)',
          lineHeight: '1.5',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden auto',
          userSelect: 'none',
        }}
      >
        <Component />
      </body>
    </html>
  );
};
