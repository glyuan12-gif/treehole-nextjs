export const runtime = 'edge'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { users } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ veinId: string }> }
) {
  try {
    const { veinId } = await params

    const user = users.findByVeinId(veinId)

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      nickname: user.nickname,
      role: user.role,
      mbti: user.mbti,
      avatarStyle: user.avatarStyle,
      avatarEmoji: user.avatarEmoji,
      avatarColor: user.avatarColor,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    )
  }
}
