import { useEffect } from 'react';

export const useOutsideClick = (
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void,
  exceptionRef?: React.RefObject<HTMLElement | null>,
) => {
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        ref.current &&
        !ref.current.contains(target) &&
        (!exceptionRef || !exceptionRef.current?.contains(target))
      ) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [ref, callback, exceptionRef]);
};
