/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // 縺昴・莉悶・迺ｰ蠅・､画焚縺後≠繧句ｴ蜷医・縺薙％縺ｫ霑ｽ蜉
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
