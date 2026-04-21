import * as React from 'react';

export const useOutsideClickEvent = (onClickOutside: () => void) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        // Don't close if clicking on a PatternFly menu/dropdown that's rendered via portal
        const target = event.target;
        const isPatternFlyMenu = target instanceof Element && target.closest('.pf-v6-c-menu, .pf-v6-c-select__menu');

        if (!isPatternFlyMenu) {
          onClickOutside();
        }
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClickOutside, ref]);

  return ref;
};
