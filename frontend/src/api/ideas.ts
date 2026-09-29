import apiClient from "./client";
import type { Idea, IdeaCreateRequest, IdeaUpdateRequest } from "../types";

interface GetIdeasParams {
  search?: string;
  category?: string;
  status?: string;
}

export async function getIdeas(params?: GetIdeasParams): Promise<Idea[]> {
  const response = await apiClient.get("/ideas", { params });
  return response.data;
}

export async function getIdea(id: number): Promise<Idea> {
  const response = await apiClient.get(`/ideas/${id}`);
  return response.data;
}

export async function createIdea(data: IdeaCreateRequest): Promise<Idea> {
  const response = await apiClient.post("/ideas", data);
  return response.data;
}

export async function updateIdea(
  id: number,
  data: IdeaUpdateRequest
): Promise<Idea> {
  const response = await apiClient.put(`/ideas/${id}`, data);
  return response.data;
}

export async function deleteIdea(id: number): Promise<void> {
  await apiClient.delete(`/ideas/${id}`);
}

export async function submitIdea(id: number): Promise<{ message: string }> {
  const response = await apiClient.post(`/ideas/${id}/submit`);
  return response.data;
}
