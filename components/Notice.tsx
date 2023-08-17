import { useRef } from 'preact/hooks';

import IconInfo from 'icons/info-circle.tsx';

import type { JSX } from 'preact';

const Notice = (
  { type, ...props }:
    & { type: 'warn' | 'error' | 'info' }
    & JSX.HTMLAttributes<HTMLDivElement>,
) => {
  return (
    <div class={'notice'} data-type={type} {...props}>
      <IconInfo />
      <div>
        {props.children}
      </div>
    </div>
  );
};

export const Dismissible = (
  { type, ...props }: Parameters<typeof Notice>['0'],
) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      {...props}
      ref={ref}
      class={'notice notice-dismissible'}
      data-type={type}
      onClick={(e) => ref.current?.remove()}
    >
      <IconInfo />
      <div>
        {props.children}
      </div>
    </div>
  );
};

export default Notice;
