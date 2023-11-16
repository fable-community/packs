import type { ComponentChildren, JSX } from 'preact';

export default (
  props: {
    name: string;
    children?: ComponentChildren;
    visible?: boolean;
    action?: 'hide' | 'back';
  } & JSX.HTMLAttributes<HTMLElement>,
) => {
  const { children, name, action, visible } = props;

  return (
    <>
      <i
        data-dialog-cb={name}
        data-dialog-cb-action={action ?? 'hide'}
        data-dialog-cancel={name}
        class={`bg-embed fixed z-[9] top-0 left-0 w-full h-full opacity-80`}
        style={{ display: visible ? 'inherit' : 'none' }}
      />

      <i
        data-dialog-cb={name}
        data-dialog-cb-action={action ?? 'hide'}
        class={`z-[10] fixed overflow-x-hidden overflow-y-auto ${props.class}`}
        style={{ display: visible ? 'inherit' : 'none' }}
      >
        {children}
      </i>
    </>
  );
};
