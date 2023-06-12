import Card from './Card.tsx';
import Avatar from './Avatar.tsx';

import Notice from './Notice.tsx';
import Dialog from './Dialog.tsx';
import Manage from './Manage.tsx';

import IconLink from 'icons/link.tsx';
import IconPlus from 'icons/plus.tsx';
import IconClipboard from 'icons/clipboard-text.tsx';

import strings from '../../i18n/en-US.ts';

import type { Schema } from '../utils/types.ts';

import type { PageProps } from '$fresh/server.ts';

export type User = {
  id: string;
  username: string;
  // deno-lint-ignore camelcase
  display_name?: string;
  avatar?: string;
};

export interface DashboardData {
  user?: User;
  packs: Record<string, Schema.Pack>;
}

export const defaultImage =
  'https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg';

export { Schema };

export default ({ data, url, params }: PageProps<DashboardData>) => {
  const { searchParams } = url;

  const packId = params.id;

  // deno-lint-ignore no-non-null-assertion
  const user = data.user!;

  const hasNew = searchParams.has('new');
  const hasSuccess = searchParams.get('success');
  // const hasImport = searchParams.get('import');

  if (packId || hasNew) {
    return (
      <Manage
        new={hasNew}
        pack={packId ? data.packs[packId] : undefined}
        user={user?.id}
      />
    );
  }

  return (
    <>
      <Avatar id={user?.id} avatar={user?.avatar} />

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
                {strings.success.title}
              </p>
              <div
                class={'install-info'}
                data-clipboard={`/packs install id: ${hasSuccess}`}
              >
                <i>{`/packs install id: ${hasSuccess}`}</i>
                <IconClipboard />
              </div>
              <Notice type={'info'}>
                {strings.success.youNeed}
                <strong>{strings.success.manageServer}</strong>
                {strings.success.permissionToInstall}
              </Notice>
              <button data-dialog-cancel={'success'}>{strings.okay}</button>
            </div>
          </Dialog>
        )
        : undefined}
    </>
  );
};
