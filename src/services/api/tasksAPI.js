/**
 * src/services/api/tasksAPI.js
 *
 * FIX — getMyTasks() now calls GET /tasks/my.
 *   The backend /tasks/my endpoint uses authenticated_required (not admin_required)
 *   so both roles can reach it.  Contributors get their own tasks; admins get theirs.
 *
 *   Previously the Tasks page and useTasks hook used /tasks/ for contributors,
 *   which on the backend applied no filtering — contributors could see all tasks.
 *   Now contributors are always routed through /tasks/my.
 */

import client from './client'

export const tasksAPI = {
  /** Admin: all tasks with optional filters */
  getAll: (params = {}) => client.get('/tasks/', { params }),

  /** Single task by ID */
  getById: (id) => client.get(`/tasks/${id}`),

  /**
   * FIX — Returns tasks assigned to the current user.
   * Calls GET /tasks/my (authenticated_required on the backend).
   * Safe for both admin and contributor roles.
   */
  getMyTasks: (params = {}) => client.get('/tasks/my', { params }),

  /** Create a new task */
  create: (data) => client.post('/tasks/', data),

  /** Full update */
  update: (id, data) => client.put(`/tasks/${id}`, data),

  /**
   * Status-only patch.
   * FIX: uses PUT with full payload because the backend doesn't have a
   * dedicated PATCH /status route — send only status in the body.
   */
  updateStatus: (id, status) => client.put(`/tasks/${id}`, { status }),

  /** Delete — admin only */
  delete: (id) => client.delete(`/tasks/${id}`),
}