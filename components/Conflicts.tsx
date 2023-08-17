import { useCallback, useEffect, useState } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import Notice from './Notice.tsx';

import IconTrash from 'icons/trash.tsx';

import { gql, request } from '../utils/graphql.ts';

import { i18n } from '../utils/i18n.ts';

const getAnilistIds = (ids: string[]) => {
  const anilistIds: number[] = [];

  ids.forEach((id) => {
    if (id.startsWith('anilist:')) {
      anilistIds.push(parseInt(id.split(':')[1]));
    }
  });

  return anilistIds;
};

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

  const search = useSignal('');

  const timeout: Signal<number | undefined> = useSignal(undefined);

  const [data, setData] = useState<Record<string, Media>>({});

  const [suggestions, setSuggestions] = useState<Media[]>([]);

  const focused = useSignal(false);

  const query = gql`
      query ($search: String, $ids: [Int]) {
        Page {
          media(search: $search, id_in: $ids, sort: POPULARITY_DESC) {
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

  useEffect(() => {
    const anilistIds = getAnilistIds(conflicts.value);

    if (anilistIds.length) {
      request<{ Page: { media: Media[] } }>({
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
    <div style={{ display: visible ? '' : 'none' }} class={'maintainers'}>
      <div class={'search'}>
        <input
          type={'text'}
          placeholder={i18n('search')}
          onFocus={() => focused.value = true}
          onInput={(event) => {
            search.value = (event.target as HTMLInputElement).value;

            if (timeout.value) {
              clearTimeout(timeout.value);
            }

            timeout.value = setTimeout(() => {
              request<{ Page: { media: Media[] } }>({
                query,
                url: 'https://graphql.anilist.co',
                variables: { search: search.value },
              })
                .then((response) => {
                  const anilistIds = getAnilistIds(conflicts.value);

                  setSuggestions(response.Page.media.filter((media) =>
                    !anilistIds.includes(media.id)
                  ));
                })
                .catch(console.error);
            }, 500);
          }}
        />

        <div class={'suggestions'} data-active={focused}>
          {suggestions.map((media, i) => (
            <i
              key={media.id}
              onClick={() => {
                const id = `anilist:${media.id}`;

                if (!conflicts.value.includes(id)) {
                  conflicts.value.push(id);
                }

                suggestions.splice(i, 1);

                focused.value = false;

                forceUpdate();
              }}
            >
              {media.title?.english ?? media.title?.romaji ??
                media.title?.native}
            </i>
          ))}
        </div>
      </div>

      <div
        class={'holder'}
        data-active={focused}
        onClick={() =>
          focused.value = false}
      />

      <i />

      <Notice type={'info'}>{i18n('conflictsNotice')}</Notice>

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
