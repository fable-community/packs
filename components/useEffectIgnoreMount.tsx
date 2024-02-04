import { useSignal } from '@preact/signals';

import { type EffectCallback, type Inputs, useEffect } from 'preact/hooks';

/** normal`useEffect` always runs on mount, this only runs if the initial data changed */
export const useEffectIgnoreMount = (
  effect: EffectCallback,
  inputs?: Inputs,
) => {
  const didMount = useSignal(false);
  useEffect(() => {
    didMount.value ? effect() : didMount.value = true;
  }, inputs);
};
