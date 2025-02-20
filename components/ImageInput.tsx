/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import { type HTMLAttributes, useRef } from "react";

import { Binary } from "bson";

import { ImagePlus } from "lucide-react";

export interface IImageInput {
  file?: {
    name: string;
    size: number;
    type: string;
    data: Binary;
  };
  url: string;
}

export const TEN_MB = 10000000;

const ImageInput = (props: {
  name: string;
  accept: string[];
  default?: string;
  className?: string;
  style?: HTMLAttributes<HTMLDivElement>["style"];
  onChange?: (value: IImageInput) => void;
}) => {
  const ref = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={props.style}
      className={`flex relative items-center justify-center overflow-hidden box-border border-2 border-grey ${props.className}`}
    >
      {!props.default ? (
        <i
          ref={placeholderRef}
          className={"text-grey absolute w-[28px] h-[28px]"}
        >
          <ImagePlus className={"w-full h-full"} />
        </i>
      ) : undefined}
      <img
        ref={ref}
        className={
          "absolute object-cover object-center indent-[-100vh] w-full h-full"
        }
        src={props.default ?? ""}
      />
      <label
        className={"absolute w-full h-full cursor-pointer"}
        htmlFor={props.name}
      />
      <input
        id={props.name}
        name={props.name}
        type={"file"}
        accept={props.accept.join(",")}
        style={{ visibility: "hidden" }}
        onChange={(ev) => {
          // deno-lint-ignore no-non-null-assertion
          const file = (ev.target as HTMLInputElement).files![0];

          const url = URL.createObjectURL(file);

          // deno-lint-ignore no-non-null-assertion
          ref.current!.src = url;

          // deno-lint-ignore no-non-null-assertion
          ref.current!.onload = () => {
            placeholderRef.current?.remove();

            if (file.size > TEN_MB) {
              // deno-lint-ignore no-non-null-assertion
              ref.current!.setAttribute("invalid", "true");
            } else {
              // deno-lint-ignore no-non-null-assertion
              ref.current!.removeAttribute("invalid");
            }
          };

          file.arrayBuffer().then((buffer) => {
            props.onChange?.({
              file: {
                name: file.name,
                size: file.size,
                type: file.type,
                data: new Binary(new Uint8Array(buffer)),
              },
              url,
            } as IImageInput);
          });
        }}
      />
    </div>
  );
};

export default ImageInput;
