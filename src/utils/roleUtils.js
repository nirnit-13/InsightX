/**
 * roleUtils.js — Role-based permission helpers.
 */

export const ROLES = {
  ADMIN:       'admin',
  CONTRIBUTOR: 'contributor',
}

/**
 * Check if a user has at least one of the allowed roles.
 */
export function hasRole(user, allowedRoles = []) {
  if (!user) return false
  if (allowedRoles.length === 0) return true
  return allowedRoles.includes(user.role)
}

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN
}

export function isContributor(user) {
  return user?.role === ROLES.CONTRIBUTOR
}

/**
 * Get the display label for a role.
 */
export function getRoleLabel(role) {
  const labels = {
    admin:       'Administrator',
    contributor: 'Contributor',
  }
  return labels[role] || role
}

/**
 * Get role color for badges.
 */
export function getRoleColor(role) {
  const colors = {
    admin:       '#f59e0b',
    contributor: '#06b6d4',
  }
  return colors[role] || '#64748b'
}

/**
 * Get which nav items a user can access.
 */
export function getAccessibleRoutes(role) {
  const shared = ['/dashboard', '/tasks', '/leaderboard', '/profile']
  const adminOnly = ['/contributors', '/analytics', '/reports']
  if (role === ROLES.ADMIN) return [...shared, ...adminOnly]
  return shared
}

/**
 * Can the user perform an action?
 */
export const permissions = {
  canCreateTask:       (user) => !!user,
  canDeleteTask:       (user) => isAdmin(user),
  canEditAnyTask:      (user) => isAdmin(user),
  canEditOwnTask:      (user, task) => !!user && task?.assigned_to === user.id,
  canManageContributors: (user) => isAdmin(user),
  canViewAnalytics:    (user) => isAdmin(user),
  canViewReports:      (user) => isAdmin(user),
  canGenerateReports:  (user) => isAdmin(user),
}