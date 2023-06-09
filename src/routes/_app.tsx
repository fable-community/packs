import { Head } from '$fresh/runtime.ts';

import type { AppProps } from '$fresh/src/server/types.ts';

export default ({ Component }: AppProps) => {
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

        <link rel='stylesheet' href={'css/root.css'} />
        <link rel='stylesheet' href={'css/login.css'} />
        <link rel='stylesheet' href={'css/user.css'} />
        <link rel='stylesheet' href={'css/dashboard.css'} />

        <link rel='stylesheet' href={'css/notice.css'} />
        <link rel='stylesheet' href={'css/dialog.css'} />
        <link rel='stylesheet' href={'css/image_input.css'} />
        <link rel='stylesheet' href={'css/text_input.css'} />

        <link rel='stylesheet' href={'css/manage-container.css'} />
        <link rel='stylesheet' href={'css/manage-inner.css'} />
        <link rel='stylesheet' href={'css/maintainers.css'} />
        <link rel='stylesheet' href={'css/media.css'} />

        {/* binds code to handle displaying and hiding dialogs */}
        <script async src='/js/dialogs.js' type={'module'} />

        {/* error tracking */}
        <script
          crossOrigin='anonymous'
          src='https://js.sentry-cdn.com/dacb35e205814c16aa731b503abdc9f8.min.js'
        />
      </Head>
      <Component />
    </>
  );
};
