import { useRef } from 'preact/hooks';

import IconInfo from 'icons/info-circle.tsx';

import type { JSX } from 'preact';

const Notice = (
  { type, ...props }:
    & { type: 'warn' | 'error' | 'info' }
    & JSX.HTMLAttributes<HTMLDivElement>,
) => {
  return (
    <div
      class={'text-white flex justify-center items-center my-1 p-1 gap-2'}
      data-type={type}
      {...props}
    >
      <IconInfo class={`min-w-[18px] min-h-[18px] text-${type}`} />
      <div class={'mr-auto'}>
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
      class={'text-white embed z-[99] bottom-0 right-0 margin-1 max-w-[50vw] min-w-[20vw] fixed curser-pointer flex justify-center items-center rounded-[5px] my-1 p-1 gap-2'}
      data-type={type}
      onClick={(e) => ref.current?.remove()}
    >
      <IconInfo class={`min-w-[18px] min-h-[18px] text-${type}`} />
      <div class={'mr-auto'}>
        {props.children}
      </div>
    </div>
  );
};

export default Notice;
