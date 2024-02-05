export default ({ active }: { active: 'browse' | 'create' }) => {
  return (
    <div
      class={'w-full flex gap-3 uppercase text-[1.05rem] text-white cursor-pointer font-bold'}
    >
      <a
        href={'/browse'}
        class={active === 'browse' ? '' : 'opacity-40 hover:opacity-100'}
      >
        Popular
      </a>
      <a
        href={'/dashboard'}
        class={active === 'create' ? '' : 'opacity-40 hover:opacity-100'}
      >
        Create
      </a>
    </div>
  );
};
