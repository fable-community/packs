import IconClose from 'icons/x.tsx';

import { Signal } from '@preact/signals';

import type { Image } from '../routes/api/zerochan.ts';

export const ZeroChanModal = (
  { visible, images, callback }: {
    visible: Signal<boolean>;
    images: Signal<Image[]>;
    callback: (imageUrl: string) => void;
  },
) => {
  return (
    <>
      <div
        class={'basis-full cursor-pointer'}
        onClick={() => visible.value = false}
      >
        <IconClose class={'ml-auto w-[24px] h-[24px]'} />
      </div>

      <div class={'flex flex-wrap justify-center gap-4'}>
        {images.value.map((image) => (
          <img
            key={image.id}
            class={'w-auto h-[192px] object-cover object-center aspect-[90/127] cursor-pointer'}
            src={image.thumbnail}
            onClick={() => {
              callback(image.thumbnail);
              visible.value = false;
            }}
          />
        ))}
      </div>
    </>
  );
};
