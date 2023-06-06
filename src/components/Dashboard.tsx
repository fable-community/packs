import { Head } from '$fresh/runtime.ts';

import Card from './Card.tsx';
import Avatar from './Avatar.tsx';

import Manage from './Manage.tsx';

import IconLink from 'icons/link.tsx';
import IconPlus from 'icons/plus.tsx';

import type { Schema } from 'fable/src/types.ts';

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

export { Schema };

export default ({ data, url, params }: PageProps<DashboardData>) => {
  const { searchParams } = url;

  const packId = params.id;

  // deno-lint-ignore no-non-null-assertion
  const user = data.user!;

  const hasNew = searchParams.has('new');
  // const hasImport = searchParams.get('import');

  if (packId || hasNew) {
    // <Manage> is a island that doesn't have access to the deno runtime
    // this is why we query the variable here instead of directly there
    const dryRun = Deno.env.get('DRY_RUN') === '1';

    return (
      <Manage
        new={hasNew}
        dryRun={dryRun}
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
    </>
  );
};
