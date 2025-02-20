"use client";

/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from "react";

import Notice from "~/components/Notice";

import { Trash2 } from "lucide-react";

import { gql, request } from "~/utils/graphql";

import { i18n } from "~/utils/i18n";
import { usePackContext } from "~/contexts/PackContext";

const MAX_LIMIT = 20;

const getAnilistIds = (ids: string[]) => {
  const anilistIds: number[] = [];

  ids.forEach((id) => {
    if (id.startsWith("anilist:")) {
      anilistIds.push(parseInt(id.split(":")[1]));
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

const Media = ({
  id,
  media,
  onClick,
}: {
  id: string;
  media?: Media;
  onClick?: () => void;
}) => {
  const anilist = id.startsWith("anilist:");

  return (
    <div
      className={
        "bg-embed2 flex items-center justify-center rounded-[100vw] px-4 py-2 gap-3"
      }
    >
      {anilist ? (
        <img
          className={
            "w-[24px] h-auto aspect-square bg-grey object-center object-cover rounded-full"
          }
          src={media?.coverImage?.medium}
        />
      ) : undefined}

      {anilist ? (
        <div>
          {media ? (
            <strong>
              {media.title?.english ??
                media.title?.romaji ??
                media.title?.native}
            </strong>
          ) : undefined}
        </div>
      ) : (
        <i className={"opacity-60"}>{id}</i>
      )}

      {
        <Trash2
          className={"text-red w-[18px] h-auto cursor-pointer"}
          onClick={onClick}
        />
      }
    </div>
  );
};

const ConflictsComponent = ({ visible }: { visible: boolean }) => {
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);

  // const [search, setSearch] = useState("");
  const [timeout, setTimeoutState] = useState<NodeJS.Timeout>();
  const [data, setData] = useState<Record<string, Media>>({});
  const [suggestions, setSuggestions] = useState<Media[]>([]);
  const [focused, setFocused] = useState(false);

  const { conflicts, setConflicts } = usePackContext();

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
    const anilistIds = getAnilistIds(conflicts);

    if (anilistIds.length) {
      request<{ Page: { media: Media[] } }>({
        query,
        url: "https://graphql.anilist.co",
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
    //
  }, [conflicts, query]);

  return (
    <div
      className={[
        "grid w-full max-w-[980px] my-8 mx-auto gap-4",
        visible ? "" : "hidden",
      ].join(" ")}
    >
      {conflicts.length >= MAX_LIMIT ? (
        <></>
      ) : (
        <>
          <div className={"z-[3] w-full relative"}>
            <input
              type={"text"}
              placeholder={i18n("search")}
              onFocus={() => setFocused(true)}
              onInput={(event) => {
                const value = (event.target as HTMLInputElement).value;
                // setSearch(value);

                if (timeout) {
                  clearTimeout(timeout);
                }

                const newTimeout = setTimeout(() => {
                  request<{ Page: { media: Media[] } }>({
                    query,
                    url: "https://graphql.anilist.co",
                    variables: { search: value },
                  })
                    .then((response) => {
                      const anilistIds = getAnilistIds(conflicts);

                      setSuggestions(
                        response.Page.media.filter(
                          (media) => !anilistIds.includes(media.id)
                        )
                      );
                    })
                    .catch(console.error);
                }, 500);

                setTimeoutState(newTimeout);
              }}
            />

            <div
              className={[
                focused ? "" : "hidden",
                "bg-embed2 absolute flex flex-col w-full max-h-[35vh] overflow-x-hidden overflow-y-auto empty:h-[100px]",
              ].join(" ")}
            >
              {suggestions.map((media, i) => (
                <i
                  className={"cursor-pointer px-2 py-4 hover:bg-highlight"}
                  key={media.id}
                  onClick={() => {
                    const id = `anilist:${media.id}`;

                    if (!conflicts.includes(id)) {
                      setConflicts([...conflicts, id]);
                    }

                    const newSuggestions = [...suggestions];
                    newSuggestions.splice(i, 1);
                    setSuggestions(newSuggestions);

                    setFocused(false);
                    forceUpdate();
                  }}
                >
                  {media.title?.english ??
                    media.title?.romaji ??
                    media.title?.native}
                </i>
              ))}
            </div>
          </div>

          <i className={"h-[2px] bg-grey"} />
        </>
      )}

      <div
        className={[
          focused ? "" : "hidden",
          "fixed z-[2] w-[100vw] h-[100vh] top-0 left-0",
        ].join(" ")}
        onClick={() => setFocused(false)}
      />

      {conflicts.length >= MAX_LIMIT ? (
        <Notice type={"warn"}>{i18n("maxConflicts", MAX_LIMIT)}</Notice>
      ) : (
        <Notice type={"info"}>{i18n("conflictsNotice")}</Notice>
      )}

      <div className="flex flex-wrap mb-[15vh] gap-2">
        {conflicts.map((id, i) => (
          <Media
            id={id}
            key={id}
            media={data[id]}
            onClick={() => {
              const newConflicts = [...conflicts];
              newConflicts.splice(i, 1);
              setConflicts(newConflicts);
              forceUpdate();
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ConflictsComponent;
