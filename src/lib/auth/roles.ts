// Role-based access control utilities
export type UserRole = "user" | "admin";

export const ROLES = {
  USER: "user" as const,
  ADMIN: "admin" as const
} as const;

export function hasRole(userRole: string | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;

  // Admin has access to everything
  if (userRole === ROLES.ADMIN) return true;

  // Check specific role
  return userRole === requiredRole;
}

export function isAdmin(userRole: string | undefined): boolean {
  return userRole === ROLES.ADMIN;
}

export function isUser(userRole: string | undefined): boolean {
  return userRole === ROLES.USER;
}

// Role hierarchy - higher number = more permissions
export const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.ADMIN]: 10
} as const;

export function hasMinimumRole(userRole: string | undefined, minimumRole: UserRole): boolean {
  if (!userRole) return false;

  const userLevel = ROLE_HIERARCHY[userRole as UserRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

  return userLevel >= requiredLevel;
}
