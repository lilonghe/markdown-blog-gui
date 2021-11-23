/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
}

interface FileSystemHandle {
  readonly kind: string;
  readonly name: string;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  values(): FileSystemDirectoryIterator;
}

interface FileSystemFileHandle extends FileSystemHandle {
  getFile(): Promise<File>;
}

interface FileSystemDirectoryIterator extends AsyncIterator<FileSystemDirectoryHandle | FileSystemFileHandle> {
  [Symbol.asyncIterator](): FileSystemDirectoryIterator;
}