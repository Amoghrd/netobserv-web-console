import * as React from 'react';

const isDark = (el: HTMLElement) =>
  el.classList.contains('pf-v5-theme-dark') || el.classList.contains('pf-v5-theme-dark');

export function useTheme(): boolean {
  const [isDarkTheme, setDarkTheme] = React.useState<boolean>(() => isDark(document.documentElement));

  React.useEffect(() => {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      mutations.forEach((mutation: MutationRecord) => {
        if (mutation.attributeName === 'class') {
          setDarkTheme(isDark(mutation.target as HTMLElement));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return isDarkTheme;
}
