import type { Schema } from './Dashboard.tsx';

export default ({ pack }: { pack: Schema.Pack }) => {
  return (
    <a class={'dashboard-card'} href={pack.manifest.id}>
      {pack.manifest.image ? <img src={pack.manifest.image} /> : undefined}
      <div>
        {pack.manifest.title ?? pack.manifest.id}
      </div>
    </a>
  );
};
