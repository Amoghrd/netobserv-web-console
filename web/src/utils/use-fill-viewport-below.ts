import * as React from 'react';

const MIN_PX = 240;

/**
 * Bottom of the visible layout/visual viewport in client coordinates
 * (same space as `getBoundingClientRect()`).
 */
function getViewportBottomClientY(): number {
  const vv = window.visualViewport;
  if (vv) {
    return vv.offsetTop + vv.height;
  }
  return window.innerHeight;
}

/**
 * Tightest bottom edge among the viewport and scroll/clipping ancestors.
 * OpenShift Console (and PF Page) often scroll inside a pane whose bottom is
 * above `innerHeight`; sizing to the window alone then overflows that pane.
 */
function getEffectiveBottomClientY(el: HTMLElement): number {
  let clipBottom = getViewportBottomClientY();

  const rootH = document.documentElement?.clientHeight;
  if (typeof rootH === 'number' && rootH > 0) {
    clipBottom = Math.min(clipBottom, rootH);
  }

  let n: HTMLElement | null = el.parentElement;
  while (n) {
    const st = getComputedStyle(n);
    if (st.overflowY !== 'visible') {
      const r = n.getBoundingClientRect();
      clipBottom = Math.min(clipBottom, r.bottom);
    }
    if (n === document.documentElement) {
      break;
    }
    n = n.parentElement;
  }

  return clipBottom;
}

function trimElementBelowLimit(el: HTMLElement, getLimit: () => number): void {
  let guard = 0;
  while (guard++ < 16) {
    const limit = getLimit();
    const bottom = el.getBoundingClientRect().bottom;
    if (bottom <= limit + 0.75) {
      break;
    }
    const excess = bottom - limit;
    const cur = el.getBoundingClientRect().height;
    const next = Math.max(MIN_PX, Math.floor(cur - excess) - 1);
    if (next >= cur) {
      break;
    }
    const px = `${next}px`;
    el.style.height = px;
    el.style.minHeight = px;
    el.style.maxHeight = px;
  }
}

/**
 * Sizes an element to fill the space below its top edge to the effective bottom
 * (viewport ∩ scroll/clipping ancestors). Trims after layout so the host page
 * or console pane does not show a vertical scrollbar.
 *
 * ResizeObserver callbacks only schedule work for a later frame so the browser
 * does not report "ResizeObserver loop completed with undelivered notifications".
 */
export function useFillViewportBelow<T extends HTMLElement = HTMLDivElement>(enabled: boolean) {
  const ref = React.useRef<T | null>(null);

  React.useLayoutEffect(() => {
    if (!enabled) {
      return;
    }
    const el = ref.current;
    if (!el) {
      return;
    }

    let rafApply = 0;
    let trimOuter = 0;
    let trimInner = 0;

    const cancelScheduled = () => {
      if (rafApply) {
        cancelAnimationFrame(rafApply);
        rafApply = 0;
      }
      if (trimOuter) {
        cancelAnimationFrame(trimOuter);
        trimOuter = 0;
      }
      if (trimInner) {
        cancelAnimationFrame(trimInner);
        trimInner = 0;
      }
    };

    const queueTrim = () => {
      if (trimOuter) {
        cancelAnimationFrame(trimOuter);
      }
      if (trimInner) {
        cancelAnimationFrame(trimInner);
      }
      trimOuter = requestAnimationFrame(() => {
        trimOuter = 0;
        trimInner = requestAnimationFrame(() => {
          trimInner = 0;
          if (el.isConnected) {
            trimElementBelowLimit(el, () => getEffectiveBottomClientY(el));
          }
        });
      });
    };

    const flushApply = () => {
      const top = el.getBoundingClientRect().top;
      const bottomLimit = getEffectiveBottomClientY(el);
      let h = bottomLimit - top;
      h = Math.max(MIN_PX, Math.floor(h) - 2);

      const px = `${h}px`;
      el.style.height = px;
      el.style.minHeight = px;
      el.style.maxHeight = px;

      queueTrim();
    };

    /** Observers must not mutate layout synchronously — defer to next frame. */
    const scheduleApply = () => {
      if (rafApply) {
        return;
      }
      rafApply = requestAnimationFrame(() => {
        rafApply = 0;
        flushApply();
      });
    };

    flushApply();

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            scheduleApply();
          })
        : null;
    ro?.observe(document.body);
    if (document.documentElement !== document.body) {
      ro?.observe(document.documentElement);
    }

    let selfRo: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      selfRo = new ResizeObserver(() => {
        scheduleApply();
      });
      selfRo.observe(el);
    }

    window.addEventListener('resize', scheduleApply);
    window.visualViewport?.addEventListener('resize', scheduleApply);
    window.visualViewport?.addEventListener('scroll', scheduleApply);

    return () => {
      cancelScheduled();
      ro?.disconnect();
      selfRo?.disconnect();
      window.removeEventListener('resize', scheduleApply);
      window.visualViewport?.removeEventListener('resize', scheduleApply);
      window.visualViewport?.removeEventListener('scroll', scheduleApply);
      el.style.height = '';
      el.style.minHeight = '';
      el.style.maxHeight = '';
    };
  }, [enabled]);

  return ref;
}
