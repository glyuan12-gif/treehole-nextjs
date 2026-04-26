export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { posts, postLikes } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// POST /api/posts/:id/like - 点赞/取消点赞
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

    // 检查是否已点赞
    const existingLike = postLikes.findUnique(postId, user.id)

    if (existingLike) {
      // 取消点赞
      postLikes.delete(existingLike.id)
      posts.update(postId, { likeCount: Math.max(0, post.likeCount - 1) })
      return NextResponse.json({ liked: false })
    } else {
      // 点赞
      postLikes.create({
        postId,
        userId: user.id,
      })
      posts.update(postId, { likeCount: post.likeCount + 1 })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    return NextResponse.json(
      { error: '点赞操作失败' },
      { status: 500 }
    )
  }
}
