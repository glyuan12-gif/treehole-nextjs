export const runtime = 'edge'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { posts, reactions } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

const reactionSchema = z.object({
  type: z.enum(['touched', 'empathy', 'resonate', 'agree', 'think', 'warm']),
})

// POST /api/posts/:id/reactions - 添加/移除情绪反应
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id: postId } = await params

    const post = posts.findById(postId)

    if (!post) {
      return NextResponse.json(
        { error: '帖子不存在' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { type } = reactionSchema.parse(body)

    // 检查是否已有该类型的反应
    const existingReaction = reactions.findUnique(postId, user.id, type)

    if (existingReaction) {
      // 移除反应
      reactions.delete(existingReaction.id)
      return NextResponse.json({ reacted: false, type })
    } else {
      // 添加反应
      reactions.create({
        postId,
        userId: user.id,
        type,
      })
      return NextResponse.json({ reacted: true, type })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      )
    }
    console.error('情绪反应操作失败:', error)
    return NextResponse.json(
      { error: '情绪反应操作失败' },
      { status: 500 }
    )
  }
}
