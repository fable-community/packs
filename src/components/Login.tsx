import { useContext } from 'preact/hooks';

import DiscordIcon from 'icons/brand-discord-filled.tsx';

import { i18n, i18nContext } from '../utils/i18n.ts';

export default () => {
  const locale = useContext(i18nContext);

  return (
    <form class={'login-wrapper'} method={'post'} action={'/api/login'}>
      <div class={'login-container'}>
        <img src={'/icon.png'} />
        <button type={'submit'}>
          {i18n('loginWithDiscord', locale)}
          <DiscordIcon />
        </button>
      </div>
    </form>
  );
};
