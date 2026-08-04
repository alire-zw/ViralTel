/** Matches backend MIN_PAYMENT_TOMAN for Zibal gateway. */
export const MIN_GATEWAY_TOMAN = 1000

export function resolveWalletGatewaySplit(
  toman: number,
  balance: number,
  useWallet: boolean,
): { walletAmount: number; gatewayAmount: number } {
  if (!useWallet || balance <= 0) {
    return { walletAmount: 0, gatewayAmount: toman }
  }

  let walletAmount = Math.min(balance, toman)
  let gatewayAmount = toman - walletAmount

  if (gatewayAmount > 0 && gatewayAmount < MIN_GATEWAY_TOMAN) {
    if (toman >= MIN_GATEWAY_TOMAN) {
      walletAmount = Math.min(balance, toman - MIN_GATEWAY_TOMAN)
      gatewayAmount = toman - walletAmount
    }

    if (gatewayAmount > 0 && gatewayAmount < MIN_GATEWAY_TOMAN) {
      walletAmount = 0
      gatewayAmount = toman
    }
  }

  return { walletAmount, gatewayAmount }
}
