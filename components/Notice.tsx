import { useRef } from 'preact/hooks';

import IconInfo from 'icons/info-circle.tsx';
import IconClose from 'icons/circle-x.tsx';

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
  props: JSX.HTMLAttributes<HTMLDivElement>,
) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      {...props}
      ref={ref}
      class={'text-white bg-red fixed flex justify-center items-center z-[99] select-text bottom-0 left-0 m-3 p-3 max-w-[50vw] min-w-[20vw] rounded-[5px] gap-2'}
      data-type={'error'}
    >
      <IconInfo class={`min-w-[18px] min-h-[18px] text-white`} />

      <div class={'mr-auto'}>
        {props.children}
      </div>

      <div
        class={'cursor-pointer'}
        onClick={(e) => ref.current?.remove()}
      >
        <IconClose
          class={`min-w-[18px] min-h-[18px] text-white`}
        />
      </div>
    </div>
  );
};

export default Notice;
