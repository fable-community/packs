import { useContext } from 'preact/hooks';

import Card from './Card.tsx';
import Avatar from './Avatar.tsx';

import Notice from './Notice.tsx';
import Dialog from './Dialog.tsx';
import Manage from './Manage.tsx';

import IconLink from 'icons/link.tsx';
import IconPlus from 'icons/plus.tsx';
import IconClipboard from 'icons/clipboard-text.tsx';

import { i18n, i18nContext } from '../utils/i18n.ts';

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

  const locale = useContext(i18nContext);

  // deno-lint-ignore no-non-null-assertion
  const user = data.user!;

  const hasNew = searchParams.has('new');
  const hasSuccess = searchParams.get('success');
  // const hasImport = searchParams.get('import');

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

      <div class={'dashboard-wrapper'}>
        {Object.values(data.packs).map((pack) => (
          <Card key={pack.manifest.id} pack={pack} />
        ))}

        <a class={'dashboard-action-button'} href={`?new`}>
          <IconPlus />
        </a>

        <a disabled class={'dashboard-action-button'} href={`?import`}>
          <IconLink />
        </a>
      </div>

      {hasSuccess
        ? (
          <Dialog name={'success'} class={'dialog-normal'} visible={true}>
            <div>
              <p>
                {i18n('successTitle', locale)}
              </p>
              <div
                class={'install-info'}
                data-clipboard={`/community install id: ${hasSuccess}`}
              >
                <i>{`/community install id: ${hasSuccess}`}</i>
                <IconClipboard />
              </div>
              <Notice type={'info'}>
                {i18n('successYouNeed', locale)}
                <strong>{i18n('successManageServer', locale)}</strong>
                {i18n('successPermissionToInstall', locale)}
              </Notice>
              <button data-dialog-cancel={'success'}>
                {i18n('okay', locale)}
              </button>
            </div>
          </Dialog>
        )
        : undefined}
    </>
  );
};
