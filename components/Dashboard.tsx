import Card from './Card.tsx';
import Avatar from './Avatar.tsx';

import Manage from '../islands/Manage.tsx';

import IconPlus from 'icons/plus.tsx';

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
    </>
  );
};
