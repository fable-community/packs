/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useState } from "react";

import { hideDialog, showDialog } from "~/public/dialogs";

import Notice from "~/components/Notice";
import Dialog from "~/components/Dialog";
import Select from "~/components/Select";
import TextInput from "~/components/TextInput";
import ImageInput from "~/components/ImageInput";
import Sort from "~/components/Sort";

import { Trash2, Plus, Check } from "lucide-react";

import comma from "~/utils/comma";

import { i18n } from "~/utils/i18n";
import { getRelativeTimeString } from "~/utils/timeString";

import {
  type Media,
  type MediaSorting,
  MediaType,
  type SortingOrder,
} from "~/utils/types";

import nanoid from "~/utils/nanoid";

import type { RequestData as Data } from "~/pages/api/autogen";

const MediaRelation = {
  [i18n("prequel")]: "PREQUEL",
  [i18n("sequel")]: "SEQUEL",
  [i18n("adaptation")]: "ADAPTATION",
  [i18n("sideStory")]: "SIDE_STORY",
  [i18n("child")]: "CONTAINS",
  [i18n("parent")]: "PARENT",
};

const MediaFormat = {
  [i18n("anime")]: "TV",
  [i18n("manga")]: "MANGA",
  [i18n("movie")]: "MOVIE",
  [i18n("OVA")]: "OVA",
  [i18n("ONA")]: "ONA",
  [i18n("oneShot")]: "ONE_SHOT",
  [i18n("novel")]: "NOVEL",
  [i18n("videoGame")]: "VIDEO_GAME",
};

const defaultImage =
  "https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg";

