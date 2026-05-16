import client from './client'

export const tasksAPI = {
  getAll:        (params = {}) => client.get('/tasks/',          { params }),
  getById:       (id)          => client.get(`/tasks/${id}`),
  getMyTasks:    ()            => client.get('/tasks/my'),
  create:        (data)        => client.post('/tasks/',          data),
  update:        (id, data)    => client.put(`/tasks/${id}`,     data),
  updateStatus:  (id, status)  => client.patch(`/tasks/${id}/status`, { status }),
  delete:        (id)          => client.delete(`/tasks/${id}`),
}