/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

import type { Pack } from "~/utils/types.ts";

const defaultImage =
  "https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg";

const Card = ({ pack }: { pack: Pack }) => {
  return (
    <a
      className={
        "bg-embed w-[128px] min-h-[32px] rounded-xl px-[16px] py-[24px] hover:translate-y-[-8px] transition-all duration-150"
      }
      href={`/${pack.manifest.id}/edit`}
    >
      <img
        className={
          "bg-grey w-[128px] h-auto aspect-square rounded-xl object-cover"
        }
        src={pack.manifest.image ?? defaultImage}
      />
      <div className={"truncate mt-0.5"}>
        {pack.manifest.title ?? pack.manifest.id}
      </div>
    </a>
  );
};

export default Card;
