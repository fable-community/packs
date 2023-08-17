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
        class={`dialog-holder`}
        style={{ display: visible ? 'inherit' : 'none' }}
      />

      <i
        data-dialog-cb={name}
        data-dialog-cb-action={action ?? 'hide'}
        class={`dialog-wrapper ${props.class}`}
        style={{ display: visible ? 'inherit' : 'none' }}
      >
        {children}
      </i>
    </>
  );
};
