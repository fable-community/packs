import { useCallback, useEffect, useState, useRef } from "react";

import { serialize } from "bson";

import ImageInput, { type IImageInput } from "~/components/ImageInput";
import Dialog from "~/components/Dialog";
import { Dismissible } from "~/components/Notice";
import Media from "~/components/Media";
import Characters from "~/components/Characters";
import Maintainers from "~/components/Maintainers";
import Conflicts from "~/components/Conflicts";
import TextInput from "~/components/TextInput";
import PublishPopup from "~/components/PublishPopup";
import HowToInstallDialog from "~/components/HowToInstallDialog";

import { useEffectIgnoreMount } from "~/components/useEffectIgnoreMount";

import { Home, Check, Settings2, ClipboardCopy, Download } from "lucide-react";

import {
  sortCharacters as _sortCharacters,
  sortMedia as _sortMedia,
} from "~/utils/sorting";

import { i18n } from "~/utils/i18n";

import type { Data } from "~/pages/api/publish";

import {
  type Character,
  type CharacterSorting,
  type Media as TMedia,
  type MediaSorting,
  MediaType,
  type Pack,
  type SortingOrder,
  type User,
} from "~/utils/types";

const IS_BROWSER = typeof document !== "undefined";

const Manage = (props: { user: User; pack: Pack }) => {
  const url = new URLSearchParams(IS_BROWSER ? location.search : "");

  const pack: Readonly<Pack["manifest"]> = JSON.parse(
    JSON.stringify(props.pack.manifest)
  );

  const dirty = useRef(false);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [howToInstallVisible] = useState(url.has("new"));

  const packIdRef = useRef<string>(pack.id);
  const titleRef = useRef<string | undefined>(pack.title);
  const privacyRef = useRef<boolean | undefined>(pack.private);
  const nsfwRef = useRef<boolean | undefined>(pack.nsfw);
  const authorRef = useRef<string | undefined>(pack.author);
  const descriptionRef = useRef<string | undefined>(pack.description);
  const webhookUrlRef = useRef<string | undefined>(pack.webhookUrl);
  const imageRef = useRef<IImageInput | undefined>(undefined);

  const maintainersRef = useRef(pack.maintainers ?? []);
  const conflictsRef = useRef(pack.conflicts ?? []);

  const characterDataRef = useRef<Character>({
    name: { english: "" },
    id: "",
  });

  const mediaDataRef = useRef<TMedia>({
    type: MediaType.Anime,
    title: { english: "" },
    id: "",
  });

  const mediaSortingRef = useRef<MediaSorting>("updated");
  const mediaSortingOrderRef = useRef<SortingOrder>("desc");

  const charactersSortingRef = useRef<CharacterSorting>("updated");
  const charactersSortingOrderRef = useRef<SortingOrder>("desc");

  const mediaRef = useRef(
    _sortMedia(
      pack.media?.new ?? [],
      mediaSortingRef.current,
      mediaSortingOrderRef.current
    )
  );

  const charactersRef = useRef(
    _sortCharacters(
      pack.characters?.new ?? [],
      mediaRef.current,
      charactersSortingRef.current,
      charactersSortingOrderRef.current
    )
  );

  const sortMedia = useCallback(() => {
    mediaRef.current = _sortMedia(
      mediaRef.current,
      mediaSortingRef.current,
      mediaSortingOrderRef.current
    );
  }, []);

  const sortCharacters = useCallback(() => {
    charactersRef.current = _sortCharacters(
      charactersRef.current,
      mediaRef.current,
      charactersSortingRef.current,
      charactersSortingOrderRef.current
    );
  }, []);

  useEffect(() => {
    sortMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaSortingRef.current, mediaSortingOrderRef.current, sortMedia]);

  useEffect(() => {
    sortCharacters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    charactersSortingRef.current,
    charactersSortingOrderRef.current,
    sortCharacters,
  ]);

  useEffectIgnoreMount(() => {
    dirty.current = true;
  }, [
    titleRef.current,
    nsfwRef.current,
    privacyRef.current,
    authorRef.current,
    descriptionRef.current,
    webhookUrlRef.current,
    imageRef.current,
    mediaRef.current.length,
    charactersRef.current.length,
    maintainersRef.current.length,
    conflictsRef.current.length,
  ]);

  const getData = (): Data => ({
    old: props.pack?.manifest ?? pack,
    title: titleRef.current,
    private: privacyRef.current,
    nsfw: nsfwRef.current,
    author: authorRef.current,
    description: descriptionRef.current,
    webhookUrl: webhookUrlRef.current,
    image: imageRef.current,
    media: mediaRef.current,
    characters: charactersRef.current,
    maintainers: maintainersRef.current,
    conflicts: conflictsRef.current,
  });

  const onPublish = async () => {
    const body = {
      new: false,
      ...getData(),
      username: props.user.display_name ?? props.user.username ?? "undefined",
    };

    setLoading(true);

    try {
      const response = await fetch(`/api/publish`, {
        method: "POST",
        body: serialize(body),
      });

      if (response.status === 200) {
        dirty.current = false;
        setLoading(false);
      } else {
        const text = await response.text();

        if (!text.startsWith("{")) {
          setError(text);
          console.error(text);
        } else {
          const { errors, pack } = JSON.parse(text) as {
            pack: {
              media?: { id: string }[];
              characters?: { id: string }[];
            };
            errors: {
              instancePath: string;
              keyword: string;
              message: string;
              params: { limit?: number };
              schemaPath: string;
            }[];
          };

          document
            .querySelectorAll(`[invalid]`)
            .forEach((ele) => ele.removeAttribute(`invalid`));

          document
            .querySelectorAll(`[shake]`)
            .forEach((ele) => ele.removeAttribute(`shake`));

          console.error(errors);

          errors.forEach((err) => {
            if (typeof err === "string") {
              setError(err);
              console.error(err);
            } else {
              const path = err.instancePath.substring(1).split("/");

              console.error(path);

              if (path[0] === "media" || path[0] === "characters") {
                if (path[1] === "new") {
                  const i = parseInt(path[2]);

                  const item =
                    path[0] === "characters"
                      ? // deno-lint-ignore no-non-null-assertion
                        pack.characters![i]
                      : // deno-lint-ignore no-non-null-assertion
                        pack.media![i];

                  const child = document.querySelector(`._${item.id}`);

                  setTimeout(() => {
                    child?.setAttribute("shake", "true");
                    child?.setAttribute("invalid", "true");
                  }, 100);
                }
              }
            }
          });
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: Error | any) {
      setError(err?.message);
      console.error(err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Dismissible>{error}</Dismissible>}

      <div
        className={
          "flex fixed top-0 left-0 w-full h-full bg-embed overflow-x-hidden overflow-y-auto"
        }
      >
        {/* this component require client-side javascript enabled */}
        <noscript>{i18n("noScript")}</noscript>

        <HowToInstallDialog
          packId={packIdRef.current}
          visible={howToInstallVisible}
        />

        <div className={"m-4 w-full h-full"}>
          <div className={"flex items-center gap-4 w-full"}>
            <a href={"/dashboard"}>
              <Home className={"w-[28px] h-[28px] cursor-pointer"} />
            </a>

            <ImageInput
              name={"pack-image"}
              default={pack.image}
              className={"w-[44px] aspect-square rounded-full"}
              accept={["image/png", "image/jpeg", "image/webp"]}
              onChange={(value) => {
                imageRef.current = value;
                dirty.current = true;
              }}
            />

            <input
              type={"text"}
              value={titleRef.current}
              pattern=".{3,128}"
              className={"bg-embed h-[48px] grow"}
              placeholder={i18n("packTitle")}
              onInput={(ev) => {
                titleRef.current = (ev.target as HTMLInputElement).value;
                dirty.current = true;
              }}
            />

            <PublishPopup
              loading={loading}
              dirty={dirty.current}
              onPublish={onPublish}
            />

            <Settings2
              className={"w-[28px] h-[28px] cursor-pointer"}
              data-dialog={"extra"}
            />
          </div>

          <div className={"grid grid-flow-col overflow-auto mt-2"}>
            {(i18n("tabs") as unknown as string[]).map((s, i) => (
              <div
                key={i}
                className={[
                  "text-center px-1 py-4 font-[600] uppercase cursor-pointer border-b-2 hover:border-white",
                  active === i ? "border-white" : "border-grey",
                ].join(" ")}
                onClick={() => setActive(i)}
              >
                {s}
              </div>
            ))}
          </div>

          <Characters
            dirty={dirty}
            signal={characterDataRef}
            visible={active === 0}
            order={charactersSortingOrderRef}
            sorting={charactersSortingRef}
            sortCharacters={sortCharacters}
            characters={charactersRef}
            media={mediaRef}
          />

          <Media
            dirty={dirty}
            signal={mediaDataRef}
            visible={active === 1}
            order={mediaSortingOrderRef}
            sorting={mediaSortingRef}
            sortMedia={sortMedia}
            media={mediaRef}
          />

          <Maintainers
            visible={active === 2}
            owner={props.pack?.owner ?? props.user.id}
            maintainers={maintainersRef}
          />

          <Conflicts visible={active === 3} conflicts={conflictsRef.current} />
        </div>

        <Dialog
          name={"extra"}
          className={
            "flex items-center justify-center w-full h-full left-0 top-0 pointer-events-none"
          }
        >
          <div
            className={
              "flex flex-col gap-6 bg-embed2 overflow-x-hidden overflow-y-auto rounded-xl m-4 p-6 h-[80vh] w-[70vw]  pointer-events-auto"
            }
          >
            <Check
              data-dialog-cancel={"extra"}
              className={"cursor-pointer w-[28px] h-[28px] ml-auto shrink-0	"}
            />

            {/* TODO not currently available */}
            {/* <div className={'flex gap-3 text-white opacity-90 uppercase'}>
                    <IconDownload className={'w-4 h-4'} />
                    {i18n('packServers', props.pack?.servers)}
                  </div> */}

            <div
              className={"bg-highlight flex items-center p-4 rounded-xl"}
              data-clipboard={`/packs install id: ${packIdRef.current}`}
            >
              <i className={"italic grow select-all"}>
                {`/packs install id: ${packIdRef.current}`}
              </i>
              <ClipboardCopy className={"w-[18px] h-[18px] cursor-pointer"} />
            </div>

            <button
              className={"bg-grey text-white py-2 cursor-pointer"}
              onClick={() => {
                const blob = new Blob([JSON.stringify(props.pack)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.download = `${props.pack.manifest.id}.json`;
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
            >
              <Download className={"w-[18px] h-[18px]"} />
              Export
            </button>

            <div className={"flex flex-col grow gap-2"}>
              <label className={"uppercase text-[0.8rem] text-disabled"}>
                {i18n("packVisibility")}
              </label>

              <div className={"flex flex-col rounded-xl overflow-hidden"}>
                <button
                  onClick={() => {
                    privacyRef.current = !privacyRef.current;
                    dirty.current = true;
                  }}
                  className={
                    "py-4 justify-start text-left flex gap-4 bg-embed hover:shadow-none"
                  }
                >
                  <div className={"p-2 border-2 border-grey rounded-lg"}>
                    <Check
                      className={
                        privacyRef.current ? "w-5 h-5 opacity-0" : "w-5 h-5"
                      }
                    />
                  </div>
                  <span>{i18n("publicPackNotice")}</span>
                </button>
              </div>
            </div>

            <div className={"flex flex-col grow gap-2"}>
              <label className={"uppercase text-[0.8rem] text-disabled"}>
                {i18n("packNSFW")}
              </label>

              <div className={"flex flex-col rounded-xl overflow-hidden"}>
                <button
                  onClick={() => {
                    nsfwRef.current = !nsfwRef.current;
                    dirty.current = true;
                  }}
                  className={
                    "py-4 justify-start text-left flex gap-4 bg-embed hover:shadow-none"
                  }
                >
                  <div className={"p-2 border-2 border-grey rounded-lg"}>
                    <Check
                      className={
                        !nsfwRef.current ? "w-5 h-5 opacity-0" : "w-5 h-5"
                      }
                    />
                  </div>
                  <span>{i18n("packNSFWHint")}</span>
                </button>
              </div>
            </div>

            <TextInput
              value={authorRef.current}
              label={i18n("packAuthor")}
              placeholder={i18n("placeholderPackAuthor")}
              onInput={(value) => {
                authorRef.current = value;
                dirty.current = true;
              }}
            />

            <TextInput
              multiline
              value={descriptionRef.current}
              label={i18n("packDescription")}
              placeholder={i18n("placeholderPackDescription")}
              onInput={(value) => {
                descriptionRef.current = value;
                dirty.current = true;
              }}
            />

            <TextInput
              value={webhookUrlRef.current}
              label={i18n("packWebhookUrl")}
              hint={i18n("packWebhookUrlHint")}
              pattern={"https://discord.com/api/webhooks/[0-9]{18,19}/.+"}
              placeholder={
                "https://discord.com/api/webhooks/185033133521895424/AAabbb"
              }
              onInput={(value) => {
                webhookUrlRef.current = value;
                dirty.current = true;
              }}
            />
          </div>
        </Dialog>
      </div>
    </>
  );
};

export default Manage;
