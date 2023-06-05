import { useRef } from 'preact/hooks';

import IconImage from 'icons/photo-plus.tsx';

export default (
  props: {
    name: string;
    accept: string[];
    default?: string;
    onChange?: (value: Blob) => void;
  },
) => {
  const ref = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

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
      <label for={props.name} />
      <input
        type={'file'}
        id={props.name}
        name={props.name}
        accept={props.accept.join(',')}
        onChange={(ev) => {
          // deno-lint-ignore ban-ts-comment
          // @ts-ignore
          const blob: Blob = ev.target.files[0];

          const urlObj = URL.createObjectURL(blob);

          // deno-lint-ignore no-non-null-assertion
          ref.current!.src = urlObj;
          // deno-lint-ignore no-non-null-assertion
          ref.current!.onload = () => {
            URL.revokeObjectURL(urlObj);
            placeholderRef.current?.remove();
          };

          props.onChange?.(blob);
        }}
      />
    </div>
  );
};
