import { useLocalStorage } from './local-storage-hook';

export const localStorageSamplingBannerDismissedKey = 'sampling-banner-dismissed';

export const useSamplingBannerDismiss = () => {
  const [isDismissed, setIsDismissed] = useLocalStorage<boolean>(localStorageSamplingBannerDismissedKey, false);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return { isDismissed, handleDismiss };
};
