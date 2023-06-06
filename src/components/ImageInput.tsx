import { useRef } from 'preact/hooks';

import IconImage from 'icons/photo-plus.tsx';

import nanoid from '../utils/nanoid.ts';

export default (
  props: {
    accept: string[];
    default?: string;
    onChange?: (url: string) => void;
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
          const blob: Blob = (ev.target as HTMLInputElement).files![0];

          const url = URL.createObjectURL(blob);

          // deno-lint-ignore no-non-null-assertion
          ref.current!.src = url;

          // deno-lint-ignore no-non-null-assertion
          ref.current!.onload = () => {
            // URL.revokeObjectURL(url);
            placeholderRef.current?.remove();
          };

          props.onChange?.(url);
        }}
      />
    </div>
  );
};
