import compact from '~/utils/compact.ts';
import { Approved } from '~/islands/Approved.tsx';

import IconDownload from 'icons/download.tsx';
import IconCharacter from 'icons/user.tsx';
import IconCalendarEvent from 'icons/calendar-event.tsx';

import type { PackWithCount } from '~/utils/types.ts';

import { i18n } from '~/utils/i18n.ts';

const defaultImage =
  'https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg';

const PackDate = ({ updatedAt }: { updatedAt: Date }) => {
  const daysAgo = Math.ceil(
    (new Date(updatedAt).getTime() -
      Date.now()) /
      (1000 * 60 * 60 * 24),
  );

  if (daysAgo === 0) {
    return <p>{i18n('justNow')}</p>;
  } else if (daysAgo < -30) {
    return (
      <p>
        +
        {new Intl.RelativeTimeFormat().format(-30, 'day')}
      </p>
    );
  } else {
    return (
      <p>
        {new Intl.RelativeTimeFormat().format(daysAgo, 'day')}
      </p>
    );
  }
};

export default (
  { pack, index }: { pack: PackWithCount; index: number },
) => {
  return (
    <a
      href={`/${pack.manifest.id}`}
      class={'grid grid-cols-[auto_auto_1fr] w-full gap-8 p-8 hover:bg-embed2 rounded-lg cursor-pointer'}
    >
      <i class={'text-[4rem] w-[4rem] font-bold'}>{index + 1}</i>

      <img
        src={pack.manifest.image ?? defaultImage}
        class={'bg-grey w-[92px] min-w-[92px] h-[92px] object-cover object-center rounded-[14px]'}
      />

      <div class={'flex flex-col gap-1 justify-center'}>
        <i class={'flex flex-row items-center font-bold text-[0.95rem]'}>
          {pack.manifest.title ?? pack.manifest.id}
          {pack.manifest.approved ? <Approved /> : undefined}
        </i>

        {pack.manifest.description
          ? (
            <p
              class={'text-[0.85rem] opacity-80 line-clamp-2 overflow-hidden overflow-ellipsis'}
            >
              {pack.manifest.description}
            </p>
          )
          : undefined}

        <div class={'flex gap-3 text-white opacity-80 mt-3 uppercase'}>
          {pack.servers
            ? (
              <div class={'flex gap-1'}>
                <IconDownload class={'w-4 h-4 mt-0.5'} />
                <p>{i18n('packServers', compact(pack.servers))}</p>
              </div>
            )
            : (
              <div class={'flex gap-1'}>
                <IconCalendarEvent class={'w-4 h-4 mt-0.5'} />
                {PackDate({ updatedAt: pack.manifest.updatedAt })}
              </div>
            )}

          <p>
            {
              // deno-lint-ignore prefer-ascii
              `•`
            }
          </p>

          <div class={'flex gap-1'}>
            <IconCharacter class={'w-4 h-4 mt-0.5'} />
            <p>
              {`${pack.manifest.characters ?? 0} ${i18n('characters')}`}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
};
