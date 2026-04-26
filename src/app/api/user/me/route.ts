export const runtime = 'edge'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { users } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id,
      veinId: user.veinId,
      nickname: user.nickname,
      role: user.role,
      mbti: user.mbti,
      avatarStyle: user.avatarStyle,
      avatarEmoji: user.avatarEmoji,
      avatarColor: user.avatarColor,
      allowFind: user.allowFind,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } catch (error) {
    console.error('获取当前用户信息失败:', error)
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { nickname, role, mbti, avatarStyle, avatarEmoji, avatarColor, allowFind } = body

    const updateData: Record<string, unknown> = {}
    if (nickname !== undefined) updateData.nickname = nickname
    if (role !== undefined) updateData.role = role
    if (mbti !== undefined) updateData.mbti = mbti
    if (avatarStyle !== undefined) updateData.avatarStyle = avatarStyle
    if (avatarEmoji !== undefined) updateData.avatarEmoji = avatarEmoji
    if (avatarColor !== undefined) updateData.avatarColor = avatarColor
    if (allowFind !== undefined) updateData.allowFind = allowFind

    const updatedUser = users.update(user.id, updateData)

    if (!updatedUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: updatedUser.id,
      veinId: updatedUser.veinId,
      nickname: updatedUser.nickname,
      role: updatedUser.role,
      mbti: updatedUser.mbti,
      avatarStyle: updatedUser.avatarStyle,
      avatarEmoji: updatedUser.avatarEmoji,
      avatarColor: updatedUser.avatarColor,
      allowFind: updatedUser.allowFind,
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return NextResponse.json(
      { error: '更新用户信息失败' },
      { status: 500 }
    )
  }
}
