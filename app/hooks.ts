import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Like useSearchParams of next/navigation, but provides a setter and can handle a default value.
 * If no searchParam is present in the URL, the default value is used.
 * The type parameter T should be 'string' if the value is used for a TextInput.
 * T should be 'string | null' for the value of a Select.
 */
export function useSearchParam<T>(name: string, defaultValue: T): [T, (newValue: T) => void] {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get(name);
  const value = (searchParam === null) ? defaultValue : JSON.parse(searchParam);

  const setSearchParam = useCallback((newValue: T) => {
    const searchParams = new URLSearchParams(window.location.search);
    const serializedValue = JSON.stringify(newValue);

    if (serializedValue === JSON.stringify(defaultValue)) {
      searchParams.delete(name);
    } else {
      searchParams.set(name, serializedValue);
    }

    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState(null, '', newUrl);
  }, [name, defaultValue]);

  return [value, setSearchParam];
};