export const runtime = 'edge'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { messages, getUserBasicInfo } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/messages/:conversationId - 获取与某用户的聊天记录
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { conversationId } = await params

    const conversationMessages = messages.findBetween(user.id, conversationId).sort(
      (a, b) => a.createdAt.localeCompare(b.createdAt)
    )

    const messagesWithUsers = conversationMessages.map(msg => {
      const senderInfo = getUserBasicInfo(msg.senderId)
      const receiverInfo = getUserBasicInfo(msg.receiverId)
      return {
        ...msg,
        sender: senderInfo || {
          id: msg.senderId,
          veinId: 'unknown',
          nickname: '未知用户',
          avatarStyle: 'emoji',
          avatarEmoji: '😊',
          avatarColor: '#999',
        },
        receiver: receiverInfo || {
          id: msg.receiverId,
          veinId: 'unknown',
          nickname: '未知用户',
          avatarStyle: 'emoji',
          avatarEmoji: '😊',
          avatarColor: '#999',
        },
      }
    })

    return NextResponse.json(messagesWithUsers)
  } catch (error) {
    console.error('获取聊天记录失败:', error)
    return NextResponse.json(
      { error: '获取聊天记录失败' },
      { status: 500 }
    )
  }
}
