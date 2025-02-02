import { useEffect } from 'preact/hooks';

import { type Signal, useSignal } from '@preact/signals';

import TextInput from '~/components/TextInput.tsx';

import IconLeft from 'icons/arrow-left.tsx';

import { i18n } from '~/utils/i18n.ts';

import { useDebounce } from '~/utils/useDebounce.tsx';

import type { Data, Image } from '~/routes/api/zerochan.ts';

export const ZeroChanModal = (
  { character, media, visible, callback }: {
    media?: string;
    character?: string;
    visible: Signal<boolean>;
    callback: (imageUrl: string) => void;
  },
) => {
  const error = useSignal('');
  const images = useSignal<Image[]>([]);

  const [debouncedQuery, query, setQuery] = useDebounce('', 300);

  useEffect(
    () =>
      setQuery([
        media?.replaceAll(':', ''),
        character?.replaceAll(':', ''),
        character?.replaceAll(':', '') + ` (${media?.replaceAll(':', '')})`,
      ].join(',')),
    [media, character],
  );

  useEffect(() => {
    if (!debouncedQuery) return;

    error.value = '', images.value = [];

    fetch('/api/zerochan', {
      method: 'POST',
      body: JSON.stringify({ query: debouncedQuery } satisfies Data),
    })
      .then((res) => {
        if (res.status !== 200) {
          error.value = res.statusText;
          return;
        }

        return res.json();
      })
      .then((data: Image[]) => {
        images.value = data ?? [];
      });
  }, [debouncedQuery]);

  return (
    <>
      <div
        class={'w-full cursor-pointer'}
        onClick={() => visible.value = false}
      >
        <IconLeft class={'w-[24px] h-[24px]'} />
      </div>

      <TextInput
        placeholder={i18n('search')}
        onInput={(value) => setQuery(value)}
        value={query}
      />

      <div class={'flex flex-wrap grow justify-center gap-4'}>
        {error.value ? <span>{error}</span> : undefined}

        {!error.value && images.value.length <= 0
          ? <span>{i18n('loading')}</span>
          : undefined}

        {images.value.map((image) => (
          <img
            key={image.id}
            class={'w-auto h-[192px] object-cover object-center aspect-[90/127] cursor-pointer hover:scale-95 hover:border-[3px] border-white border-solid'}
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
