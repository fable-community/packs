import { useCallback, useContext, useEffect, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import Notice from './Notice.tsx';

import IconTrash from 'icons/trash.tsx';
import IconCrown from 'icons/crown.tsx';

import { i18n, i18nContext } from '../utils/i18n.ts';

import type { User } from '../utils/types.ts';

const Profile = ({ id, user, removable, onClick }: {
  id: string;
  user?: User;
  removable: boolean;
  onClick?: () => void;
}) => {
  return (
    <div class={'entity'}>
      <img src={`https://discord-probe.deno.dev/avatar/${id}`} />

      <div>
        {user ? <i>{user?.display_name ?? user?.username}</i> : undefined}

        {user
          ? (
            <i>
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
        ? <IconTrash onClick={onClick} />
        : <IconCrown class={'owner'} />}
    </div>
  );
};

export default ({ owner, maintainers, visible }: {
  owner: string;
  maintainers: Signal<string[]>;
  visible: boolean;
}) => {
  const locale = useContext(i18nContext);

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
    <div style={{ display: visible ? '' : 'none' }} class={'maintainers'}>
      <label>{i18n('userId', locale)}</label>

      <input
        type={'text'}
        pattern={'[0-9]{18,19}'}
        placeholder={'185033133521895424'}
        onInput={(event) =>
          userId.value = (event.target as HTMLInputElement).value}
      />

      <button
        disabled={userId.value?.length <= 0}
        onClick={() => {
          if (!maintainers.value.includes(userId.value)) {
            maintainers.value.push(userId.value);
          }

          forceUpdate();
        }}
      >
        {i18n('addNew', locale)}
      </button>

      <i />

      <Notice type={'info'}>{i18n('maintainersNotice', locale)}</Notice>

      <div class='group'>
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
