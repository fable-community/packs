import { i18n, type I18nKey } from '~/utils/i18n.ts';

export default ({ active }: { active: 'browse' | 'create' }) => {
  return (
    <div
      class={'grow flex gap-3 uppercase text-[1.05rem] text-white font-bold'}
    >
      {[['browse', 'browse'], ['create', '/dashboard']].map(([key, href]) => (
        <a
          href={href}
          class={active === key
            ? 'cursor-pointer'
            : 'cursor-pointer opacity-40 hover:opacity-100'}
        >
          {i18n(key as I18nKey)}
        </a>
      ))}
    </div>
  );
};
