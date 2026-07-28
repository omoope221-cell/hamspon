import { api } from './client';

// Builds the standard { getAll, getOne, create, update, remove } set for a
// REST resource mounted at `basePath`.
export function makeResource(basePath) {
  return {
    getAll: (params) => api.get(basePath, params),
    getOne: (id) => api.get(`${basePath}/${id}`),
    create: (body) => api.post(basePath, body),
    update: (id, body) => api.patch(`${basePath}/${id}`, body),
    remove: (id) => api.delete(`${basePath}/${id}`),
  };
}
