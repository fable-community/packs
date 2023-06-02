import { Head } from '$fresh/runtime.ts';

import { ComponentChildren } from 'preact';

import { createStyle } from 'flcss';

import colors from '../utils/theme.ts';

export default (
  props: {
    name: string;
    children?: ComponentChildren;
    class?: string;
    visible?: boolean;
    action?: 'hide' | 'back';
  },
) => {
  const { children, name, action, visible } = props;

  const styles = createStyle({
    wrapper: {
      position: 'absolute',
      visibility: visible ? 'visible' : 'hidden',
      background: colors.embed,
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      opacity: 0.8,
    },
    container: {
      position: 'absolute',
      visibility: visible ? 'visible' : 'hidden',
    },
  });

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>

      <div
        data-dialog-cb={name}
        data-dialog-cb-action={action ?? 'hide'}
        data-dialog-cancel={name}
        class={styles.names.wrapper}
      />

      <div
        data-dialog-cb={name}
        data-dialog-cb-action={action ?? 'hide'}
        class={`${styles.names.container} ${props.class}`}
      >
        {children}
      </div>
    </>
  );
};
