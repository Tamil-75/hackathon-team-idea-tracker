export interface User {
  id: number;
  name: string;
  register_number: string;
  email: string;
  role: "student" | "admin";
  created_at: string;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  leader_id: number;
  leader_name: string;
  member_count: number;
  max_members: number;
  available_slots: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  user_id: number;
  name: string;
  register_number: string;
  joined_at: string;
}

export interface TeamDetail extends Team {
  members: TeamMember[];
}

export interface TeamCreateRequest {
  name: string;
  description?: string;
  max_members: number;
}

export interface TeamUpdateRequest {
  name?: string;
  description?: string;
  max_members?: number;
}

export type IdeaStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Rejected";

export interface Idea {
  id: number;
  title: string;
  description: string;
  problem_statement: string;
  proposed_solution: string;
  category: string;
  technology_stack: string | null;
  github_url: string | null;
  status: IdeaStatus;
  created_by: number;
  creator_name: string;
  team_id: number | null;
  team_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface IdeaCreateRequest {
  title: string;
  description: string;
  problem_statement: string;
  proposed_solution: string;
  category: string;
  technology_stack: string;
  github_url?: string;
  team_id?: number | null;
}

export interface IdeaUpdateRequest {
  title?: string;
  description?: string;
  problem_statement?: string;
  proposed_solution?: string;
  category?: string;
  technology_stack?: string;
  github_url?: string | null;
  team_id?: number | null;
}

export interface StudentDashboardUser {
  id: number;
  name: string;
  register_number: string;
  email: string;
}

export interface StudentDashboardTeam {
  id: number;
  name: string;
  description: string;
  leader_id: number;
  leader_name: string;
  member_count: number;
  max_members: number;
  available_slots: number;
}

export interface StudentDashboardIdeaStatistics {
  total: number;
  draft: number;
  submitted: number;
  under_review: number;
  approved: number;
  rejected: number;
}

export interface StudentDashboardIdea {
  id: number;
  title: string;
  category: string;
  status: string;
  team_id: number | null;
  team_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentDashboardResponse {
  user: StudentDashboardUser;
  team: StudentDashboardTeam | null;
  is_team_leader: boolean;
  idea_statistics: StudentDashboardIdeaStatistics;
  recent_ideas: StudentDashboardIdea[];
}

export interface AdminDashboardIdea {
  id: number;
  title: string;
  creator_name: string;
  category: string;
  status: string;
  team_name: string | null;
  created_at: string;
}

export interface AdminDashboardTeam {
  id: number;
  name: string;
  leader_name: string;
  member_count: number;
  max_members: number;
  created_at: string;
}

export interface AdminDashboardUser {
  id: number;
  name: string;
  register_number: string;
  role: string;
  created_at: string;
}

export interface AdminDashboardResponse {
  total_users: number;
  total_students: number;
  total_admins: number;
  total_teams: number;
  total_ideas: number;
  draft_ideas: number;
  submitted_ideas: number;
  under_review_ideas: number;
  approved_ideas: number;
  rejected_ideas: number;
  students_in_teams: number;
  students_without_team: number;
  teams_with_ideas: number;
  teams_without_ideas: number;
  recent_ideas: AdminDashboardIdea[];
  recent_teams: AdminDashboardTeam[];
  recent_users: AdminDashboardUser[];
}

export interface AdminUserResponse {
  id: number;
  name: string;
  register_number: string;
  email: string;
  role: string;
  created_at: string;
  team_id: number | null;
  team_name: string | null;
}

export interface AdminTeamMemberResponse {
  id: number;
  user_id: number;
  name: string;
  register_number: string;
  joined_at: string;
}

export interface AdminTeamResponse {
  id: number;
  name: string;
  description: string;
  leader_id: number;
  leader_name: string;
  member_count: number;
  max_members: number;
  available_slots: number;
  created_at: string;
  updated_at: string;
  members: AdminTeamMemberResponse[];
}

export interface AdminIdeaResponse {
  id: number;
  title: string;
  description: string;
  problem_statement: string;
  proposed_solution: string;
  category: string;
  technology_stack: string | null;
  github_url: string | null;
  status: IdeaStatus;
  created_by: number;
  creator_name: string;
  team_id: number | null;
  team_name: string | null;
  created_at: string;
  updated_at: string;
}
