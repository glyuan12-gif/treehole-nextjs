// Edge Runtime 兼容的密码工具
// 由于是匿名社交平台，不需要密码功能
// 保留接口以避免破坏其他代码

export async function hashPassword(password: string): Promise<string> {
  // 在 Edge Runtime 中不使用 bcrypt，直接返回简单哈希
  const encoder = new TextEncoder()
  const data = encoder.encode(password + '-treehole-salt')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(password)
  return hashed === hash
}
