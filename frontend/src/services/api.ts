import type { Template, TargetUser, Campaign, GlobalStats, CampaignStats, DepartmentStat, CampaignOverview } from "../types";
import { getToken } from "./auth";

const BASE = "http://localhost:5000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// Auth
export const login = (username: string, password: string) =>
  request<{ access_token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

// Templates
export const getTemplates = () => request<Template[]>("/api/templates/");
export const createTemplate = (data: Omit<Template, "id" | "created_at">) =>
  request<Template>("/api/templates/", { method: "POST", body: JSON.stringify(data) });
export const deleteTemplate = (id: number) =>
  request<void>(`/api/templates/${id}`, { method: "DELETE" });

// Users
export const getUsers = () => request<TargetUser[]>("/api/users/");
export const createUser = (data: Omit<TargetUser, "id">) =>
  request<TargetUser>("/api/users/", { method: "POST", body: JSON.stringify(data) });
export const deleteUser = (id: number) =>
  request<void>(`/api/users/${id}`, { method: "DELETE" });

// Campaigns
export const getCampaigns = () => request<Campaign[]>("/api/campaigns/");
export const createCampaign = (data: {
  name: string;
  description?: string;
  template_id: number;
  user_ids: number[];
}) => request<Campaign>("/api/campaigns/", { method: "POST", body: JSON.stringify(data) });
export const startCampaign = (id: number) =>
  request<{ message: string; sent: number; failed: number }>(
    `/api/campaigns/${id}/start`,
    { method: "POST" }
  );
export const deleteCampaign = (id: number) =>
  request<void>(`/api/campaigns/${id}`, { method: "DELETE" });

// Users CSV import
export const importUsersCSV = async (file: File): Promise<{ added: number; skipped: number }> => {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api/users/import-csv`, { method: "POST", headers, body: form });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
  return res.json();
};

// Stats
export const getGlobalStats = () => request<GlobalStats>("/api/stats/");
export const getCampaignStats = (id: number) =>
  request<CampaignStats>(`/api/stats/campaigns/${id}`);
export const getDepartmentStats = () => request<DepartmentStat[]>("/api/stats/departments");
export const getCampaignsOverview = () => request<CampaignOverview[]>("/api/stats/campaigns-overview");
