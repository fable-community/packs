import { Head } from '$fresh/runtime.ts';

import { createStyle } from 'flcss';

import Card from './Card.tsx';
import Avatar from './Avatar.tsx';

import Manage from './Manage.tsx';

import colors from '../utils/theme.ts';

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
  const hasImport = searchParams.get('import');

  const styles = createStyle({
    wrapper: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      width: '100%',
      padding: '0 10vw',
      margin: '5vh 0',
      gap: '3em',
    },
    placeholder: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      width: '128px',
      minHeight: '32px',
      borderRadius: '8px',
      border: `4px dashed ${colors.grey}`,
      padding: '24px 16px',

      '> svg': {
        width: '42px',
        height: 'auto',
        color: colors.grey,
      },

      ':hover': {
        transform: 'translateY(-8px)',
      },
    },
  });

  if (packId) {
    return <Manage pack={data.packs[packId]} user={user?.id} />;
  }

  if (hasNew) {
    return <Manage new user={user?.id} />;
  }

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>

      <Avatar id={user?.id} avatar={user?.avatar} />

      <div class={styles.names.wrapper}>
        {Object.values(data.packs).map((pack) => <Card pack={pack} />)}

        <a class={styles.names.placeholder} href={`?new`}>
          <IconPlus />
        </a>

        <a disabled class={styles.names.placeholder} href={`?import`}>
          <IconLink />
        </a>
      </div>
    </>
  );
};
