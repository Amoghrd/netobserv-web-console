import * as React from 'react';

const SAMPLING_BANNER_DISMISSED_KEY = 'netobserv.sampling-banner-dismissed';

export const useSamplingBannerDismiss = () => {
  const [isDismissed, setIsDismissed] = React.useState(() => {
    try {
      return localStorage.getItem(SAMPLING_BANNER_DISMISSED_KEY) === 'true';
    } catch (e) {
      console.error(e);
      return false;
    }
  });

  const handleDismiss = React.useCallback(() => {
    try {
      localStorage.setItem(SAMPLING_BANNER_DISMISSED_KEY, 'true');
    } catch (e) {
      console.error(e);
    }
    setIsDismissed(true);
  }, []);

  return { isDismissed, handleDismiss };
};
