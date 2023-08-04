import { useContext } from 'preact/hooks';

import Dialog from './Dialog.tsx';

import IconLogout from 'icons/logout.tsx';

import { i18n, i18nContext } from '../utils/i18n.ts';

export default ({ id, avatar }: { id: string; avatar?: string }) => {
  const locale = useContext(i18nContext);

  return (
    <>
      <img
        class={'user'}
        data-dialog={'logout'}
        src={`https://cdn.discordapp.com/${
          id && avatar ? `avatars/${id}/${avatar}.png` : 'embed/avatars/0.png'
        }`}
      />

      <Dialog name={'logout'} class={'user-dialog'}>
        <form method={'post'} action={'/api/logout'}>
          <button type={'submit'}>
            {i18n('logout', locale)}
            <IconLogout />
          </button>
        </form>
      </Dialog>
    </>
  );
};
