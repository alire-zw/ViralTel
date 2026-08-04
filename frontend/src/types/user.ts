export type UserRole = 'user' | 'admin' | 'supervisor'

export interface AppUser {
  id: number
  telegramId: string
  username: string | null
  firstName: string | null
  lastName: string | null
  realName: string | null
  phoneNumber: string | null
  phoneVerifiedAt: string | null
  nationalId: string | null
  birthDate: string | null
  termsAcceptedAt: string | null
  shahkarMatchedAt: string | null
  kycVerifiedAt: string | null
  email: string | null
  balance: string
  clubPoints: number
  role: UserRole
  canAccessAdminPanel: boolean
  isPremium: boolean
  isBanned: boolean
  isActive: boolean
  languageCode: string | null
  createdAt: string
  updatedAt: string
}

export interface UserMeResponse {
  user: AppUser
}
