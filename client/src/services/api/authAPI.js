import client from './client'

export const authAPI = {
  login:  (email, password)              => client.post('/auth/login',  { email, password }),
  signup: (name, email, password, role)  => client.post('/auth/signup', { name, email, password, role }),
  me:     ()                             => client.get('/auth/me'),
}