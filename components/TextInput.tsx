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
    <div class={'flex flex-col gap-2'}>
      <div class={'flex flex-col italic text-disabled'}>
        {label
          ? <label class={'uppercase text-[0.8rem]'}>{label}</label>
          : undefined}
        {hint ? <label class={'text-[0.75rem]'}>{hint}</label> : undefined}
      </div>

      {multiline
        ? (
          <textarea
            {...props as JSX.HTMLAttributes<HTMLTextAreaElement>}
            type={'text'}
            value={value}
            class={'text-[1em] resize-y'}
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
            class={'text-[1em]'}
            onInput={(ev) => {
              onInput?.((ev.target as HTMLInputElement).value);
            }}
          />
        )}
    </div>
  );
};
