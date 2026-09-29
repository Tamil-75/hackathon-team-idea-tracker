import apiClient from "./client";
import type {
  AdminDashboardResponse,
  AdminUserResponse,
  AdminTeamResponse,
  AdminIdeaResponse,
  IdeaStatus,
} from "../types";

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const response = await apiClient.get("/dashboard/admin");
  return response.data;
}

export async function getAdminUsers(): Promise<AdminUserResponse[]> {
  const response = await apiClient.get("/admin/users");
  return response.data;
}

export async function getAdminTeams(): Promise<AdminTeamResponse[]> {
  const response = await apiClient.get("/admin/teams");
  return response.data;
}

export async function getAdminIdeas(): Promise<AdminIdeaResponse[]> {
  const response = await apiClient.get("/admin/ideas");
  return response.data;
}

export async function updateIdeaStatus(
  id: number,
  status: IdeaStatus
): Promise<{
  id: number;
  title: string;
  previous_status: string;
  new_status: string;
  message: string;
}> {
  const response = await apiClient.patch(`/admin/ideas/${id}/status`, { status });
  return response.data;
}
