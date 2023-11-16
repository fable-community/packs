import Card from './Card.tsx';
import Avatar from './Avatar.tsx';

import Notice from './Notice.tsx';
import Dialog from './Dialog.tsx';

import Manage from '../islands/Manage.tsx';

import IconPlus from 'icons/plus.tsx';
import IconClipboard from 'icons/clipboard-text.tsx';

import { i18n } from '../utils/i18n.ts';

import type { Pack, User } from '../utils/types.ts';

import type { PageProps } from '$fresh/server.ts';

export interface DashboardData {
  user?: User;
  maintenance: boolean;
  packs: Record<string, Pack>;
}

export const defaultImage =
  'https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg';

export default ({ data, url, params }: PageProps<DashboardData>) => {
  const { searchParams } = url;

  const packId = params.id;

  // deno-lint-ignore no-non-null-assertion
  const user = data.user!;

  const hasNew = searchParams.has('new');
  const hasSuccess = searchParams.get('success');

  if (packId || hasNew) {
    return (
      <Manage
        user={user}
        new={hasNew}
        pack={packId ? data.packs[packId] : undefined}
      />
    );
  }

  return (
    <>
      <Avatar id={user.id} avatar={user.avatar} />

      <div
        class={'flex flex-wrap justify-center w-full px-[10vw] my-[5vh] gap-8'}
      >
        {Object.values(data.packs).map((pack) => (
          <Card key={pack.manifest.id} pack={pack} />
        ))}

        <a
          href={`?new`}
          class={'flex items-center justify-center w-[128px] min-h-[32px] rounded-xl border-2 px-[16px] py-[24px] border-dashed border-grey hover:translate-y-[-8px] transition-all duration-150'}
        >
          <IconPlus class={'w-[32px] h-auto text-grey'} />
        </a>
      </div>

      {hasSuccess
        ? (
          <Dialog
            name={'success'}
            class={'flex items-center justify-center w-full h-full left-0 top-0 pointer-events-none'}
            visible={true}
          >
            <div
              class={'bg-embed2 flex flex-col overflow-x-hidden overflow-y-auto rounded-xl m-4 p-8 gap-4 h-[60vh] w-[60vw] max-w-[500px] pointer-events-auto'}
            >
              <p>
                {i18n('successTitle')}
              </p>
              <div
                class={'bg-highlight flex items-center p-4 rounded-xl'}
                data-clipboard={`/community install id: ${hasSuccess}`}
              >
                <i class={'italic grow select-text'}>
                  {`/community install id: ${hasSuccess}`}
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
        )
        : undefined}
    </>
  );
};
