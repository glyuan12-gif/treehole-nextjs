export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { letters, getUserBasicInfo } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/letters/:id - 查看信件
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params

    const letter = await letters.findById(id)

    if (!letter) {
      return NextResponse.json(
        { error: '信件不存在' },
        { status: 404 }
      )
    }

    // 检查权限：只有发送者或接收者可以查看
    if (letter.senderId !== user.id && letter.receiverId !== user.id) {
      return NextResponse.json(
        { error: '无权查看此信件' },
        { status: 403 }
      )
    }

    // 检查封存信件是否已到期
    if (letter.openDate && new Date() < new Date(letter.openDate)) {
      return NextResponse.json({
        id: letter.id,
        isSelf: letter.isSelf,
        openDate: letter.openDate,
        isOpened: letter.isOpened,
        createdAt: letter.createdAt,
        content: null, // 未到期，不返回内容
        message: '信件尚未到期，无法查看',
      })
    }

    // 如果信件已到期且未标记为已读，标记为已读
    if (!letter.isOpened && letter.openDate) {
      await letters.update(id, { isOpened: true })
      letter.isOpened = true
    }

    const senderInfo = await getUserBasicInfo(letter.senderId)
    const receiverInfo = letter.receiverId ? await getUserBasicInfo(letter.receiverId) : null

    return NextResponse.json({
      ...letter,
      sender: senderInfo || {
        veinId: 'unknown',
        nickname: '未知用户',
        avatarStyle: 'emoji',
        avatarEmoji: '😊',
        avatarColor: '#999',
      },
      receiver: receiverInfo || null,
    })
  } catch (error) {
    console.error('查看信件失败:', error)
    return NextResponse.json(
      { error: '查看信件失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/letters/:id - 删除信件
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params

    const letter = await letters.findById(id)

    if (!letter) {
      return NextResponse.json(
        { error: '信件不存在' },
        { status: 404 }
      )
    }

    // 只有发送者可以删除信件
    if (letter.senderId !== user.id) {
      return NextResponse.json(
        { error: '只能删除自己发送的信件' },
        { status: 403 }
      )
    }

    await letters.delete(id)

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除信件失败:', error)
    return NextResponse.json(
      { error: '删除信件失败' },
      { status: 500 }
    )
  }
}
