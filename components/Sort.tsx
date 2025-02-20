import { ArrowUp, ArrowDown } from "lucide-react";
import React, { HTMLAttributes } from "react";

import type {
  CharacterSorting,
  MediaSorting,
  SortingOrder,
} from "~/utils/types.ts";

const Sort = ({
  name,
  order,
  sorting,
  children,
  ...props
}: {
  name: CharacterSorting | MediaSorting;
  sorting: React.RefObject<CharacterSorting | MediaSorting>;
  order: React.RefObject<SortingOrder>;
} & HTMLAttributes<HTMLElement>) => {
  return (
    <i
      className={"basis-full flex flex-row gap-1 cursor-pointer"}
      {...props}
      onClick={() => {
        if (sorting.current !== name) {
          order.current = "desc";
        } else {
          order.current = order.current === "asc" ? "desc" : "asc";
        }

        sorting.current = name;
      }}
    >
      {children}
      {sorting.current === name ? (
        order.current === "desc" ? (
          <ArrowDown className={"w-[18px] h-auto"} />
        ) : (
          <ArrowUp className={"w-[18px] h-auto"} />
        )
      ) : undefined}
    </i>
  );
};

export default Sort;
