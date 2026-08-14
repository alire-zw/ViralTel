import { apiFetch } from './api'

export type ChannelLockSlot = 'purchase_report' | 'notification'

export type ChannelLockItem = {
  slotKey: ChannelLockSlot
  label: string
  title: string
  username: string
  url: string
  joined: boolean
}

export type ChannelLockStatus = {
  required: boolean
  bypassed: boolean
  channels: ChannelLockItem[]
}

export function fetchChannelLockStatus() {
  return apiFetch<ChannelLockStatus>('/api/channel-lock/status')
}

export function checkChannelLockMembership(slotKey: ChannelLockSlot) {
  return apiFetch<{ channel: ChannelLockItem }>(
    `/api/channel-lock/check/${encodeURIComponent(slotKey)}`,
  )
}
