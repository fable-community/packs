import { useCallback, useEffect, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import Dialog from './Dialog.tsx';

import IconClose from 'icons/x.tsx';
import IconTrash from 'icons/trash.tsx';
import IconCrown from 'icons/crown.tsx';

import strings from '../../i18n/en-US.ts';

import type { User } from './Dashboard.tsx';

const Profile = (
  { id, user, removable, onClick }: {
    id: string;
    user?: User;
    removable: boolean;
    onClick?: () => void;
  },
) => {
  return (
    <div class={'profile'}>
      <img
        key={id}
        src={`https://discord-probe.deno.dev/avatar/${id}`}
      />

      <i>{user?.display_name ?? user?.username ?? ''}</i>

      <i>
        {user?.username
          ? user?.discriminator !== '0'
            ? `${user?.username}#${user?.discriminator}`
            : user?.username
          : ''}
      </i>

      {removable
        ? <IconTrash onClick={onClick} />
        : <IconCrown class={'owner'} />}
    </div>
  );
};

export default (
  { owner, maintainers }: { owner: string; maintainers: Signal<string[]> },
) => {
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
    <>
      <div class={'maintainers'} data-dialog={'maintainers'}>
        <img
          key={owner}
          src={`https://discord-probe.deno.dev/avatar/${owner}`}
        />

        {maintainers.value
          .map((id) => (
            <img
              key={id}
              src={`https://discord-probe.deno.dev/avatar/${id}`}
            />
          ))}
      </div>

      <Dialog name={'maintainers'} class={'dialog-normal'}>
        <div class={'manage-dialog-maintainers'}>
          <IconClose data-dialog-cancel={'maintainers'} class={'close'} />

          <label>{strings.userId}</label>
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
              maintainers.value.push(userId.value);
              forceUpdate();
            }}
          >
            {strings.addNew}
          </button>

          <div class={'separator'} />

          <div>
            <Profile id={owner} user={data[owner]} removable={false} />

            {maintainers.value
              .map((id, i) => (
                <Profile
                  key={id}
                  id={id}
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
      </Dialog>
    </>
  );
};
