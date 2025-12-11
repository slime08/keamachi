// client/src/api.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  console.error("VITE_API_BASE_URL is not defined");
} else {
  console.log("API_BASE from VITE_API_BASE_URL:", API_BASE); // API_BASE のログ出力
}

// /api を baseURL に付ける
export const api = axios.create({
  baseURL: `${API_BASE}`, // ここを修正: "/api" を削除
});

// default export を追加 (これがポイント)
export default api;

// ヘルスチェック
export const getHealth = () => api.get("/health");

// 施設一覧
export const getFacilities = async () => {
  const response = await api.get("/facilities");
  return response.data; // Return the data property, which should be the array
};