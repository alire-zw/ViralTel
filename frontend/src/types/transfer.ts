export interface TransferRecipient {
  telegramId: number
  firstName?: string
  lastName?: string
  username?: string
  phoneNumber?: string
}

export interface WalletTransferRecipientState {
  amount: number
  recipient?: TransferRecipient
}

export interface WalletTransferConfirmState {
  amount: number
  recipient: TransferRecipient
}

export interface TransferResult {
  transferId: string
  amountToman: string
  recipient: TransferRecipient
  balanceAfter: string
  createdAt: string
}

export interface ContactPickerSession {
  preparedButtonId: string
  requestId: number
}
