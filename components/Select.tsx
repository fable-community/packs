import { HTMLAttributes } from "react";

import type { Modify } from "~/utils/types.ts";

const Select = <T,>({
  list,
  label,
  defaultValue,
  nullLabel,
  required,
  onChange,
  ...props
}: Modify<
  HTMLAttributes<HTMLSelectElement>,
  {
    label?: string;
    hint?: string;
    list: Record<string, string>;
    required?: boolean;
    defaultValue?: string;
    nullLabel?: string;
    onChange?: (value: T) => void;
  }
>) => {
  return (
    <div className={`flex flex-col gap-2 ${props.className}`}>
      {label ? (
        <label className={"uppercase text-disabled text-[0.8rem]"}>
          {label}
        </label>
      ) : undefined}
      <div className={`relative w-full select-triangle`}>
        <select
          {...props}
          className={`w-full text-[1em] ${props.className}`}
          onChange={(ev) => {
            const t = (ev.target as HTMLSelectElement).value as T;

            onChange?.(t);
          }}
        >
          {!required ? (
            <option selected={!defaultValue} value={""}>
              {nullLabel ?? ""}
            </option>
          ) : undefined}

          {Object.entries(list).map(([k, v]) => (
            <option key={k} value={v} selected={defaultValue === v}>
              {k}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Select;
