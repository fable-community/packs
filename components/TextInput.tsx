import { forwardRef } from 'preact/compat';

import type { JSX, Ref } from 'preact';

import type { Modify } from '~/utils/types.ts';

export default forwardRef(
  ({ label, placeholder, hint, multiline, value, onInput, ...props }: Modify<
    JSX.HTMLAttributes<HTMLInputElement>,
    {
      label?: string;
      placeholder?: string;
      hint?: string;
      multiline?: boolean;
      onInput?: (value: string) => void;
    }
  >, ref) => {
    return (
      <div class={'flex flex-col grow gap-2'}>
        {label || hint
          ? (
            <div class={'flex flex-col text-disabled'}>
              {label
                ? <label class={'uppercase text-[0.8rem]'}>{label}</label>
                : undefined}
              {hint
                ? <label class={'text-[0.75rem]'}>{hint}</label>
                : undefined}
            </div>
          )
          : undefined}

        <div class={`grow relative flex text-[1em] ${props.class}`}>
          {multiline
            ? (
              <textarea
                {...props as JSX.HTMLAttributes<HTMLTextAreaElement>}
                ref={ref as Ref<HTMLTextAreaElement>}
                placeholder={placeholder}
                type={'text'}
                value={value}
                class={`grow text-[1em] resize-y ${props.class}`}
                onInput={(ev) => {
                  onInput?.((ev.target as HTMLInputElement).value);
                }}
              />
            )
            : (
              <input
                type={'text'}
                {...props}
                ref={ref as Ref<HTMLInputElement>}
                placeholder={placeholder}
                value={value}
                class={`grow text-[1em] ${props.class}`}
                onInput={(ev) => {
                  onInput?.((ev.target as HTMLInputElement).value);
                }}
              />
            )}
          {props.children}
        </div>
      </div>
    );
  },
);
