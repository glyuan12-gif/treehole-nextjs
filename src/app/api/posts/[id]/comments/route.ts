export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { posts, comments, getUserBasicInfo } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

const commentSchema = z.object({
  content: z.string().min(1, '评论内容不能为空').max(1000, '评论最多1000个字符'),
})

// GET /api/posts/:id/comments - 获取评论列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    const postComments = comments.findByPostId(postId).sort(
      (a, b) => a.createdAt.localeCompare(b.createdAt)
    )

    const commentsWithAuthor = postComments.map(comment => {
      const author = getUserBasicInfo(comment.authorId)
      return {
        ...comment,
        author: author || {
          id: 'unknown',
          veinId: 'unknown',
          nickname: '未知用户',
          avatarStyle: 'emoji',
          avatarEmoji: '😊',
          avatarColor: '#999',
        },
      }
    })

    return NextResponse.json(commentsWithAuthor)
  } catch (error) {
    console.error('获取评论失败:', error)
    return NextResponse.json(
      { error: '获取评论失败' },
      { status: 500 }
    )
  }
}

// POST /api/posts/:id/comments - 发表评论
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
    const { content } = commentSchema.parse(body)

    const comment = comments.create({
      content,
      postId,
      authorId: user.id,
    })

    // 更新帖子评论数
    posts.update(postId, { commentCount: post.commentCount + 1 })

    const author = getUserBasicInfo(user.id)

    return NextResponse.json({
      ...comment,
      author: author || {
        id: user.id,
        veinId: user.veinId,
        nickname: user.nickname,
        avatarStyle: user.avatarStyle,
        avatarEmoji: user.avatarEmoji,
        avatarColor: user.avatarColor,
      },
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      )
    }
    console.error('发表评论失败:', error)
    return NextResponse.json(
      { error: '发表评论失败' },
      { status: 500 }
    )
  }
}
