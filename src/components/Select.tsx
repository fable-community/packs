import type { JSX } from 'preact';

import type { Modify } from '../utils/types.ts';

export default <T,>(
  { list, label, defaultValue, required, onChange, ...props }: Modify<
    JSX.HTMLAttributes<HTMLSelectElement>,
    {
      label?: string;
      hint?: string;
      list: Record<string, string>;
      required?: boolean;
      defaultValue?: string;
      onChange?: (value: T) => void;
    }
  >,
) => {
  return (
    <div class={'select'}>
      {label ? <label class={'label'}>{label}</label> : undefined}
      <select
        {...props}
        onChange={(ev) => {
          onChange?.((ev.target as HTMLSelectElement).value as T);
        }}
      >
        {!required
          ? <option selected={!defaultValue} value={undefined}>{''}</option>
          : undefined}

        {Object.entries(list)
          .map(([k, v]) => (
            <option key={k} value={v} selected={defaultValue === v}>{k}</option>
          ))}
      </select>
      {/* {hint ? <label class={'hint'}>{hint}</label> : undefined} */}
    </div>
  );
};
