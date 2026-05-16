import client from './client'

export const contributorsAPI = {
  getAll:  (params = {})      => client.get('/contributors/',          { params }),
  getById: (id)               => client.get(`/contributors/${id}`),
  create:  (data)             => client.post('/contributors/',          data),
  update:  (id, data)         => client.put(`/contributors/${id}`,     data),
  delete:  (id)               => client.delete(`/contributors/${id}`),
  getStats:(id)               => client.get(`/contributors/${id}/stats`),
}