const Media = ({
  dirty,
  signal,
  media,
  visible,
  sorting,
  order,
  sortMedia,
}: {
  dirty: React.RefObject<boolean>;
  signal: React.RefObject<Media>;
  media: React.RefObject<Media[]>;
  visible: boolean;
  sorting: React.RefObject<MediaSorting>;
  order: React.RefObject<SortingOrder>;
  sortMedia: () => void;
}) => {
  const [, updateState] = useState({});
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  const [newAliasValue, setNewAliasValue] = useState("");
  const [substringQuery, setSubstringQuery] = useState("");

  // used to force the entire component to redrew
  const forceUpdate = useCallback(() => updateState({}), []);

  const onMediaUpdate = useCallback(() => {
    dirty.current = true;
    signal.current.updated = new Date().toISOString();
    sortMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAutogenerate = useCallback(() => {
    setDescriptionLoading(true);

    const mediaTitle = signal.current.title.english;

    fetch("/api/autogen", {
      method: "POST",
      body: JSON.stringify({ mediaTitle } satisfies Data),
    })
      .then(async (response) => {
        if (!response.ok) {
          signal.current.description = "Internal Server Error";
          return;
        }

        const data: { content: string } = await response.json();

        if (!data?.content) {
          signal.current.description = "Internal Server Error";
          return;
        }

        signal.current.description = data.content;
      })
      .finally(() => {
        setDescriptionLoading(false);
        onMediaUpdate();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal.current]);

  return (
    <div className={visible ? "" : "hidden"}>
      <div
        className={
          "flex flex-col gap-8 max-w-[980px] mx-auto pb-[15vh] pt-[2.5vh]"
        }
      >
        <button
          data-dialog={"media"}
          className={"flex justify-start gap-2 bg-transparent"}
          onClick={() => {
            const item: Media = {
              id: `${nanoid(4)}`,
              title: { english: "" },
              type: MediaType.Anime,
              added: new Date().toISOString(),
            };

            media.current = [item, ...media.current];

            signal.current = item;
          }}
        >
          <Plus className={"w-4 h-4"} />
          {i18n("addNewMedia")}
        </button>
        <TextInput
          placeholder={i18n("searchMediaPlaceholder")}
          className={"border-b-2 border-grey border-solid rounded-[0px]"}
          onInput={(value) => setSubstringQuery(value)}
          value={substringQuery}
        />
        <div
          className={
            "flex flex-row max-h-[30px] items-center border-grey border-b-2 py-8 gap-3"
          }
        >
          <div className={"w-auto h-[90px] aspect-[90/127] mr-4"} />
          <Sort name={"title"} order={order} sorting={sorting}>
            {i18n("title")}
          </Sort>
          <Sort name={"popularity"} order={order} sorting={sorting}>
            {i18n("popularity")}
          </Sort>
          <Sort name={"updated"} order={order} sorting={sorting}>
            {i18n("updated")}
          </Sort>
        </div>

        {Object.values(media.current).map((_media, i) => {
          const title = _media.title.english ?? "";

          const substringIndex = title
            .toLocaleLowerCase()
            .indexOf(substringQuery.toLocaleLowerCase());

          if (substringQuery.length > 0 && substringIndex <= -1) {
            return undefined;
          }

          const date = _media.updated ?? _media.added;

          const timeString = date ? getRelativeTimeString(new Date(date)) : "";

          const titleBeforeSubstring = title.slice(0, substringIndex);
          const titleSubstring = title.slice(
            substringIndex,
            substringIndex + substringQuery.length
          );
          const titleAfterSubstring = title.slice(
            substringIndex + substringQuery.length
          );

          return (
            <div
              key={media.current[i].id}
              className={
                "flex flex-row items-center p-2 gap-3 cursor-pointer hover:bg-highlight"
              }
              onClick={() => {
                signal.current = media.current[i];
                requestAnimationFrame(() => showDialog("media"));
              }}
            >
              <img
                className={
                  "bg-grey w-auto h-[90px] aspect-[90/127] mr-4 object-cover object-center"
                }
                src={_media.images?.[0]?.url ?? defaultImage}
              />
              <i className={"basis-full"}>
                {titleBeforeSubstring}
                <span className={"bg-yellow-300 text-embed"}>
                  {titleSubstring}
                </span>
                {titleAfterSubstring}
              </i>
              <i className={"basis-full"}>{comma(_media.popularity ?? 0)}</i>
              <i className={"basis-full"}>{timeString}</i>
            </div>
          );
        })}
      </div>

      <Dialog
        name={"media"}
        className={
          "flex items-center justify-center w-full h-full left-0 top-0 pointer-events-none"
        }
      >
        <div
          className={
            "bg-embed2 flex flex-col gap-y-6 overflow-x-hidden overflow-y-auto rounded-[10px] m-4 p-4 h-[80vh] w-[80vw] max-w-[680px] pointer-events-auto"
          }
        >
          <div className={"flex flex-row-reverse ml-auto gap-2"}>
            <Check
              className={"w-[24px] h-[24px] cursor-pointer"}
              onClick={() => {
                forceUpdate();
                requestAnimationFrame(() => hideDialog("media"));
              }}
            />

            <Trash2
              className={"w-[24px] h-[24px] cursor-pointer text-red"}
              onClick={() => {
                const i = media.current.findIndex(
                  ({ id }) => signal.current.id === id
                );

                if (i > -1 && confirm(i18n("deleteMedia"))) {
                  media.current.splice(i, 1);
                  forceUpdate();
                  requestAnimationFrame(() => hideDialog("media"));
                }
              }}
            />
          </div>

          <div className={"flex gap-8 flex-wrap"}>
            <ImageInput
              name={signal.current.id}
              key={`${signal.current.id}-image`}
              className={
                "w-auto h-[192px] object-cover object-center aspect-[90/127] mx-auto flex-shrink-0"
              }
              default={signal.current.images?.[0]?.url ?? ""}
              accept={["image/png", "image/jpeg", "image/webp"]}
              onChange={(image) => {
                signal.current.images = [image];
                onMediaUpdate();
                forceUpdate();
              }}
            />
            <div className={"flex flex-col grow gap-4 h-min my-auto"}>
              <TextInput
                className={"text-disabled"}
                placeholder={i18n("imageUrl").toUpperCase()}
                value={
                  signal.current.images?.[0]?.file?.name ??
                  signal.current.images?.[0]?.url
                }
                onInput={(value) => {
                  signal.current.images = [{ url: value }];
                  onMediaUpdate();
                  forceUpdate();
                }}
                key={`${signal.current.id}-imageurl`}
              />
              <button className={"flex-row w-full grow"}>
                <label
                  className={"grow cursor-pointer"}
                  htmlFor={signal.current.id}
                >
                  {i18n("uploadFromPC")}
                </label>
              </button>
            </div>
          </div>

          <Select
            required
            list={MediaType}
            label={i18n("type")}
            defaultValue={signal.current.type}
            onChange={(t: MediaType) => {
              signal.current.type = t;
              onMediaUpdate();
            }}
          />

          <TextInput
            required
            pattern=".{1,128}"
            label={i18n("title")}
            value={signal.current.title.english ?? ""}
            onInput={(value) => {
              signal.current.title.english = value;
              onMediaUpdate();
            }}
            key={`${signal.current.id}-title`}
          />

          <Select
            list={MediaFormat}
            label={i18n("format")}
            defaultValue={signal.current.format}
            onChange={(f) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              signal.current.format = (f as any) || undefined;
              onMediaUpdate();
            }}
          />

          <TextInput
            min={0}
            max={2147483647}
            type={"number"}
            label={i18n("popularity")}
            value={signal.current.popularity ?? 0}
            hint={i18n("popularityHint")}
            onInput={(value) => {
              signal.current.popularity = Number(value ?? 0);
              onMediaUpdate();
            }}
            key={`${signal.current.id}-popularity`}
          />

          <TextInput
            multiline
            disabled={descriptionLoading}
            pattern=".{1,2048}"
            label={i18n("description")}
            placeholder={i18n("placeholderMediaDescription")}
            value={signal.current.description}
            className={"min-h-[20vh]"}
            onInput={(value) => {
              signal.current.description = value;
              onMediaUpdate();
            }}
            key={`${signal.current.id}-description`}
          >
            {!signal.current.description && !descriptionLoading ? (
              <button
                onClick={onAutogenerate}
                className={
                  "absolute bottom-3 left-[50%] translate-x-[-50%] bg-highlight"
                }
              >
                {i18n("autoGen")}
              </button>
            ) : undefined}
            {descriptionLoading ? (
              <LoadingSpinner className="absolute right-6 bottom-4 inline w-8 h-8 animate-spin text-grey fill-white" />
            ) : undefined}
          </TextInput>

          <div className={"flex flex-col gap-2"}>
            <label className={"uppercase text-disabled text-[0.8rem]"}>
              {i18n("aliases")}
            </label>
            <label className={"text-disabled text-[0.75rem]"}>
              {i18n("aliasesHint")}
            </label>
            <div className={"flex flex-wrap gap-2"}>
              {signal.current.title.alternative?.map((alias, i) => (
                <div
                  className={
                    "flex items-center justify-center bg-embed rounded-[100vw] px-6 py-4 gap-2"
                  }
                  key={i}
                >
                  <i>{alias}</i>
                  <Trash2
                    className={"w-[16px] h-auto cursor-pointer text-red"}
                    onClick={() => {
                      // deno-lint-ignore no-non-null-assertion
                      signal.current.title.alternative!.splice(i, 1);
                      onMediaUpdate();
                      forceUpdate();
                    }}
                  />
                </div>
              ))}

              {(signal.current.title.alternative?.length ?? 0) < 5 ? (
                <div
                  className={
                    "flex items-center justify-center bg-embed rounded-[100vw] px-6 py-4 gap-2"
                  }
                >
                  <input
                    placeholder={"Harry Potter: 11th Book"}
                    value={newAliasValue}
                    className={
                      "border-0 p-0 rounded-[100vw] bg-embed text-[0.8rem] w-[180px]"
                    }
                    onInput={(event) =>
                      setNewAliasValue((event.target as HTMLInputElement).value)
                    }
                  />
                  <Plus
                    className={[
                      "w-[16px] h-auto",
                      (newAliasValue?.length || 0) <= 0
                        ? "pointer-events-none opacity-60"
                        : "cursor-pointer",
                    ].join(" ")}
                    onClick={() => {
                      if (!signal.current.title.alternative) {
                        signal.current.title.alternative = [];
                      }

                      signal.current.title.alternative.push(newAliasValue);

                      setNewAliasValue("");

                      onMediaUpdate();

                      forceUpdate();
                    }}
                  />
                </div>
              ) : undefined}
            </div>
          </div>

          <div className={"flex flex-col"}>
            <label className={"uppercase text-disabled text-[0.8rem]"}>
              {i18n("relations")}
            </label>
            <div className={"flex flex-col gap-2"}>
              {media.current
                .filter(({ id }) => id !== signal.current.id)
                .map((media, _i) => {
                  const defaultValue = Number(
                    signal.current.relations?.findIndex(
                      (r) => r.mediaId === media.id
                    )
                  );

                  return (
                    <div key={_i} className={"flex items-center gap-4"}>
                      <i
                        className={
                          "inline h-min basis-1/2 font-[700] overflow-hidden overflow-ellipsis"
                        }
                      >
                        {media.title.english}
                      </i>
                      <Select
                        className={"basis-1/2"}
                        nullLabel={i18n("no-relation")}
                        list={MediaRelation}
                        defaultValue={
                          defaultValue > -1
                            ? // deno-lint-ignore no-non-null-assertion
                              signal.current.relations![defaultValue].relation
                            : undefined
                        }
                        onChange={(r) => {
                          const exists = Number(
                            signal.current.relations?.findIndex(
                              (r) => r.mediaId === media.id
                            )
                          );

                          if (exists > -1) {
                            if (r) {
                              // deno-lint-ignore  no-non-null-assertion
                              signal.current.relations![exists].relation =
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                r as any;
                            } else {
                              // deno-lint-ignore no-non-null-assertion
                              signal.current.relations!.splice(exists, 1);
                            }
                          } else {
                            if (!signal.current.relations) {
                              signal.current.relations = [];
                            }

                            signal.current.relations.push({
                              mediaId: media.id,
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              relation: r as any,
                            });

                            onMediaUpdate();
                          }
                        }}
                      />
                    </div>
                  );
                })}
            </div>
          </div>

          <div className={"flex flex-col"}>
            <label className={"uppercase text-disabled text-[0.8rem]"}>
              {i18n("links")}
            </label>
            <Notice type={"info"}>{i18n("linksNotice")}</Notice>
            <div className={"flex flex-col gap-2"}>
              {signal.current.externalLinks?.map((link, i) => (
                <div key={i} className={"flex items-center flex-wrap gap-2"}>
                  <TextInput
                    required
                    value={link.site}
                    placeholder={"YouTube"}
                    onInput={(site) => {
                      // deno-lint-ignore no-non-null-assertion
                      signal.current.externalLinks![i].site = site;
                      onMediaUpdate();
                    }}
                    key={`${signal.current.id}-link-${i}-site`}
                  />
                  <TextInput
                    required
                    value={link.url}
                    pattern={
                      "^(https:\\/\\/)?(www\\.)?(youtube\\.com|twitch\\.tv|netflix\\.com|crunchyroll\\.com|tapas\\.io|webtoons\\.com|amazon\\.com)[\\S]*$"
                    }
                    placeholder={"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
                    onInput={(url) => {
                      // deno-lint-ignore no-non-null-assertion
                      signal.current.externalLinks![i].url = url;
                      onMediaUpdate();
                    }}
                    key={`${signal.current.id}-link-${i}-url`}
                  />
                  <Trash2
                    className={"w-[24px] h-auto cursor-pointer text-red"}
                    onClick={() => {
                      // deno-lint-ignore no-non-null-assertion
                      signal.current.externalLinks!.splice(i, 1);
                      onMediaUpdate();
                      forceUpdate();
                    }}
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  if (!signal.current.externalLinks) {
                    signal.current.externalLinks = [];
                  }

                  signal.current.externalLinks.push({
                    site: "",
                    url: "",
                  });

                  forceUpdate();
                }}
              >
                <Plus />
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

const LoadingSpinner = (props: { className: string }) => {
  return (
    <svg className={props.className} viewBox="0 0 100 101">
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
  );
};

export default Media;
