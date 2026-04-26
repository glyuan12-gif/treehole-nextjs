export const runtime = 'edge'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { posts, getUserPublicInfo } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/posts/:id - 获取帖子详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = posts.findById(id)

    if (!post) {
      return NextResponse.json(
        { error: '帖子不存在' },
        { status: 404 }
      )
    }

    const author = getUserPublicInfo(post.authorId)

    return NextResponse.json({
      ...post,
      author: author || {
        veinId: 'unknown',
        nickname: '未知用户',
        avatarStyle: 'emoji',
        avatarEmoji: '😊',
        avatarColor: '#999',
        mbti: '',
      },
    })
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    return NextResponse.json(
      { error: '获取帖子详情失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/:id - 删除帖子
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

    const post = posts.findById(id)

    if (!post) {
      return NextResponse.json(
        { error: '帖子不存在' },
        { status: 404 }
      )
    }

    if (post.authorId !== user.id) {
      return NextResponse.json(
        { error: '只能删除自己的帖子' },
        { status: 403 }
      )
    }

    posts.delete(id)

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除帖子失败:', error)
    return NextResponse.json(
      { error: '删除帖子失败' },
      { status: 500 }
    )
  }
}
