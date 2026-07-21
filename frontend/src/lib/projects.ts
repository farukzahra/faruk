import { api } from "@/lib/api";

export interface Project {
  id: string;
  name: string;
  stack: string;
  description: string;
  url: string;
}

export interface ProjectsCatalog {
  updatedAt: string;
  projects: Project[];
}

export async function fetchProjects(): Promise<ProjectsCatalog> {
  const { data } = await api.get<ProjectsCatalog>("/projects");
  return data;
}
