import { Handlers, PageProps } from '$fresh/server.ts';

import { getCookies } from '$std/http/cookie.ts';

interface Data {
  id?: string;
  username?: string;
  avatar?: string;
}

interface Cookies {
  accessToken?: string;
  refreshToken?: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers) as Cookies;

    // TODO support refreshing the access token
    if (cookies.accessToken) {
      const response = await fetch('https://discord.com/api/v10/users/@me', {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${cookies.accessToken}`,
        },
      });

      const data = await response.json() as Data;

      return ctx.render(data);
    }

    return ctx.render({});
  },
};

export default function ({ data }: PageProps<Data>) {
  if (data.username) {
    return (
      <>
        <p>{data.username}</p>
        <img
          width={32}
          height={32}
          src={`https://cdn.discordapp.com/${
            data.avatar
              ? `avatars/${data.id}/${data.avatar}.png`
              : 'embed/avatars/0.png'
          }`}
        />
        <form method='post' action='/api/logout'>
          <button type='submit'>Logout</button>
        </form>
      </>
    );
  } else {
    return (
      <>
        <form method='post' action='/api/login'>
          <button type='submit'>DiscordSignIn</button>
        </form>
      </>
    );
  }
}
