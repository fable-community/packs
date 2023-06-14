import IconMarkdown from 'icons/markdown.tsx';

import type { JSX } from 'preact';

import type { Modify } from '../utils/types.ts';

export default (
  { label, hint, multiline, markdown, value, onInput, ...props }: Modify<
    JSX.HTMLAttributes<HTMLInputElement>,
    {
      label?: string;
      hint?: string;
      multiline?: boolean;
      markdown?: boolean;
      onInput?: (value: string) => void;
    }
  >,
) => {
  return (
    <div class={'text-input'}>
      <div class={'label'}>
        {label ? <label>{label}</label> : undefined}
        {markdown ? <IconMarkdown /> : undefined}
      </div>
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
