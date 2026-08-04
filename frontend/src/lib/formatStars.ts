export function formatStars(stars: number): string {
  if (stars >= 1_000_000) {
    const millions = (stars / 1_000_000).toFixed(1).replace('.0', '')
    return `${millions} میلیون`
  }

  if (stars >= 1_000) {
    const thousands = (stars / 1_000).toFixed(1).replace('.0', '')
    return `${thousands} هزار`
  }

  return stars.toLocaleString('fa-IR')
}

export function roundDisplayTomanUp(toman: number): number {
  if (!Number.isFinite(toman) || toman <= 0) {
    return 0
  }

  const value = Math.ceil(toman)

  if (value >= 10_000) {
    return Math.ceil(value / 1_000) * 1_000
  }

  return Math.ceil(value / 100) * 100
}

export function formatTomanPrice(toman: number): string {
  const rounded = roundDisplayTomanUp(toman)
  if (rounded <= 0) {
    return '...'
  }

  return rounded.toLocaleString('fa-IR')
}
