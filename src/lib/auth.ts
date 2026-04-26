import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'
import { users } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'treehole-dev-secret-key-2024'

function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET)
}

export async function signToken(payload: { userId: string; veinId: string }): Promise<string> {
  const secret = getSecretKey()
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<{ userId: string; veinId: string } | null> {
  try {
    const secret = getSecretKey()
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as { userId: string; veinId: string }
  } catch {
    return null
  }
}

export async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  const payload = await verifyToken(token)
  if (!payload) {
    return null
  }

  const user = users.findById(payload.userId)

  return user
}
