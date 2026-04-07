import * as React from 'react';

export function useFullScreen(): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [isFullScreen, setFullScreen] = React.useState(false);

  React.useEffect(() => {
    if (isFullScreen && document.getElementsByClassName('pf-v5-c-page__sidebar pf-m-expanded').length) {
      document.getElementById('nav-toggle')?.click();
    }

    const header = document.getElementById('page-main-header');
    const headersCompat = document.getElementsByClassName('pf-v5-c-masthead');
    const sideBar = document.getElementById('page-sidebar');
    const sideBarsCompat = document.getElementsByClassName('pf-v5-c-page__sidebar');
    const notification = document.getElementsByClassName('co-global-notifications');

    [
      header,
      ...(headersCompat ? Array.from(headersCompat) : []),
      sideBar,
      ...(sideBarsCompat ? Array.from(sideBarsCompat) : []),
      ...(notification ? Array.from(notification) : [])
    ].forEach(e => {
      if (isFullScreen) {
        e?.classList.add('hidden');
      } else {
        e?.classList.remove('hidden');
      }
    });
  }, [isFullScreen]);

  return [isFullScreen, setFullScreen];
}
