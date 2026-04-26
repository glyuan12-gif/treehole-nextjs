export const runtime = 'edge'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { users } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { hashPassword } from '@/lib/password'

const registerSchema = z.object({
  veinId: z.string().min(4, '叶脉号至少4个字符').max(20, '叶脉号最多20个字符'),
  password: z.string().min(6, '密码至少6个字符').max(50, '密码最多50个字符'),
  nickname: z.string().min(1, '昵称不能为空').max(20, '昵称最多20个字符'),
  role: z.enum(['student', 'worker', 'freelancer', 'other']).default('other'),
  mbti: z.string().max(4).default(''),
  avatarStyle: z.string().default('emoji'),
  avatarEmoji: z.string().default('😊'),
  avatarColor: z.string().default('#5b8c6e'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // 检查 veinId 是否已被占用
    if (users.findByVeinId(data.veinId)) {
      return NextResponse.json(
        { error: '该叶脉号已被占用，请换一个' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(data.password)

    const user = users.create({
      veinId: data.veinId,
      passwordHash,
      nickname: data.nickname,
      role: data.role,
      mbti: data.mbti,
      avatarStyle: data.avatarStyle,
      avatarEmoji: data.avatarEmoji,
      avatarColor: data.avatarColor,
      allowFind: false,
    })

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
    console.error('注册失败:', error)
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}
