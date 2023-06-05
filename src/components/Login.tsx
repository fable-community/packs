import DiscordIcon from 'icons/brand-discord-filled.tsx';

import strings from '../../i18n/en-US.ts';

export default () => {
  return (
    <form class={'login-wrapper'} method={'post'} action={'/api/login'}>
      <div class={'login-container'}>
        <img src={'/icon.png'} />
        <button type={'submit'}>
          {strings.loginWithDiscord}
          <DiscordIcon />
        </button>
      </div>
    </form>
  );
};
