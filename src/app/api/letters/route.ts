export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { users, letters, getUserBasicInfo } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

const letterSchema = z.object({
  content: z.string().min(1, '信件内容不能为空').max(5000, '信件最多5000个字符'),
  receiverVeinId: z.string().optional(),
  openDate: z.string().optional(), // ISO date string
  isSelf: z.boolean().default(true),
})

// GET /api/letters - 获取信件列表
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userLetters = letters.findByUser(user.id)

    const lettersWithUsers = userLetters.map(letter => {
      const senderInfo = getUserBasicInfo(letter.senderId)
      const receiverInfo = letter.receiverId ? getUserBasicInfo(letter.receiverId) : null
      return {
        ...letter,
        sender: senderInfo || {
          veinId: 'unknown',
          nickname: '未知用户',
          avatarStyle: 'emoji',
          avatarEmoji: '😊',
          avatarColor: '#999',
        },
        receiver: receiverInfo || null,
      }
    })

    return NextResponse.json(lettersWithUsers)
  } catch (error) {
    console.error('获取信件列表失败:', error)
    return NextResponse.json(
      { error: '获取信件列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/letters - 创建信件
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const data = letterSchema.parse(body)

    let receiverId: string | null = null

    if (!data.isSelf && data.receiverVeinId) {
      const receiver = users.findByVeinId(data.receiverVeinId)
      if (!receiver) {
        return NextResponse.json(
          { error: '接收者不存在' },
          { status: 404 }
        )
      }
      receiverId = receiver.id
    }

    const letter = letters.create({
      content: data.content,
      openDate: data.openDate || null,
      isSelf: data.isSelf,
      senderId: user.id,
      receiverId,
      isOpened: false,
    })

    return NextResponse.json(letter, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      )
    }
    console.error('创建信件失败:', error)
    return NextResponse.json(
      { error: '创建信件失败' },
      { status: 500 }
    )
  }
}
