import { useCallback, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import Notice from './Notice.tsx';

import IconTrash from 'icons/trash.tsx';

import strings from '../../i18n/en-US.ts';

import type { Entity } from '../utils/types.ts';

const Profile = (
  { id, onClick }: { id: string; onClick?: () => void },
) => {
  return (
    <div class={'entity'}>
      <i>{id}</i>
      {<IconTrash onClick={onClick} />}
    </div>
  );
};

export default ({ conflicts, visible }: {
  conflicts: Signal<string[]>;
  visible: boolean;
}) => {
  const [, updateState] = useState({});

  // used to force the entire component to redrew
  const forceUpdate = useCallback(() => updateState({}), []);

  const entityId = useSignal('');

  return (
    <div
      style={{ display: visible ? '' : 'none' }}
      class={'maintainers'}
    >
      <label>{strings.entityId}</label>

      <input
        type={'text'}
        pattern={'[\\-_a-z0-9]+:[\\-_a-z0-9]+'}
        placeholder={'anilist:1'}
        onInput={(event) =>
          entityId.value = (event.target as HTMLInputElement).value}
      />

      <button
        disabled={entityId.value?.length <= 0}
        onClick={() => {
          if (!conflicts.value.includes(entityId.value)) {
            conflicts.value.push(entityId.value);
          }
          forceUpdate();
        }}
      >
        {strings.addNew}
      </button>

      <i />

      <Notice type={'info'}>{strings.conflictsNotice}</Notice>

      <div class='group'>
        {conflicts.value
          .map((id, i) => (
            <Profile
              key={id}
              id={id}
              onClick={() => {
                conflicts.value.splice(i, 1);
                forceUpdate();
              }}
            />
          ))}
      </div>
    </div>
  );
};
