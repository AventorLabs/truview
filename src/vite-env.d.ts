/// <reference types="vite/client" />

// Extend the global namespace to include model-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}