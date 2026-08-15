import type { CSSProperties } from 'react'
import type { KycProduct } from '../types/kycFlow'

export type KycThemeTokens = {
  accent: string
  accentSoft: string
  accentDeep: string
  accentText: string
}

export const KYC_PRODUCT_THEMES: Record<KycProduct, KycThemeTokens> = {
  stars: {
    accent: '#ffb922',
    accentSoft: '#ffd166',
    accentDeep: '#f59e0b',
    accentText: '#d97706',
  },
  premium: {
    accent: '#925cff',
    accentSoft: '#b794ff',
    accentDeep: '#7c3aed',
    accentText: '#7c3aed',
  },
  'virtual-number': {
    accent: '#10b981',
    accentSoft: '#34d399',
    accentDeep: '#059669',
    accentText: '#059669',
  },
  reaction: {
    accent: '#f43f5e',
    accentSoft: '#fb7185',
    accentDeep: '#e11d48',
    accentText: '#e11d48',
  },
  'channel-views': {
    accent: '#0ea5e9',
    accentSoft: '#38bdf8',
    accentDeep: '#0284c7',
    accentText: '#0284c7',
  },
  'telegram-members': {
    accent: '#229ed9',
    accentSoft: '#4db6e8',
    accentDeep: '#0088cc',
    accentText: '#0088cc',
  },
  'account-shop': {
    accent: '#10a37f',
    accentSoft: '#34d399',
    accentDeep: '#059669',
    accentText: '#059669',
  },
  'wallet-charge': {
    accent: '#6366f1',
    accentSoft: '#818cf8',
    accentDeep: '#4f46e5',
    accentText: '#4f46e5',
  },
}

export function getKycThemeStyle(product: KycProduct): CSSProperties {
  const theme = KYC_PRODUCT_THEMES[product]
  return {
    '--accent': theme.accent,
    '--accent-contrast': '#ffffff',
    '--kyc-accent-soft': theme.accentSoft,
    '--kyc-accent-deep': theme.accentDeep,
    '--kyc-accent-text': theme.accentText,
    accentColor: theme.accent,
    caretColor: theme.accent,
  } as CSSProperties
}
