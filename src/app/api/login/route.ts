export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { users } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { verifyPassword } from '@/lib/password'

const loginSchema = z.object({
  veinId: z.string().min(1, '叶脉号不能为空'),
  password: z.string().min(1, '密码不能为空'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { veinId, password } = loginSchema.parse(body)

    const user = await users.findByVeinId(veinId)

    if (!user) {
      return NextResponse.json(
        { error: '未找到该叶脉号对应的用户' },
        { status: 404 }
      )
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: '该账号未设置密码，请重新注册' },
        { status: 400 }
      )
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      )
    }

    const token = await signToken({ userId: user.id, veinId: user.veinId })

    return NextResponse.json({
      userId: user.id,
      veinId: user.veinId,
      token,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      )
    }
    console.error('登录失败:', error)
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}
