import { useRef } from 'preact/hooks';

import IconImage from 'icons/photo-plus.tsx';

export default (
  props: { name: string; accept: string[]; default?: string },
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
          const blob = URL.createObjectURL(ev.target.files[0]);

          // deno-lint-ignore no-non-null-assertion
          ref.current!.src = blob;
          // deno-lint-ignore no-non-null-assertion
          ref.current!.onload = () => {
            URL.revokeObjectURL(blob);
            placeholderRef.current?.remove();
          };
        }}
      />
    </div>
  );
};
