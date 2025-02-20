import type { HTMLAttributes } from "react";

const Dialog = (
  props: {
    name: string;
    children?: React.ReactNode;
    visible?: boolean;
    action?: "hide" | "back";
  } & HTMLAttributes<HTMLElement>
) => {
  const { children, name, action, visible } = props;

  return (
    <>
      <i
        data-dialog-cb={name}
        data-dialog-cb-action={action ?? "hide"}
        data-dialog-cancel={name}
        className={`bg-embed fixed z-[9] top-0 left-0 w-full h-full opacity-80`}
        style={{ display: visible ? "inherit" : "none" }}
      />

      <i
        data-dialog-cb={name}
        data-dialog-cb-action={action ?? "hide"}
        className={`z-[10] fixed overflow-x-hidden overflow-y-auto ${props.className}`}
        style={{ display: visible ? "inherit" : "none" }}
      >
        {children}
      </i>
    </>
  );
};

export default Dialog;
