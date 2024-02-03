import Notice from '~/components/Notice.tsx';
import Dialog from '~/components/Dialog.tsx';

import IconClipboard from 'icons/clipboard-text.tsx';

import { i18n } from '~/utils/i18n.ts';

export default ({ packId, visible }: { packId?: string; visible: boolean }) => {
  return (
    <Dialog
      name={'success'}
      class={'flex items-center justify-center w-full h-full left-0 top-0 pointer-events-none'}
      visible={Boolean(packId && visible)}
    >
      <div
        class={'bg-embed2 flex flex-col overflow-x-hidden overflow-y-auto rounded-xl m-4 p-8 gap-4 h-[60vh] w-[60vw] max-w-[500px] pointer-events-auto'}
      >
        <label class={'text-base font-bold'}>{i18n('successTitle')}</label>
        <label>{i18n('successSubtitle')}</label>

        <div
          class={'bg-highlight flex items-center p-4 rounded-xl'}
          data-clipboard={`/packs install id: ${packId}`}
        >
          <i class={'italic grow select-all'}>
            {`/packs install id: ${packId}`}
          </i>
          <IconClipboard class={'w-[18px] h-[18px] cursor-pointer'} />
        </div>
        <Notice type={'info'}>
          {i18n('successYouNeed')}
          <strong>{i18n('successManageServer')}</strong>
          {i18n('successPermissionToInstall')}
        </Notice>
        <button data-dialog-cancel={'success'}>
          {i18n('okay')}
        </button>
      </div>
    </Dialog>
  );
};
