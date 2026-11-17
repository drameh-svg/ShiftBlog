import type { Role } from "@prisma/client";

export const EDITORIAL_ROLES: Role[] = ["EDITOR", "ADMIN"];

export function isEditorial(role?: Role | null): boolean {
  return role === "EDITOR" || role === "ADMIN";
}

export function canPublish(role?: Role | null): boolean {
  return role === "EDITOR" || role === "ADMIN";
}

export function canDeleteContent(role?: Role | null): boolean {
  return role === "ADMIN";
}

export function canManageTeam(role?: Role | null): boolean {
  return role === "ADMIN";
}

export function canModerate(role?: Role | null): boolean {
  return role === "EDITOR" || role === "ADMIN";
}

export function canCreateStory(role?: Role | null): boolean {
  return role === "EDITOR" || role === "ADMIN";
}

export function canManageOpportunities(role?: Role | null): boolean {
  return role === "EDITOR" || role === "ADMIN";
}

export function assertEditorial(role?: Role | null): asserts role is "EDITOR" | "ADMIN" {
  if (!isEditorial(role)) {
    throw new Error("Unauthorized");
  }
}

export function assertAdmin(role?: Role | null): asserts role is "ADMIN" {
  if (role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}
