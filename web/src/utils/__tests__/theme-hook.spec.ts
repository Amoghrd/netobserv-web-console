import { cleanup } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import { useTheme } from '../theme-hook';

describe('useTheme', () => {
  afterEach(() => {
    // Unmount hooks first so MutationObserver is disconnected before DOM cleanup
    cleanup();
    document.documentElement.classList.remove('pf-v5-theme-dark', 'pf-v5-theme-dark');
  });

  it('should return false when no dark theme class is present', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe(false);
  });

  it('should return true when pf-v5-theme-dark class is present', () => {
    document.documentElement.classList.add('pf-v5-theme-dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe(true);
  });

  it('should return true when pf-v5-theme-dark class is present', () => {
    document.documentElement.classList.add('pf-v5-theme-dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe(true);
  });

  it('should react to dark theme being added', async () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe(false);

    await act(async () => {
      document.documentElement.classList.add('pf-v5-theme-dark');
      await Promise.resolve();
    });
    expect(result.current).toBe(true);
  });

  it('should react to dark theme being removed', async () => {
    document.documentElement.classList.add('pf-v5-theme-dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe(true);

    await act(async () => {
      document.documentElement.classList.remove('pf-v5-theme-dark');
      await Promise.resolve();
    });
    expect(result.current).toBe(false);
  });

  it('should disconnect observer on unmount', async () => {
    const { unmount } = renderHook(() => useTheme());
    unmount();
    document.documentElement.classList.add('pf-v5-theme-dark');
    await Promise.resolve();
  });
});
