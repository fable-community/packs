import { Head } from '$fresh/runtime.ts';

import { ComponentChildren } from 'preact';

import { createStyle } from 'flcss';

import colors from '../theme.ts';

export default (
  { children, name }: { children: ComponentChildren; name: string },
) => {
  const styles = createStyle({
    wrapper: {
      position: 'fixed',
      visibility: 'hidden',
      background: colors.embed,
      width: '100vw',
      height: '100vh',
      opacity: 0.8,
    },
    container: {
      visibility: 'hidden',
      position: 'absolute',
    },
  });

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>

      <div
        data-dialog-cb={name}
        data-dialog-cancel={name}
        class={styles.names.wrapper}
      />

      <div
        data-dialog-cb={name}
        class={styles.names.container}
      >
        {children}
      </div>
    </>
  );
};
