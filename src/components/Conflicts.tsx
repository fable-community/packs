import { useCallback, useEffect, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import Notice from './Notice.tsx';

import IconTrash from 'icons/trash.tsx';

import { gql, request } from '../utils/graphql.ts';

import strings from '../../i18n/en-US.ts';

interface Media {
  id: number;
  title?: {
    english?: string;
    romaji?: string;
    native?: string;
  };
  coverImage?: {
    medium?: string;
  };
}

const Media = ({ id, media, onClick }: {
  id: string;
  media?: Media;
  onClick?: () => void;
}) => {
  const anilist = id.startsWith('anilist:');

  return (
    <div class={'entity'}>
      {anilist ? <img src={media?.coverImage?.medium} /> : undefined}

      {anilist
        ? (
          <div>
            {media
              ? (
                <strong>
                  {media.title?.english ?? media.title?.romaji ??
                    media.title?.native}
                </strong>
              )
              : undefined}
          </div>
        )
        : <i>{id}</i>}

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

  const [data, setData] = useState<Record<string, Media>>({});

  const entityId = useSignal('');

  useEffect(() => {
    const anilistIds: number[] = [];

    conflicts.value.forEach((id) => {
      if (id.startsWith('anilist:')) {
        anilistIds.push(parseInt(id.split(':')[1]));
      }
    });

    const query = gql`
      query ($ids: [Int]) {
        Page {
          media(id_in: $ids) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              medium
            }
          }
        }
      }
    `;

    if (anilistIds.length) {
      console.log(anilistIds);

      request<{
        Page: {
          media: Media[];
        };
      }>({
        query,
        url: 'https://graphql.anilist.co',
        variables: { ids: anilistIds },
      })
        .then((response) => {
          const _data = response.Page.media.reduce((acc, media) => {
            return { ...acc, [`anilist:${media.id}`]: media };
          }, {});

          setData(_data);
        })
        .catch(console.error);
    }
  }, [...conflicts.value]);

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
            <Media
              id={id}
              key={id}
              media={data[id]}
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
