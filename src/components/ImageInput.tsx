import { Head } from '$fresh/runtime.ts';

import { useRef } from 'preact/hooks';

import { createStyle } from 'flcss';

import colors from '../utils/theme.ts';

import IconImage from 'icons/photo-plus.tsx';

export const Static = (
  props: { name: string; accept: string[]; default?: string },
) => {
  const styles = createStyle({
    image: {
      display: 'flex',
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',

      overflow: 'hidden',
      borderRadius: '100%',
      height: '100%',
      width: '100%',

      border: `2px solid ${colors.grey}`,

      '> input': { width: '0' },

      '> img': {
        position: 'absolute',
        objectFit: 'cover',
        objectPosition: 'center',
        textIndent: '-100vh',
        height: '100%',
        width: '100%',
      },

      '> label': {
        position: 'absolute',
        width: '100%',
        height: '100%',
        cursor: 'pointer',
      },

      '> i': {
        position: 'absolute',
        color: colors.grey,
        width: '28px',
        height: '28px',

        '> svg': {
          width: '100%',
          height: '100%',
        },
      },
    },
  });

  return (
    <>
      <Head>
        <style>{styles.bundle}</style>
      </Head>
      <div class={styles.names.image}>
        <Island {...props} />
      </div>
    </>
  );
};

export const Island = (
  props: Parameters<typeof Static>['0'],
) => {
  const ref = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {!props.default
        ? (
          <i ref={placeholderRef}>
            <IconImage />
          </i>
        )
        : undefined}
      <img ref={ref} src={props.default ?? ''} />
      <label for={props.name} />
      <input
        type={'file'}
        id={props.name}
        name={props.name}
        accept={props.accept.join(',')}
        onChange={(ev) => {
          // deno-lint-ignore ban-ts-comment
          // @ts-ignore
          const blob = URL.createObjectURL(ev.target.files[0]);

          // deno-lint-ignore no-non-null-assertion
          ref.current!.src = blob;
          // deno-lint-ignore no-non-null-assertion
          ref.current!.onload = () => {
            URL.revokeObjectURL(blob);
            placeholderRef.current?.remove();
          };
        }}
      />
    </>
  );
};

export default Island;
