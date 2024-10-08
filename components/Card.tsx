import type { Pack } from '~/utils/types.ts';

const defaultImage =
  'https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg';

export default ({ pack }: { pack: Pack }) => {
  return (
    <a
      class={'bg-embed w-[128px] min-h-[32px] rounded-xl px-[16px] py-[24px] hover:translate-y-[-8px] transition-all duration-150'}
      href={`/${pack.manifest.id}/edit`}
    >
      <img
        class={'bg-grey w-[128px] h-auto aspect-square rounded-xl object-cover'}
        src={pack.manifest.image ?? defaultImage}
      />
      <div class={'truncate mt-0.5'}>
        {pack.manifest.title ?? pack.manifest.id}
      </div>
    </a>
  );
};
