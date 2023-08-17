import type { Pack } from '../utils/types.ts';

export default ({ pack }: { pack: Pack }) => {
  return (
    <a class={'dashboard-card'} href={pack.manifest.id}>
      {pack.manifest.image ? <img src={pack.manifest.image} /> : undefined}
      <div>
        {pack.manifest.title ?? pack.manifest.id}
      </div>
    </a>
  );
};
