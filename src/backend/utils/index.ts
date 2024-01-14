import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { Project, ProjectRoleType } from "@prisma/client";

export const isUserAdmin = (
  project: Project | ExtendedProject | null,
  userId: string
) => {
  if (!project) {
    return false;
  }

  return !!project.roles.find(
    (role) => role.type === ProjectRoleType.ADMIN && role.userId === userId
  );
};

export const isUserManager = (
  project: Project | ExtendedProject | null,
  userId: string
) => {
  if (!project || !userId) return false;
  return !!project.roles.find(
    (role) => role.type === ProjectRoleType.MANAGER && role.userId === userId
  );
};
