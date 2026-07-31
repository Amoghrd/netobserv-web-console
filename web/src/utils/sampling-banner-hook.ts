import * as React from 'react';

const SAMPLING_BANNER_DISMISSED_KEY = 'netobserv.sampling-banner-dismissed';

export const useSamplingBannerDismiss = () => {
  const [isDismissed, setIsDismissed] = React.useState(() => {
    return localStorage.getItem(SAMPLING_BANNER_DISMISSED_KEY) === 'true';
  });

  const handleDismiss = React.useCallback(() => {
    localStorage.setItem(SAMPLING_BANNER_DISMISSED_KEY, 'true');
    setIsDismissed(true);
  }, []);

  return { isDismissed, handleDismiss };
};
