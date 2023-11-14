import type { Pack } from '../utils/types.ts';

export default ({ pack }: { pack: Pack }) => {
  return (
    <a
      class={'embed w-[128px] min-h-[32px] rounded-xl px-[16px] py-[24px] hover:translate-y-[-8px] transition-all duration-150'}
      href={pack.manifest.id}
    >
      {pack.manifest.image
        ? (
          <img
            class={'grey w-[128px] h-auto aspect-square rounded-xl object-cover'}
            src={pack.manifest.image}
          />
        )
        : undefined}
      <div class={'truncate'}>
        {pack.manifest.title ?? pack.manifest.id}
      </div>
    </a>
  );
};
