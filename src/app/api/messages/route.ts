export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { users, messages, getUserBasicInfo, getUserPublicInfo } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

const sendMessageSchema = z.object({
  receiverVeinId: z.string().min(1, '接收者叶脉号不能为空'),
  content: z.string().min(1, '消息内容不能为空').max(2000, '消息最多2000个字符'),
})

// GET /api/messages - 获取会话列表
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取与当前用户相关的所有消息，按时间倒序
    const userMessages = (await messages.findByUser(user.id)).sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt)
    )

    // 按对话方分组，取最新一条消息
    const conversationMap = new Map<string, (typeof userMessages)[0]>()
    for (const msg of userMessages) {
      const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId
      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, msg)
      }
    }

    const conversations = await Promise.all(Array.from(conversationMap.values()).map(async (msg) => {
      const isSender = msg.senderId === user.id
      const otherId = isSender ? msg.receiverId : msg.senderId
      const otherPublicInfo = await getUserPublicInfo(otherId)
      const otherBasicInfo = await getUserBasicInfo(otherId)
      const other = (otherBasicInfo ? { ...otherBasicInfo, mbti: otherPublicInfo?.mbti || '' } : null) || {
        id: otherId,
        veinId: 'unknown',
        nickname: '未知用户',
        avatarStyle: 'emoji',
        avatarEmoji: '😊',
        avatarColor: '#999',
        mbti: '',
      }
      return {
        conversationId: other.id,
        other,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        isSender,
      }
    }))

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('获取会话列表失败:', error)
    return NextResponse.json(
      { error: '获取会话列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/messages - 发送私信
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { receiverVeinId, content } = sendMessageSchema.parse(body)

    const receiver = await users.findByVeinId(receiverVeinId)

    if (!receiver) {
      return NextResponse.json(
        { error: '接收者不存在' },
        { status: 404 }
      )
    }

    if (receiver.id === user.id) {
      return NextResponse.json(
        { error: '不能给自己发私信' },
        { status: 400 }
      )
    }

    const message = await messages.create({
      content,
      senderId: user.id,
      receiverId: receiver.id,
    })

    const senderInfo = await getUserBasicInfo(user.id)
    const receiverInfo = await getUserBasicInfo(receiver.id)

    return NextResponse.json({
      ...message,
      sender: senderInfo || {
        id: user.id,
        veinId: user.veinId,
        nickname: user.nickname,
        avatarStyle: user.avatarStyle,
        avatarEmoji: user.avatarEmoji,
        avatarColor: user.avatarColor,
      },
      receiver: receiverInfo || {
        id: receiver.id,
        veinId: receiver.veinId,
        nickname: receiver.nickname,
        avatarStyle: receiver.avatarStyle,
        avatarEmoji: receiver.avatarEmoji,
        avatarColor: receiver.avatarColor,
      },
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      )
    }
    console.error('发送私信失败:', error)
    return NextResponse.json(
      { error: '发送私信失败' },
      { status: 500 }
    )
  }
}
