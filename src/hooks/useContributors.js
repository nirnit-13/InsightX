import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contributorsAPI } from '../services/api/contributorsAPI'
import toast from 'react-hot-toast'

export const CONTRIBUTORS_KEY = ['contributors']

export function useContributors(params = {}) {
  return useQuery({
    queryKey: [...CONTRIBUTORS_KEY, params],
    queryFn:  () => contributorsAPI.getAll(params),
    staleTime: 30_000,
  })
}

export function useContributor(id) {
  return useQuery({
    queryKey: [...CONTRIBUTORS_KEY, id],
    queryFn:  () => contributorsAPI.getById(id),
    enabled:  !!id,
  })
}

export function useCreateContributor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: contributorsAPI.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTRIBUTORS_KEY })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Contributor added successfully')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to add contributor'),
  })
}

export function useUpdateContributor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => contributorsAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTRIBUTORS_KEY })
      toast.success('Contributor updated')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Update failed'),
  })
}

export function useDeleteContributor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: contributorsAPI.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTRIBUTORS_KEY })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Contributor removed')
    },
    onError: () => toast.error('Delete failed'),
  })
}