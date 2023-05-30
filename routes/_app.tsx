import { Head } from '$fresh/runtime.ts';

import { AppProps } from '$fresh/src/server/types.ts';

export default function App({ Component }: AppProps) {
  return (
    <html>
      <Head>
        <title>Pack Editor</title>
        <link rel='icon' type='image/x-icon' href='/favicon.ico' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://kit.fontawesome.com' />
        <link
          rel='preconnect'
          crossOrigin='anonymous'
          href='https://fonts.gstatic.com'
        />
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&display=swap'
        />
        <script
          src='https://kit.fontawesome.com/8b397282b0.js'
          crossOrigin='anonymous'
        >
        </script>
      </Head>
      <body
        style={{
          margin: 0,
          display: 'flex',
          minWidth: '100vw',
          minHeight: '100vh',
        }}
      >
        <Component />
      </body>
    </html>
  );
}
