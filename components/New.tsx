import { useRef, useState } from "react";

import { serialize } from "bson";

import TextInput from "~/components/TextInput";
import ImageInput, { type IImageInput } from "~/components/ImageInput";

import { Dismissible } from "~/components/Notice";

import { Check, Lock, LockOpen, Home } from "lucide-react";

const idRegex = /[^-_a-z0-9]+/g;

import { i18n } from "~/utils/i18n";

import type { Data } from "~/pages/api/publish";
import type { User } from "~/utils/types";

const New = (props: { user: User }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const [packId, setPackId] = useState<string | undefined>("");
  const [packIdManual, setPackIdManual] = useState<boolean>(false);

  const [title, setTitle] = useState<string | undefined>("");
  const [privacy, setPrivacy] = useState<boolean | undefined>(false);
  const [nsfw, setNsfw] = useState<boolean | undefined>(false);
  const [author, setAuthor] = useState<string | undefined>("");
  const [description, setDescription] = useState<string | undefined>("");
  const [image, setImage] = useState<IImageInput | undefined>(undefined);

  const packTitleInputRef = useRef<HTMLInputElement>(null);
  const packIdInputRef = useRef<HTMLInputElement>(null);

  const getData = (): Data => ({
    old: { id: packId! },
    title,
    private: privacy,
    nsfw,
    author,
    description,
    image,
  });

  const onLockUnlockId = () => {
    setPackIdManual(!packIdManual);

    if (!packIdManual) {
      setPackId(autoId(title));
    } else {
      setPackId("");
      packIdInputRef.current?.focus();
    }
  };

  const onPublish = async () => {
    const body = {
      ...getData(),
      new: true,
      username: props.user.display_name ?? props.user.username ?? "undefined",
    };

    setLoading(true);

    try {
      const response = await fetch(`/api/publish`, {
        method: "POST",
        body: serialize(body),
      });

      if (response.status === 200) {
        location.replace(`${encodeURIComponent(packId!)}/edit?new`);
      } else {
        const text = await response.text();

        if (!text.startsWith("{")) {
          setError(text);
          console.error(text);
        } else {
          const { errors } = JSON.parse(text) as {
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
            const path = err.instancePath.substring(1).split("/");

            console.error(path);

            setTimeout(() => {
              if (path[0] === "id" && packIdManual) {
                packIdInputRef.current?.setAttribute("shake", "true");
                packIdInputRef.current?.setAttribute("invalid", "true");
              } else if (path[0] === "id") {
                packTitleInputRef.current?.setAttribute("shake", "true");
                packTitleInputRef.current?.setAttribute("invalid", "true");
              }
            }, 100);
          });
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: Error | any) {
      console.error(setError(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error ? <Dismissible>{error}</Dismissible> : undefined}

      <div
        className={
          "flex fixed top-0 left-0 w-full h-full bg-embed overflow-x-hidden overflow-y-auto"
        }
      >
        {/* this component require client-side javascript enabled */}
        <noscript>{i18n("noScript")}</noscript>

        <div className={"m-4 w-full"}>
          <div className={"flex items-center gap-4 w-full"}>
            <a href={"/dashboard"}>
              <Home className={"w-[28px] h-[28px] cursor-pointer"} />
            </a>

            <div className={"grow"}></div>

            <button
              onClick={onPublish}
              className={
                loading
                  ? "py-3 disabled pointer-events-none"
                  : "py-3 bg-discord"
              }
            >
              {loading ? (
                <LoadingSpinner className="inline w-5 h-5 animate-spin text-grey fill-white" />
              ) : (
                i18n("next")
              )}
            </button>
          </div>

          <div className={"flex gap-4 mt-8"}>
            <ImageInput
              name={"pack-image"}
              className={"w-[128px] h-[128px] aspect-square"}
              accept={["image/png", "image/jpeg", "image/webp"]}
              onChange={(value) => setImage(value)}
            />

            <div className={"flex flex-col grow gap-4"}>
              <TextInput
                ref={packTitleInputRef}
                value={title}
                className={"border-2 border-grey rounded-xl bg-embed2"}
                label={i18n("packTitle")}
                pattern=".{3,128}"
                placeholder={i18n("placeholderPackTitle")}
                onInput={(value) => {
                  setTitle(value);
                  if (!packIdManual) setPackId(autoId(value));
                }}
              />

              <div
                className={[
                  "flex items-center border-2 border-grey py-2 px-6 gap-2 rounded-lg",
                  packIdManual ? "bg-embed2" : "",
                ].join(" ")}
              >
                <p className={"text-white text-[0.95rem]"}>
                  {"/packs install id: "}
                </p>
                <input
                  type={"text"}
                  value={packId}
                  ref={packIdInputRef}
                  pattern="[\-a-z0-9]{1,20}"
                  placeholder={i18n("placeholderPackId")}
                  className={
                    packIdManual
                      ? "h-[48px] text-white grow font-medium bg-embed2"
                      : "h-[48px] text-white grow font-medium disabled pointer-events-none !border-0"
                  }
                  onInput={(ev) =>
                    setPackId((ev.target as HTMLInputElement).value)
                  }
                />
                <div
                  className={"p-2 cursor-pointer hover:bg-highlight rounded-xl"}
                  onClick={onLockUnlockId}
                >
                  {packIdManual ? <LockOpen /> : <Lock />}
                </div>
              </div>
            </div>
          </div>

          <div className={"flex flex-col gap-4 my-4"}>
            <label className={"uppercase text-[0.8rem] text-disabled"}>
              {i18n("packAuthor")}
            </label>

            <TextInput
              value={author}
              className={"border-2 border-grey rounded-xl bg-embed2"}
              placeholder={i18n("placeholderPackAuthor")}
              onInput={(value) => setAuthor(value)}
            />

            <label className={"uppercase text-[0.8rem] text-disabled"}>
              {i18n("packDescription")}
            </label>

            <TextInput
              multiline
              value={description}
              className={"border-2 border-grey rounded-xl bg-embed2"}
              placeholder={i18n("placeholderPackDescription")}
              onInput={(value) => setDescription(value)}
            />

            <label className={"uppercase text-[0.8rem] text-disabled"}>
              {i18n("packVisibility")}
            </label>

            <div className={"flex flex-col rounded-xl overflow-hidden"}>
              <button
                onClick={() => setPrivacy(!privacy)}
                className={
                  "justify-start text-left flex gap-4 bg-embed hover:shadow-none px-1 py-0"
                }
              >
                <div className={"p-2 border-2 border-grey rounded-lg"}>
                  <Check
                    className={privacy ? "w-5 h-5 opacity-0" : "w-5 h-5"}
                  />
                </div>

                <span>{i18n("publicPackNotice")}</span>
              </button>
            </div>

            <label className={"uppercase text-[0.8rem] text-disabled"}>
              {i18n("packNSFW")}
            </label>

            <div className={"flex flex-col rounded-xl overflow-hidden"}>
              <button
                onClick={() => setNsfw(!nsfw)}
                className={
                  "justify-start text-left flex gap-4 bg-embed hover:shadow-none px-1 py-0"
                }
              >
                <div className={"p-2 border-2 border-grey rounded-lg"}>
                  <Check className={!nsfw ? "w-5 h-5 opacity-0" : "w-5 h-5"} />
                </div>
                <span>{i18n("packNSFWHint")}</span>
              </button>
            </div>

            <div className={"mb-[20vh]"}></div>
          </div>
        </div>
      </div>
    </>
  );
};

const autoId = (s?: string): string | undefined =>
  s?.toLowerCase().replace(/\s+/, "-").replace(idRegex, "");

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

export default New;
