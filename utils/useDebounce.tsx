import { type StateUpdater, useEffect, useState } from 'preact/hooks';

export const useDebounce = <T,>(
  initialValue: T,
  time: number,
): [T, T, StateUpdater<T>] => {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setDebouncedValue(value);
    }, time);

    return () => {
      clearTimeout(debounce);
    };
  }, [value, time]);

  return [debouncedValue, value, setValue];
};
