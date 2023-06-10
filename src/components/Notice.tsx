import { useRef } from 'preact/hooks';

import IconInfo from 'icons/info-circle.tsx';

export default (
  { text, type }: { text: string; type: 'warn' | 'error' | 'info' },
) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      class={'notice'}
      data-type={type}
      onClick={(e) => ref.current?.remove()}
    >
      <IconInfo />
      {text}
    </div>
  );
};
