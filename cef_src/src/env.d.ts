/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface CefBridge {
  on(event: string, callback: (...args: any[]) => void): void
  emit(event: string, ...args: any[]): void
}

declare global {
  interface Window {
    cef?: CefBridge
  }
}

export {} 
