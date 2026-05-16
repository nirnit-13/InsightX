import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksAPI } from '../services/api/tasksAPI'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export const TASKS_KEY = ['tasks']

export function useTasks(params = {}) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: [...TASKS_KEY, params],
    queryFn:  () => isAdmin ? tasksAPI.getAll(params) : tasksAPI.getMyTasks(),
    staleTime: 20_000,
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