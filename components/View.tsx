import IconDownload from 'icons/download.tsx';
import IconClipboard from 'icons/clipboard-text.tsx';

import { i18n } from '~/utils/i18n.ts';

import type { Alias, Pack } from '~/utils/types.ts';

const defaultImage =
  'https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg';

const getAlias = (alias: Alias) =>
  alias.english ?? alias.romaji ?? alias.native;

export default ({ pack }: { pack: Pack }) => {
  return (
    <div class='flex flex-col'>
      <Header pack={pack} />

      <div class={'flex flex-col gap-8 mx-4 my-8'}>
        <p class={'uppercase font-bold text-base opacity-60'}>
          {`${i18n('media')} (${pack.manifest.media?.new?.length ?? 0})`}
        </p>
        <Collection collection={pack.manifest.media} />
      </div>

      <div class={'flex flex-col gap-8 mx-4 my-8'}>
        <p class={'uppercase font-bold text-base opacity-60'}>
          {`${i18n('characters')} (${
            pack.manifest.characters?.new?.length ?? 0
          })`}
        </p>
        <Collection collection={pack.manifest.characters} />
      </div>
    </div>
  );
};

const Header = ({ pack }: { pack: Pack }) => {
  return (
    <div class={'flex flex-row gap-8'}>
      <img
        src={pack.manifest.image ?? defaultImage}
        class={'bg-grey w-[128px] min-w-[128px] h-[128px] object-cover object-center rounded-[14px]'}
      />

      <div class={'flex flex-col grow gap-4 justify-center'}>
        <div class={'flex gap-3 text-white opacity-80 uppercase'}>
          <IconDownload class={'w-4 h-4'} />
          {i18n('packServers', pack.servers ?? 0)}
        </div>

        <i class={'font-bold text-[0.95rem] select-text'}>
          {pack.manifest.title ?? pack.manifest.id}
        </i>

        {pack.manifest.description
          ? (
            <p
              class={'text-[0.85rem] select-text opacity-80 line-clamp-4 overflow-hidden overflow-ellipsis'}
            >
              {pack.manifest.description}
            </p>
          )
          : undefined}

        <div
          class={'bg-highlight flex items-center p-4 rounded-xl'}
          data-clipboard={`/packs install id: ${pack.manifest.id}`}
        >
          <i class={'italic grow select-all'}>
            {`/packs install id: ${pack.manifest.id}`}
          </i>
          <IconClipboard class={'w-[18px] h-[18px] cursor-pointer'} />
        </div>

        {pack.manifest.author
          ? <>{i18n('by-author', pack.manifest.author)}</>
          : undefined}
      </div>
    </div>
  );
};

const Collection = (
  { collection }: {
    collection: Pack['manifest']['characters'] | Pack['manifest']['media'];
  },
) => {
  if (!collection?.new?.length) {
    return (
      <p class={'uppercase font-bold text-base opacity-60 text-center'}>
        {i18n('empty')}
      </p>
    );
  }

  const slice = collection.new.slice(0, 8);
  const diff = collection.new.length - slice.length;

  return (
    <div class={'flex flex-wrap gap-4'}>
      {slice.map((item) => (
        <img
          title={getAlias('name' in item ? item.name : item.title)}
          src={item.images?.[0]?.url ?? defaultImage}
          class={'w-auto h-[192px] object-cover object-center aspect-[90/127] bg-grey'}
        />
      ))}

      {diff > 0
        ? (
          <div
            class={'flex justify-center items-center w-auto h-[192px] object-cover object-center aspect-[90/127] border-grey border-2'}
          >
            <p class={'uppercase font-bold text-4xl text-grey'}>
              {`+${diff}`}
            </p>
          </div>
        )
        : undefined}
    </div>
  );
};
