import { Head } from '$fresh/runtime.ts';

import { AppProps } from '$fresh/src/server/types.ts';

export default function App({ Component }: AppProps) {
  return (
    <html>
      <Head>
        <title>Pack Editor</title>
        <link rel='icon' type='image/x-icon' href='/favicon.ico' />
      </Head>
      <body>
        <Component />
      </body>
    </html>
  );
}
