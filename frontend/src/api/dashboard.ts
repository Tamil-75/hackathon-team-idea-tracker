import apiClient from "./client";
import type { StudentDashboardResponse } from "../types";

export async function getStudentDashboard(): Promise<StudentDashboardResponse> {
  const response = await apiClient.get("/dashboard/student");
  return response.data;
}
