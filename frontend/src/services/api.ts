import type { Template, TargetUser, Campaign, GlobalStats, CampaignStats } from "../types";

const BASE = "http://localhost:5000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

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

// Stats
export const getGlobalStats = () => request<GlobalStats>("/api/stats/");
export const getCampaignStats = (id: number) =>
  request<CampaignStats>(`/api/stats/campaigns/${id}`);
