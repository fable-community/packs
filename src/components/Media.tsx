import '#filter-boolean';

import { useState } from 'preact/hooks';

import Dialog from './Dialog.tsx';

import IconPlus from 'icons/plus.tsx';

import type { Schema } from './Dashboard.tsx';

export default (
  { show, pack }: {
    show: 'media' | 'characters';
    pack: Partial<Schema.Pack['manifest']>;
  },
) => {
  const name = show;

  const [target, setTarget] = useState<string | undefined>(undefined);

  return (
    <div class={'media'}>
      {pack[name]?.new?.map(({ id, images }) => (
        <img
          data-dialog={name}
          src={images?.[0].url}
          onClick={() => setTarget(id)}
        />
      ))}
      {
        <div data-dialog={name} disabled>
          <IconPlus />
        </div>
      }

      <Dialog name={name} class={'box-dialog'}>
        <div>
        </div>
      </Dialog>
    </div>
  );
};
