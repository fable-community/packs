import DiscordIcon from 'icons/brand-discord-filled.tsx';

import { i18n } from '../utils/i18n.ts';

export default () => {
  return (
    <form class={'mx-auto'} method={'post'} action={'/login'}>
      <div
        class={'bg-embed flex relative items-center justify-center rounded-[10px] px-[3.5rem] h-[60vh]'}
      >
        <img src={'/icon.png'} class={'absolute w-[32px] h-auto top-[2rem]'} />
        <button class={'bg-discord flex gap-2 '} type={'submit'}>
          {i18n('loginWithDiscord')}
          <DiscordIcon class={'w-[16px] h-auto'} />
        </button>
      </div>
    </form>
  );
};
