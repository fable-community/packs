import type { JSX } from 'preact';

import type { Modify } from '~/utils/types.ts';

export default <T,>(
  { list, label, defaultValue, nullLabel, required, onChange, ...props }:
    Modify<
      JSX.HTMLAttributes<HTMLSelectElement>,
      {
        label?: string;
        hint?: string;
        list: Record<string, string>;
        required?: boolean;
        defaultValue?: string;
        nullLabel?: string;
        onChange?: (value: T) => void;
      }
    >,
) => {
  return (
    <div class={`flex flex-col gap-2 ${props.class}`}>
      {label
        ? (
          <label class={'uppercase text-disabled text-[0.8rem]'}>
            {label}
          </label>
        )
        : undefined}
      <div class={`relative w-full select-triangle`}>
        <select
          {...props}
          class={`w-full text-[1em] ${props.class}`}
          onChange={(ev) => {
            const t = (ev.target as HTMLSelectElement).value as T;

            onChange?.(t);
          }}
        >
          {!required
            ? (
              <option selected={!defaultValue} value={''}>
                {nullLabel ?? ''}
              </option>
            )
            : undefined}

          {Object.entries(list)
            .map(([k, v]) => (
              <option key={k} value={v} selected={defaultValue === v}>
                {k}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};
