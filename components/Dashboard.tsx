import { PageProps } from '$fresh/server.ts';

export interface User {
  id?: string;
  username?: string;
  avatar?: string;
}

export default function ({ data }: PageProps<User>) {
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
        <button type='submit'>Log Out</button>
      </form>
    </>
  );
}
