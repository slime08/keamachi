/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // この型定義ファイルは、環境変数をインテリセンスで認識させるためのものです
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
