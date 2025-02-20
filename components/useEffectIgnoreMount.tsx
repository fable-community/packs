import {
  type EffectCallback,
  type DependencyList,
  useEffect,
  useRef,
} from "react";

/** normal`useEffect` always runs on mount, this only runs if the initial data changed */
export const useEffectIgnoreMount = (
  effect: EffectCallback,
  inputs?: DependencyList
) => {
  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) {
      effect();
    } else {
      didMount.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, inputs);
};
