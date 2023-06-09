import { useRef } from 'preact/hooks';

import type { JSX } from 'preact';

export default (
  { label, multiline, value, onInput, ...props }: {
    label?: string;
    multiline?: boolean;
    onInput?: (value: string) => void;
  } & JSX.HTMLAttributes<HTMLInputElement>,
) => {
  const ref = useRef<HTMLImageElement>(null);

  return (
    <div class={'text-input'}>
      {label ? <label>{label}</label> : undefined}
      {multiline
        ? (
          <textarea
            {...props as JSX.HTMLAttributes<HTMLTextAreaElement>}
            type={'text'}
            value={value}
            onInput={(ev) => {
              onInput?.((ev.target as HTMLInputElement).value);
            }}
          />
        )
        : (
          <input
            {...props}
            type={'text'}
            value={value}
            onInput={(ev) => {
              onInput?.((ev.target as HTMLInputElement).value);
            }}
          />
        )}
    </div>
  );
};
