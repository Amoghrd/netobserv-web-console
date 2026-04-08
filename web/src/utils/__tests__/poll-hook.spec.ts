import { renderHook } from '@testing-library/react-hooks';
import { usePoll } from '../poll-hook';

describe('usePoll', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not set interval when delay is undefined', () => {
    const callback = jest.fn();
    renderHook(() => usePoll(callback, undefined));

    jest.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should call callback at the specified interval', () => {
    const callback = jest.fn();
    renderHook(() => usePoll(callback, 1000));

    expect(callback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should clear interval on unmount', () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => usePoll(callback, 1000));

    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    unmount();

    jest.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should update callback reference without resetting interval', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const { rerender } = renderHook(({ cb }) => usePoll(cb, 1000), {
      initialProps: { cb: callback1 }
    });

    jest.advanceTimersByTime(1000);
    expect(callback1).toHaveBeenCalledTimes(1);

    rerender({ cb: callback2 });

    jest.advanceTimersByTime(1000);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledTimes(1);
  });
});
