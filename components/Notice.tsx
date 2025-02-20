"use client";

import { HTMLAttributes, useRef } from "react";

import { Info, XCircle } from "lucide-react";

const Notice = ({
  type,
  ...props
}: {
  type: "warn" | "error" | "info";
} & HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={"text-white flex justify-center items-center my-1 p-1 gap-2"}
      data-type={type}
      {...props}
    >
      <Info className={`min-w-[18px] min-h-[18px] text-${type}`} />
      <div className={"mr-auto"}>{props.children}</div>
    </div>
  );
};

export const Dismissible = (props: HTMLAttributes<HTMLDivElement>) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      {...props}
      ref={ref}
      className={
        "text-white bg-red fixed flex justify-center items-center z-[99] select-text bottom-0 left-0 m-3 p-3 max-w-[50vw] min-w-[20vw] rounded-[5px] gap-2"
      }
      data-type={"error"}
    >
      <Info className={`min-w-[18px] min-h-[18px] text-white`} />

      <div className={"mr-auto"}>{props.children}</div>

      <div className={"cursor-pointer"} onClick={() => ref.current?.remove()}>
        <XCircle className={`min-w-[18px] min-h-[18px] text-white`} />
      </div>
    </div>
  );
};

export default Notice;
