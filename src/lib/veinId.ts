const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

export function generateVeinId(): string {
  const segment1 = Array.from({ length: 4 }, randomChar).join('')
  const segment2 = Array.from({ length: 4 }, randomChar).join('')
  return `VEIN-${segment1}-${segment2}`
}
