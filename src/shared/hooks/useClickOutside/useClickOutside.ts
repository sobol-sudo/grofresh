import { useEffect, useRef } from 'react';

export interface UseClickOutsideOptions {
  doubleEvent?: boolean;           // when true, listen for a double-click / double-tap instead
  doubleTapDelay?: number;         // max gap between taps to count as a double-tap (ms)
}

/**
 * Tracks clicks that land outside a given element.
 * 
 * @template T - the HTML element type (e.g. HTMLDivElement)
 * @param {React.RefObject<T>} ref - ref to the element to watch for outside clicks
 * @param {() => void} callback - called when a click or double-tap lands outside the element
 * @param {UseClickOutsideOptions} [options] - additional options
 * @param {boolean} [options.doubleEvent=false] - when true, only fires on a double-click (desktop) or double-tap (mobile)
 * @param {number} [options.doubleTapDelay=300] - maximum gap between two touches for them to register as a double-tap (ms)
 */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  callback: () => void,
  options?: UseClickOutsideOptions
) {
  const lastTap = useRef(0);
  const doubleTapDelay = options?.doubleTapDelay ?? 300;

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    const handleDoubleTap = (event: TouchEvent) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap.current;

      if (tapLength < doubleTapDelay  && tapLength > 0) {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          callback();
        }
      }

      lastTap.current = currentTime;
    };

    if (options?.doubleEvent) {
      document.addEventListener('dblclick', handleClickOutside as EventListener);
      document.addEventListener('touchstart', handleDoubleTap);
      return () => {
        document.removeEventListener('dblclick', handleClickOutside as EventListener);
        document.removeEventListener('touchstart', handleDoubleTap);
      };
    } else {
      document.addEventListener('mousedown', handleClickOutside as EventListener);
      document.addEventListener('touchstart', handleClickOutside as EventListener);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside as EventListener);
        document.removeEventListener('touchstart', handleClickOutside as EventListener);
      };
    }
  }, [ref, callback, options?.doubleEvent, doubleTapDelay]);
}
