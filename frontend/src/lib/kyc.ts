import type { AppUser } from '../types/user'

export function isUserKycVerified(user: AppUser | null | undefined): boolean {
  return Boolean(user?.kycVerifiedAt)
}

export function hasVerifiedPhone(user: AppUser | null | undefined): boolean {
  return Boolean(user?.phoneVerifiedAt && user.phoneNumber)
}

export function hasKycIdentity(user: AppUser | null | undefined): boolean {
  return Boolean(user?.nationalId && user.birthDate)
}

export function hasAcceptedKycTerms(user: AppUser | null | undefined): boolean {
  return Boolean(user?.termsAcceptedAt)
}

export type StarsKycPath =
  | '/stars/kyc/phone'
  | '/stars/kyc/otp'
  | '/stars/kyc/identity'
  | '/stars/kyc/card'
  | '/stars/kyc/terms'
  | '/stars/kyc/review'

/** Next KYC route after payment confirm, or null if KYC is complete. */
export function getStarsKycNextPath(
  user: AppUser | null | undefined,
): Exclude<StarsKycPath, '/stars/kyc/otp'> | null {
  if (isUserKycVerified(user)) return null
  if (!hasVerifiedPhone(user)) return '/stars/kyc/phone'
  if (!hasKycIdentity(user)) return '/stars/kyc/identity'
  if (!hasAcceptedKycTerms(user)) return '/stars/kyc/card'
  return '/stars/kyc/review'
}

export const getKycNextPath = getStarsKycNextPath
