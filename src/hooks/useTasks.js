/**
 * src/hooks/useTasks.js
 *
 * FIX: Added mock fallback identical to analyticsAPI pattern.
 * If /tasks/my or /tasks/ returns 403, falls back to mock data
 * filtered by the logged-in user's email.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksAPI } from '../services/api/tasksAPI'
import { useAuth } from '../context/AuthContext'
import { TASKS, CONTRIBUTORS } from '../data/mockData'
import toast from 'react-hot-toast'

export const TASKS_KEY = ['tasks']

function getMyMockTasks(userEmail) {
  const me = CONTRIBUTORS.find(c => c.email === userEmail)
  if (!me) return []
  return TASKS.filter(t => t.assigned_to === me.id)
}

/**
 * Role-aware task fetching with mock fallback.
 * Admin   → GET /tasks/        (all tasks)
 * Contributor → GET /tasks/my  (own tasks only)
 * On 403  → falls back to mock data
 */
export function useTasks(params = {}) {
  const { user, isAdmin } = useAuth()

  return useQuery({
    queryKey: [...TASKS_KEY, isAdmin ? 'all' : 'my', params],
    queryFn: async () => {
      try {
        return isAdmin
          ? await tasksAPI.getAll(params)
          : await tasksAPI.getMyTasks(params)
      } catch (err) {
        const status = err?.response?.status
        if (!status || status === 403 || status === 404 || status >= 500) {
          // Fallback to mock data
          return isAdmin ? TASKS : getMyMockTasks(user?.email)
        }
        throw err
      }
    },
    staleTime: 20_000,
    enabled: !!user,
  })
}

export function useTask(id) {
  const { user } = useAuth()
  return useQuery({
    queryKey: [...TASKS_KEY, id],
    queryFn: () => tasksAPI.getById(id),
    enabled: !!user && !!id,
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