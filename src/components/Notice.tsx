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

export const Dismissible = (props: Parameters<typeof Notice>['0']) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Notice
      {...props}
      ref={ref}
      class={'notice notice-fixed'}
      onClick={(e) => ref.current?.remove()}
    />
  );
};

export default Notice;
