import { useEffect, useState } from 'preact/hooks';

import Dialog from './Dialog.tsx';

import TextInput from './TextInput.tsx';

import IconTrash from 'icons/trash.tsx';
import IconCrown from 'icons/crown.tsx';

import strings from '../../i18n/en-US.ts';

import type { Signal } from '@preact/signals';

import type { User } from './Dashboard.tsx';

const Profile = (
  { id, user, removable }: { id: string; user?: User; removable: boolean },
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

      {removable ? <IconTrash /> : <IconCrown class={'owner'} />}
    </div>
  );
};

export default (
  { owner, maintainers }: { owner: string; maintainers: Signal<string[]> },
) => {
  const [data, setData] = useState<Record<string, User>>({});

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
  }, [maintainers.value]);

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
          <TextInput
            type={'text'}
            label={strings.userId}
            pattern={'[0-9]{18,19}'}
            placeholder={'185033133521895424'}
          />

          <button>{strings.addNew}</button>

          <div class={'separator'} />

          <Profile id={owner} user={data[owner]} removable={false} />

          {maintainers.value
            .map((id) => (
              <Profile key={id} id={id} user={data[id]} removable={true} />
            ))}
        </div>
      </Dialog>
    </>
  );
};
