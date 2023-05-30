import { Head } from '$fresh/runtime.ts';

import { Handlers, PageProps } from '$fresh/server.ts';

import { getCookies } from '$std/http/cookie.ts';

import { createStyle } from 'flcss';

import Login from '../components/Login.tsx';

import Dashboard, { User } from '../components/Dashboard.tsx';

interface Cookies {
  accessToken?: string;
  refreshToken?: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers) as Cookies;

    // TODO support refreshing the access token
    if (cookies.accessToken) {
      const response = await fetch('https://discord.com/api/users/@me', {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${cookies.accessToken}`,
        },
      });

      const data = await response.json() as User;

      return ctx.render(data);
    }

    return ctx.render({});
  },
};

export default function (props: PageProps<User>) {
  const styles = createStyle({
    logo: {
      position: 'fixed',
      width: '38px',
      height: 'auto',
      top: '1em',
      left: '1em',
    },
  });

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>
      <img src='/icon.png' class={styles.names.logo} />
      {props.data.id ? <Dashboard {...props} /> : <Login />}
    </>
  );
}
