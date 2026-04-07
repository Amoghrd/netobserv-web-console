import { act, renderHook } from '@testing-library/react-hooks';
import { useFullScreen } from '../fullscreen-hook';

describe('useFullScreen', () => {
  let header: HTMLElement;
  let sidebar: HTMLElement;
  let masthead: HTMLElement;

  beforeEach(() => {
    header = document.createElement('div');
    header.id = 'page-main-header';
    document.body.appendChild(header);

    sidebar = document.createElement('div');
    sidebar.id = 'page-sidebar';
    document.body.appendChild(sidebar);

    masthead = document.createElement('div');
    masthead.classList.add('pf-v5-c-masthead');
    document.body.appendChild(masthead);
  });

  afterEach(() => {
    header.remove();
    sidebar.remove();
    masthead.remove();
  });

  it('should start not fullscreen', () => {
    const { result } = renderHook(() => useFullScreen());
    const [isFullScreen] = result.current;
    expect(isFullScreen).toBe(false);
  });

  it('should toggle fullscreen and add hidden class to chrome elements', () => {
    const { result } = renderHook(() => useFullScreen());

    act(() => {
      const setFullScreen = result.current[1];
      setFullScreen(true);
    });

    expect(result.current[0]).toBe(true);
    expect(header.classList.contains('hidden')).toBe(true);
    expect(sidebar.classList.contains('hidden')).toBe(true);
    expect(masthead.classList.contains('hidden')).toBe(true);
  });

  it('should remove hidden class when exiting fullscreen', () => {
    const { result } = renderHook(() => useFullScreen());

    act(() => result.current[1](true));
    expect(header.classList.contains('hidden')).toBe(true);

    act(() => result.current[1](false));
    expect(header.classList.contains('hidden')).toBe(false);
    expect(sidebar.classList.contains('hidden')).toBe(false);
    expect(masthead.classList.contains('hidden')).toBe(false);
  });

  it('should click nav-toggle when sidebar is expanded', () => {
    const navToggle = document.createElement('button');
    navToggle.id = 'nav-toggle';
    const clickSpy = jest.spyOn(navToggle, 'click');
    document.body.appendChild(navToggle);

    sidebar.classList.add('pf-v5-c-page__sidebar', 'pf-m-expanded');

    const { result } = renderHook(() => useFullScreen());

    act(() => result.current[1](true));
    expect(clickSpy).toHaveBeenCalled();

    navToggle.remove();
  });
});
