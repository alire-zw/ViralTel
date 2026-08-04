import { apiFetch } from './api'
import type { UserMeResponse } from '../types/user'

export type ClubSyncResponse = {
  user: UserMeResponse['user']
  clubPoints: number
  totalPurchaseToman: number
  pointsPerUnit: number
  unitToman: number
}

export function syncClubPoints() {
  return apiFetch<ClubSyncResponse>('/api/club/sync', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function fetchClubPoints() {
  return apiFetch<{ clubPoints: number; user: UserMeResponse['user'] }>('/api/club/me')
}
