import { useRef } from 'preact/hooks';

import type { JSX } from 'preact';

export default (
  props: {
    label?: string;
    value?: string;
    multiline?: boolean;
    placeholder?: string;
    onInput?: (value: string) => void;
  } & JSX.HTMLAttributes<HTMLInputElement>,
) => {
  const ref = useRef<HTMLImageElement>(null);

  return (
    <div class={'text-input'}>
      {props.label ? <label>{props.label}</label> : undefined}
      {props.multiline
        ? (
          <textarea
            type={'text'}
            value={props.value}
            placeholder={props.placeholder}
            onInput={(ev) => {
              props.onInput?.((ev.target as HTMLInputElement).value);
            }}
          />
        )
        : (
          <input
            {...props}
            type={'text'}
            value={props.value}
            placeholder={props.placeholder}
            onInput={(ev) => {
              props.onInput?.((ev.target as HTMLInputElement).value);
            }}
          />
        )}
    </div>
  );
};
