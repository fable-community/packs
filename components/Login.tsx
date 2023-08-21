import DiscordIcon from 'icons/brand-discord-filled.tsx';

import { i18n } from '../utils/i18n.ts';

export default () => {
  return (
    <form class={'login-wrapper'} method={'post'} action={'/login'}>
      <div class={'login-container'}>
        <img src={'/icon.png'} />
        <button type={'submit'}>
          {i18n('loginWithDiscord')}
          <DiscordIcon />
        </button>
      </div>
    </form>
  );
};
