import { useSignal } from '@preact/signals';

import { useRef } from 'preact/hooks';

import { serialize } from 'bson';

import TextInput from '~/components/TextInput.tsx';

import ImageInput, { type IImageInput } from '~/components/ImageInput.tsx';

import { Dismissible } from '~/components/Notice.tsx';

import IconHome from 'icons/arrow-left.tsx';
import IconLocked from 'icons/lock.tsx';
import IconOpened from 'icons/lock-open.tsx';
import IconCheckmark from 'icons/check.tsx';

const idRegex = /[^-_a-z0-9]+/g;

import {
  sortCharacters as _sortCharacters,
  sortMedia as _sortMedia,
} from '~/utils/sorting.ts';

import { i18n } from '~/utils/i18n.ts';

import type { Data } from '~/routes/api/publish.ts';

import { type User } from '~/utils/types.ts';

export default (props: {
  user: User;
}) => {
  const loading = useSignal(false);
  const error = useSignal<string | undefined>(undefined);

  const packId = useSignal<string | undefined>('');
  const packIdManual = useSignal<boolean>(false);

  const title = useSignal<string | undefined>('');
  const privacy = useSignal<boolean | undefined>(false);
  const nsfw = useSignal<boolean | undefined>(false);
  const author = useSignal<string | undefined>('');
  const description = useSignal<string | undefined>('');
  const image = useSignal<IImageInput | undefined>(undefined);

  const packTitleInputRef = useRef<HTMLInputElement>(null);
  const packIdInputRef = useRef<HTMLInputElement>(null);

  const getData = (): Data => ({
    // deno-lint-ignore no-non-null-assertion
    old: { id: packId.value! },
    title: title.value,
    private: privacy.value,
    nsfw: nsfw.value,
    author: author.value,
    description: description.value,
    image: image.value,
  });

  const onLockUnlockId = () => {
    packIdManual.value = !packIdManual.value;

    if (!packIdManual.value) {
      packId.value = autoId(title.value);
    } else {
      packId.value = '';
      packIdInputRef.current?.focus();
    }
  };

  const onPublish = async () => {
    const body = {
      ...getData(),
      new: true,
      username: props.user.display_name ??
        props.user.username ?? 'undefined',
    };

    loading.value = true;

    try {
      const response = await fetch(`/api/publish`, {
        method: 'POST',
        body: serialize(body),
      });

      if (response.status === 200) {
        // deno-lint-ignore no-non-null-assertion
        location.replace(`${encodeURIComponent(packId.value!)}/edit?new`);
      } else {
        const text = await response.text();

        if (!text.startsWith('{')) {
          console.error(error.value = text);
        } else {
          // error.value = 'Failed! Try Again!';
          const { errors, pack } = await response.json() as {
            pack: {
              media?: { id: string }[];
              characters?: { id: string }[];
            };
            errors: {
              instancePath: string;
              keyword: string;
              message: string;
              params: { limit?: number };
              schemaPath: string;
            }[];
          };

          document.querySelectorAll(`[invalid]`).forEach((ele) =>
            ele.removeAttribute(`invalid`)
          );

          document.querySelectorAll(`[shake]`).forEach((ele) =>
            ele.removeAttribute(`shake`)
          );

          console.error(errors);

          errors.forEach((err) => {
            const path = err.instancePath
              .substring(1)
              .split('/');

            console.error(path);

            setTimeout(() => {
              if (path[0] === 'id' && packIdManual.value) {
                packIdInputRef.current?.setAttribute('shake', 'true');
                packIdInputRef.current?.setAttribute('invalid', 'true');
              } else if (path[0] === 'id') {
                packTitleInputRef.current?.setAttribute('shake', 'true');
                packTitleInputRef.current?.setAttribute('invalid', 'true');
              }
            }, 100);
          });
        }
      }
    } catch (err) {
      console.error(error.value = err?.message);
    } finally {
      loading.value = false;
    }
  };

  return (
    <>
      {error.value
        ? (
          <Dismissible type={'error'}>
            {error.value}
          </Dismissible>
        )
        : undefined}

      <div
        class={'flex fixed top-0 left-0 w-full h-full bg-embed overflow-x-hidden overflow-y-auto'}
      >
        {/* this component require client-side javascript enabled */}
        <noscript>{i18n('noScript')}</noscript>

        <div class={'m-4 w-full'}>
          <div class={'flex items-center gap-4 w-full'}>
            <a href={'/dashboard'}>
              <IconHome class={'w-[28px] h-[28px] cursor-pointer'} />
            </a>

            <div class={'grow'}></div>

            <button
              onClick={onPublish}
              class={loading.value
                ? 'py-3 disabled pointer-events-none'
                : 'py-3 bg-discord'}
            >
              {loading.value
                ? (
                  <LoadingSpinner class='inline w-5 h-5 animate-spin text-grey fill-white' />
                )
                : i18n('next')}
            </button>
          </div>

          <div class={'flex gap-4 mt-8'}>
            <ImageInput
              name={'pack-image'}
              class={'w-[128px] h-[128px] aspect-square'}
              accept={['image/png', 'image/jpeg', 'image/webp']}
              onChange={(value) => image.value = value}
            />

            <div class={'flex flex-col grow gap-4'}>
              <TextInput
                ref={packTitleInputRef}
                value={title}
                class={'border-2 border-grey rounded-xl bg-embed2'}
                label={i18n('packTitle')}
                pattern='.{3,128}'
                placeholder={i18n('placeholderPackTitle')}
                onInput={(value) => {
                  title.value = value;
                  if (!packIdManual.value) packId.value = autoId(value);
                }}
              />

              <div
                class={[
                  'flex items-center border-2 border-grey py-2 px-6 gap-2 rounded-lg',
                  packIdManual.value ? 'bg-embed2' : '',
                ].join(' ')}
              >
                <p class={'text-white text-[0.95rem]'}>
                  {'/packs install id: '}
                </p>
                <input
                  type={'text'}
                  value={packId}
                  ref={packIdInputRef}
                  pattern='[\-a-z0-9]{1,20}'
                  placeholder={i18n('placeholderPackId')}
                  class={packIdManual.value
                    ? 'h-[48px] text-white grow font-medium bg-embed2'
                    : 'h-[48px] text-white grow font-medium disabled pointer-events-none !border-0'}
                  onInput={(
                    ev,
                  ) => (packId.value = (ev.target as HTMLInputElement).value)}
                />
                <div
                  class={'p-2 cursor-pointer hover:bg-highlight rounded-xl'}
                  onClick={onLockUnlockId}
                >
                  {packIdManual.value ? <IconOpened /> : <IconLocked />}
                </div>
              </div>
            </div>
          </div>

          <div class={'flex flex-col gap-4 my-4'}>
            <label class={'uppercase text-[0.8rem] text-disabled'}>
              {i18n('packAuthor')}
            </label>

            <TextInput
              value={author}
              class={'border-2 border-grey rounded-xl bg-embed2'}
              placeholder={i18n('placeholderPackAuthor')}
              onInput={(value) => author.value = value}
            />

            <label class={'uppercase text-[0.8rem] text-disabled'}>
              {i18n('packDescription')}
            </label>

            <TextInput
              multiline
              value={description}
              class={'border-2 border-grey rounded-xl bg-embed2'}
              placeholder={i18n('placeholderPackDescription')}
              onInput={(value) => description.value = value}
            />

            <label class={'uppercase text-[0.8rem] text-disabled'}>
              {i18n('packVisibility')}
            </label>

            <div
              class={'flex flex-col rounded-xl overflow-hidden'}
            >
              <button
                onClick={() => privacy.value = !privacy.value}
                class={'justify-start text-left flex gap-4 bg-embed hover:shadow-none px-1 py-0'}
              >
                <div class={'p-2 border-2 border-grey rounded-lg'}>
                  <IconCheckmark
                    class={privacy.value ? 'w-5 h-5 opacity-0' : 'w-5 h-5'}
                  />
                </div>

                <span>{i18n('publicPackNotice')}</span>
              </button>
            </div>

            <label class={'uppercase text-[0.8rem] text-disabled'}>
              {i18n('packNSFW')}
            </label>

            <div
              class={'flex flex-col rounded-xl overflow-hidden'}
            >
              <button
                onClick={() => nsfw.value = !nsfw.value}
                class={'justify-start text-left flex gap-4 bg-embed hover:shadow-none px-1 py-0'}
              >
                <div class={'p-2 border-2 border-grey rounded-lg'}>
                  <IconCheckmark
                    class={!nsfw.value ? 'w-5 h-5 opacity-0' : 'w-5 h-5'}
                  />
                </div>
                <span>{i18n('packNSFWHint')}</span>
              </button>
            </div>

            <div class={'mb-[20vh]'}></div>
          </div>
        </div>
      </div>
    </>
  );
};

const autoId = (s?: string): string | undefined =>
  s?.toLowerCase()
    .replace(/\s+/, '-')
    .replace(idRegex, '');

const LoadingSpinner = (props: { class: string }) => {
  return (
    <svg
      class={props.class}
      viewBox='0 0 100 101'
    >
      <path
        d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
        fill='currentColor'
      />
      <path
        d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
        fill='currentFill'
      />
    </svg>
  );
};
