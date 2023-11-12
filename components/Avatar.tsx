import Dialog from './Dialog.tsx';

import IconLogout from 'icons/logout.tsx';

import { i18n } from '../utils/i18n.ts';

export default ({ id, avatar }: { id: string; avatar?: string }) => {
  return (
    <>
      <img
        data-dialog={'logout'}
        class={'fixed w-[32px] h-[32px] top-[2rem] right-[2rem] rounded-full cursor-pointer'}
        src={`https://cdn.discordapp.com/${
          id && avatar ? `avatars/${id}/${avatar}.png` : 'embed/avatars/0.png'
        }`}
      />

      <Dialog name={'logout'} class={'top-[2rem] right-[2rem]'}>
        <form method={'post'} action={'/logout'}>
          <button
            type={'submit'}
            class={'red mr-[2.5rem] flex items-center gap-[0.5rem]'}
          >
            {i18n('logout')}
            <IconLogout />
          </button>
        </form>
      </Dialog>
    </>
  );
};
