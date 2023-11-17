import { useCallback, useEffect, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import Notice from './Notice.tsx';

import IconTrash from 'icons/trash.tsx';
import IconCrown from 'icons/crown.tsx';

import { i18n } from '../utils/i18n.ts';

import type { User } from '../utils/types.ts';

const Profile = ({ id, user, removable, onClick }: {
  id: string;
  user?: User;
  removable: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      class={'bg-embed2 flex items-center justify-center rounded-[100vw] px-4 py-2 gap-3'}
    >
      <img
        class={'w-[24px] h-auto aspect-square bg-grey object-center object-cover rounded-full'}
        src={`https://discord-probe.deno.dev/avatar/${id}`}
      />

      <div class={'flex flex-col'}>
        {user
          ? <i>{user?.display_name ?? user?.username}</i>
          : <div class={'w-[52px] h-[16px] bg-grey'}></div>}

        {user
          ? (
            <i class={'opacity-60'}>
              {user?.username
                ? user?.discriminator !== '0'
                  ? `${user?.username}#${user?.discriminator}`
                  : `@${user?.username}`
                : ''}
            </i>
          )
          : undefined}
      </div>

      {removable
        ? (
          <IconTrash
            class={'text-red w-[18px] h-auto cursor-pointer'}
            onClick={onClick}
          />
        )
        : <IconCrown class={'text-fable w-[18px] h-auto'} />}
    </div>
  );
};

export default ({ owner, maintainers, visible }: {
  owner: string;
  maintainers: Signal<string[]>;
  visible: boolean;
}) => {
  const [, updateState] = useState({});

  // used to force the entire component to redrew
  const forceUpdate = useCallback(() => updateState({}), []);

  const [data, setData] = useState<Record<string, User>>({});

  const userId = useSignal('');

  useEffect(() => {
    Promise.all(
      [owner, ...maintainers.value].map(async (id) => {
        const response = await fetch(
          `https://discord-probe.deno.dev/user/${id}`,
        );

        return response.json() as Promise<User>;
      }),
    )
      .then((array) => {
        const _data = array.reduce((acc, user) => {
          return { ...acc, [user.id]: user };
        }, {});

        setData(_data);
      })
      .catch(console.error);
  }, [...maintainers.value]);

  return (
    <div
      class={[
        'grid w-full max-w-[980px] my-8 mx-auto gap-4',
        visible ? '' : 'hidden',
      ].join(' ')}
    >
      <label class={'text-[0.8rem] text-disabled uppercase'}>
        {i18n('userId')}
      </label>

      <input
        type={'text'}
        pattern={'[0-9]{18,19}'}
        placeholder={'185033133521895424'}
        class={'w-full text-[1rem] p-2 rounded-0 border-b-2 border-embed'}
        onInput={(event) =>
          userId.value = (event.target as HTMLInputElement).value}
      />

      <button
        class={'h-[46px]'}
        disabled={!(/^[0-9]{18,19}$/.test(userId.value ?? ''))}
        onClick={() => {
          if (!maintainers.value.includes(userId.value)) {
            maintainers.value.push(userId.value);
          }

          forceUpdate();
        }}
      >
        {i18n('addNew')}
      </button>

      <i class={'h-[2px] bg-grey'} />

      <Notice type={'info'}>{i18n('maintainersNotice')}</Notice>

      <div class='flex flex-wrap mb-[15vh] gap-2'>
        <Profile id={owner} user={data[owner]} removable={false} />

        {maintainers.value
          .map((id, i) => (
            <Profile
              id={id}
              key={id}
              user={data[id]}
              removable={true}
              onClick={() => {
                maintainers.value.splice(i, 1);
                forceUpdate();
              }}
            />
          ))}
      </div>
    </div>
  );
};
