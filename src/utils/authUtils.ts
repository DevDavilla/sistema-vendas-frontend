import { BACKEND_BASE_URL } from "../config/api"; // Importa a URL base

export const getAuthHeaders = (token: string | null) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export { BACKEND_BASE_URL }; // Re-exporta a URL base para fácil importação em outros locais
