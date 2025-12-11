// client/src/api.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  console.error("VITE_API_BASE_URL is not defined");
}

// /api を baseURL に付ける
export const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

// default export を追加 (これがポイント)
export default api;

// ヘルスチェック
export const getHealth = () => api.get("/health");

// 施設一覧
export const getFacilities = () => api.get("/facilities");