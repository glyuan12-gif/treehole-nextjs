export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { posts, reports } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

const reportSchema = z.object({
  postId: z.string().optional(),
  reason: z.string().min(1, '举报原因不能为空'),
  detail: z.string().default(''),
})

// POST /api/reports - 提交举报
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const data = reportSchema.parse(body)

    // 如果举报的是帖子，检查帖子是否存在
    if (data.postId) {
      const post = posts.findById(data.postId)
      if (!post) {
        return NextResponse.json(
          { error: '帖子不存在' },
          { status: 404 }
        )
      }
    }

    const report = reports.create({
      postId: data.postId || null,
      reason: data.reason,
      detail: data.detail,
      reporterId: user.id,
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      )
    }
    console.error('提交举报失败:', error)
    return NextResponse.json(
      { error: '提交举报失败' },
      { status: 500 }
    )
  }
}
