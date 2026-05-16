/**
 * src/hooks/useTasks.js
 *
 * FIX — Role-aware query execution:
 *   - Admins call /tasks/ (all tasks with filters)
 *   - Contributors call /tasks/my (own tasks only)
 *   - `enabled` flag ensures query only fires when user is authenticated
 *   - Prevents hidden widgets from triggering wrong API calls
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksAPI } from '../services/api/tasksAPI'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export const TASKS_KEY = ['tasks']

/**
 * FIX: Role-aware task fetching.
 *   Admin   → GET /tasks/        (all tasks, with optional filters)
 *   Contributor → GET /tasks/my  (own tasks only — avoids 403)
 */
export function useTasks(params = {}) {
  const { user, isAdmin } = useAuth()
  return useQuery({
    queryKey: [...TASKS_KEY, isAdmin ? 'all' : 'my', params],
    queryFn:  () => isAdmin ? tasksAPI.getAll(params) : tasksAPI.getMyTasks(params),
    staleTime: 20_000,
    enabled:  !!user,   // FIX: only fire when authenticated
  })
}

/**
 * Fetch a single task by ID.
 */
export function useTask(id) {
  const { user } = useAuth()
  return useQuery({
    queryKey: [...TASKS_KEY, id],
    queryFn:  () => tasksAPI.getById(id),
    enabled:  !!user && !!id,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tasksAPI.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Task created')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to create task'),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => tasksAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Task updated')
    },
    onError: () => toast.error('Update failed'),
  })
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => tasksAPI.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: TASKS_KEY })
      const prev = qc.getQueryData(TASKS_KEY)
      qc.setQueryData(TASKS_KEY, old =>
        old ? old.map(t => t.id === id ? { ...t, status } : t) : old
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(TASKS_KEY, ctx?.prev)
      toast.error('Status update failed')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY })
      qc.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tasksAPI.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Task deleted')
    },
    onError: () => toast.error('Delete failed'),
  })
}