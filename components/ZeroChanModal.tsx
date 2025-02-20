/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

import TextInput from "~/components/TextInput";

import { ArrowLeft } from "lucide-react";

import { i18n } from "~/utils/i18n";

import { useDebounce } from "~/utils/useDebounce";

import type { Data, Image } from "~/app/api/zerochan/route";

export const ZeroChanModal = ({
  character,
  media,
  onVisibleChange,
  callback,
}: {
  media?: string;
  character?: string;
  onVisibleChange: (visible: boolean) => void;
  callback: (imageUrl: string) => void;
}) => {
  const [error, setError] = useState("");
  const [images, setImages] = useState<Image[]>([]);

  const [debouncedQuery, query, setQuery] = useDebounce("", 300);

  useEffect(
    () =>
      setQuery(
        [
          media?.replaceAll(":", ""),
          character?.replaceAll(":", ""),
          character?.replaceAll(":", "") + ` (${media?.replaceAll(":", "")})`,
        ].join(",")
      ),
    [media, character, setQuery]
  );

  useEffect(() => {
    if (!debouncedQuery) return;

    setImages([]);
    setError("");

    fetch("/api/zerochan", {
      method: "POST",
      body: JSON.stringify({ query: debouncedQuery } satisfies Data),
    })
      .then((res) => {
        if (res.status !== 200) {
          setError(res.statusText);
          return;
        }

        return res.json();
      })
      .then((data: { images: Image[] }) => {
        if (data?.images) setImages(images ?? []);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  return (
    <>
      <div
        className={"w-full cursor-pointer"}
        onClick={() => onVisibleChange(false)}
      >
        <ArrowLeft className={"w-[24px] h-[24px]"} />
      </div>

      <TextInput
        placeholder={i18n("search")}
        onInput={(value) => setQuery(value)}
        value={query}
      />

      <div className={"flex flex-wrap grow justify-center gap-4"}>
        {error ? <span>{error}</span> : undefined}

        {!error && images.length <= 0 ? (
          <span>{i18n("loading")}</span>
        ) : undefined}

        {images.map((image) => (
          <img
            key={image.id}
            className={
              "w-auto h-[192px] object-cover object-center aspect-[90/127] cursor-pointer hover:scale-95 hover:border-[3px] border-white border-solid"
            }
            src={image.thumbnail}
            onClick={() => {
              callback(image.thumbnail);
              onVisibleChange(false);
            }}
          />
        ))}
      </div>
    </>
  );
};
