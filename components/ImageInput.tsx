import { useRef } from 'preact/hooks';

import { Binary } from 'bson';

import IconImage from 'icons/photo-plus.tsx';

import nanoid from '../utils/nanoid.ts';

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
    accept: string[];
    default?: string;
    onChange?: (value: IImageInput) => void;
  },
) => {
  const ref = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  const name = nanoid();

  return (
    <div class={'image-input'}>
      {!props.default
        ? (
          <i ref={placeholderRef}>
            <IconImage />
          </i>
        )
        : undefined}
      <img ref={ref} src={props.default ?? ''} />
      <label for={name} />
      <input
        type={'file'}
        id={name}
        name={name}
        accept={props.accept.join(',')}
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
