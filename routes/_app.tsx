import { Head } from '$fresh/runtime.ts';

import { AppProps } from '$fresh/src/server/types.ts';

import colors from '../theme.ts';

export default function App({ Component }: AppProps) {
  return (
    <html>
      <Head>
        <title>Pack Editor</title>
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
        <link
          rel='stylesheet'
          href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css'
        />
      </Head>
      <body
        style={{
          margin: 0,
          display: 'flex',
          minWidth: '100vw',
          minHeight: '100vh',
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Component />
      </body>
    </html>
  );
}
