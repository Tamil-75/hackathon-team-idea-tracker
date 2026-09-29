import apiClient from "./client";
import type {
  Team,
  TeamDetail,
  TeamCreateRequest,
  TeamUpdateRequest,
} from "../types";

export async function getTeams(search?: string): Promise<Team[]> {
  const params = search ? { search } : {};
  const response = await apiClient.get("/teams", { params });
  return response.data;
}

export async function getTeam(id: number): Promise<TeamDetail> {
  const response = await apiClient.get(`/teams/${id}`);
  return response.data;
}

export async function createTeam(data: TeamCreateRequest): Promise<TeamDetail> {
  const response = await apiClient.post("/teams", data);
  return response.data;
}

export async function updateTeam(
  id: number,
  data: TeamUpdateRequest
): Promise<TeamDetail> {
  const response = await apiClient.put(`/teams/${id}`, data);
  return response.data;
}

export async function deleteTeam(id: number): Promise<void> {
  await apiClient.delete(`/teams/${id}`);
}

export async function joinTeam(id: number): Promise<TeamDetail> {
  const response = await apiClient.post(`/teams/${id}/join`);
  return response.data;
}

export async function leaveTeam(id: number): Promise<void> {
  await apiClient.post(`/teams/${id}/leave`);
}
