import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for JSDOM
Object.assign(global, { TextEncoder, TextDecoder });

// Polyfill ResizeObserver for JSDOM
class ResizeObserverMock {
  observe() { /* noop */ }
  unobserve() { /* noop */ }
  disconnect() { /* noop */ }
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Ensure #root element exists for PatternFly DragDropContainer portal
if (typeof document !== 'undefined' && !document.getElementById('root')) {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
}
