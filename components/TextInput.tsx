import { forwardRef } from "react";

import type { HTMLAttributes, InputHTMLAttributes, Ref } from "react";

import type { Modify } from "~/utils/types.ts";

const TextInput = forwardRef(
  (
    {
      label,
      placeholder,
      hint,
      multiline,
      value,
      onInput,
      children,
      ...props
    }: Modify<
      InputHTMLAttributes<HTMLInputElement>,
      {
        label?: string;
        placeholder?: string;
        hint?: string;
        multiline?: boolean;
        children?: React.ReactNode;
        onInput?: (value: string) => void;
      }
    >,
    ref
  ) => {
    return (
      <div className={"flex flex-col grow gap-2"}>
        {label || hint ? (
          <div className={"flex flex-col text-disabled"}>
            {label ? (
              <label className={"uppercase text-[0.8rem]"}>{label}</label>
            ) : undefined}
            {hint ? (
              <label className={"text-[0.75rem]"}>{hint}</label>
            ) : undefined}
          </div>
        ) : undefined}

        <div className={`grow relative flex text-[1em] ${props.className}`}>
          {multiline ? (
            <textarea
              {...(props as HTMLAttributes<HTMLTextAreaElement>)}
              ref={ref as Ref<HTMLTextAreaElement>}
              placeholder={placeholder}
              value={value}
              className={`grow text-[1em] resize-y ${props.className}`}
              onInput={(ev) => {
                onInput?.((ev.target as HTMLInputElement).value);
              }}
            />
          ) : (
            <input
              type={"text"}
              {...props}
              ref={ref as Ref<HTMLInputElement>}
              placeholder={placeholder}
              value={value}
              className={`grow text-[1em] ${props.className}`}
              onInput={(ev) => {
                onInput?.((ev.target as HTMLInputElement).value);
              }}
            />
          )}
          {children}
        </div>
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;
