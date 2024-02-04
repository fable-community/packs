import { useRef } from 'preact/hooks';

import { Binary } from 'bson';

import IconImage from 'icons/photo-plus.tsx';

import type { JSX } from 'preact/jsx-runtime';

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

export default (
  props: {
    name: string;
    accept: string[];
    default?: string;
    class?: string;
    style?: JSX.HTMLAttributes<HTMLDivElement>['style'];
    onChange?: (value: IImageInput) => void;
  },
) => {
  const ref = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={props.style}
      class={`flex relative items-center justify-center overflow-hidden box-border border-2 border-grey ${props.class}`}
    >
      {!props.default
        ? (
          <i
            ref={placeholderRef}
            class={'text-grey absolute w-[28px] h-[28px]'}
          >
            <IconImage class={'w-full h-full'} />
          </i>
        )
        : undefined}
      <img
        ref={ref}
        class={'absolute object-cover object-center indent-[-100vh] w-full h-full'}
        src={props.default ?? ''}
      />
      <label class={'absolute w-full h-full cursor-pointer'} for={props.name} />
      <input
        id={props.name}
        name={props.name}
        type={'file'}
        accept={props.accept.join(',')}
        style={{ visibility: 'hidden' }}
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
              ref.current!.setAttribute('invalid', 'true');
            } else {
              // deno-lint-ignore no-non-null-assertion
              ref.current!.removeAttribute('invalid');
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
