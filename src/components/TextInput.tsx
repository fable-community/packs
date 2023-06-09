import type { JSX } from 'preact';

import type { Modify } from '../utils/types.ts';

export default (
  { label, hint, multiline, value, onInput, ...props }: Modify<
    JSX.HTMLAttributes<HTMLInputElement>,
    {
      label?: string;
      hint?: string;
      multiline?: boolean;
      onInput?: (value: string) => void;
    }
  >,
) => {
  return (
    <div class={'text-input'}>
      {label ? <label class={'label'}>{label}</label> : undefined}
      {hint ? <label class={'hint'}>{hint}</label> : undefined}

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
            type={'text'}
            {...props}
            value={value}
            onInput={(ev) => {
              onInput?.((ev.target as HTMLInputElement).value);
            }}
          />
        )}
    </div>
  );
};
