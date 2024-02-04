export default ({ active }: { active: 'browse' | 'create' }) => {
  return (
    <div
      class={'w-full flex gap-3 uppercase text-[1.05rem] cursor-pointer font-bold'}
    >
      <a
        href={'/browse'}
        class={active === 'browse'
          ? 'text-white'
          : 'text-grey hover:text-white'}
      >
        Popular
      </a>
      <a
        href={'/dashboard'}
        class={active === 'create'
          ? 'text-white'
          : 'text-grey hover:text-white'}
      >
        Create
      </a>
    </div>
  );
};
