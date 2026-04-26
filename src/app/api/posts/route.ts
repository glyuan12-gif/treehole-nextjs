export const runtime = 'edge'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { posts, users, getUserPublicInfo } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

const createPostSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题最多100个字符'),
  content: z.string().min(1, '内容不能为空').max(5000, '内容最多5000个字符'),
  channel: z.enum(['campus', 'work', 'emotion', 'life', 'treehole']),
  mood: z.string().default(''),
  tags: z.array(z.string()).default([]),
  image: z.string().default(''),
  showVeinId: z.boolean().default(false),
})

// GET /api/posts - 获取帖子列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel') || undefined
    const tag = searchParams.get('tag') || undefined
    const sort = searchParams.get('sort') || 'latest'
    const mbti = searchParams.get('mbti') || undefined
    const search = searchParams.get('search') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    let filtered = posts.getAll().filter(p => p.auditStatus === 'approved')

    if (channel) {
      filtered = filtered.filter(p => p.channel === channel)
    }
    if (search) {
      const lowerSearch = search.toLowerCase()
      filtered = filtered.filter(
        p => p.title.toLowerCase().includes(lowerSearch) || p.content.toLowerCase().includes(lowerSearch)
      )
    }
    if (mbti) {
      // 按 mbti 过滤需要关联 author
      const allUsers = users.getAll()
      const userIdsWithMbti = new Set(allUsers.filter(u => u.mbti === mbti).map(u => u.id))
      filtered = filtered.filter(p => userIdsWithMbti.has(p.authorId))
    }
    if (tag) {
      filtered = filtered.filter(p => {
        try {
          const tags = JSON.parse(p.tags)
          return Array.isArray(tags) && tags.includes(tag)
        } catch {
          return false
        }
      })
    }

    // 排序
    if (sort === 'hot') {
      filtered.sort((a, b) => b.likeCount - a.likeCount)
    } else {
      filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }

    const total = filtered.length
    const paged = filtered.slice((page - 1) * limit, page * limit)

    // 填充 author 信息
    const postsWithAuthor = paged.map(post => {
      const author = getUserPublicInfo(post.authorId)
      return {
        ...post,
        author: author || {
          veinId: 'unknown',
          nickname: '未知用户',
          avatarStyle: 'emoji',
          avatarEmoji: '😊',
          avatarColor: '#999',
          mbti: '',
        },
      }
    })

    return NextResponse.json({ posts: postsWithAuthor, total })
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    return NextResponse.json(
      { error: '获取帖子列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/posts - 创建帖子
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const data = createPostSchema.parse(body)

    const post = posts.create({
      title: data.title,
      content: data.content,
      channel: data.channel,
      mood: data.mood,
      tags: JSON.stringify(data.tags),
      image: data.image,
      showVeinId: data.showVeinId,
      auditStatus: 'approved',
      likeCount: 0,
      commentCount: 0,
      authorId: user.id,
    })

    const author = getUserPublicInfo(user.id)

    return NextResponse.json({
      ...post,
      author: author || {
        veinId: user.veinId,
        nickname: user.nickname,
        avatarStyle: user.avatarStyle,
        avatarEmoji: user.avatarEmoji,
        avatarColor: user.avatarColor,
        mbti: user.mbti,
      },
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      )
    }
    console.error('创建帖子失败:', error)
    return NextResponse.json(
      { error: '创建帖子失败' },
      { status: 500 }
    )
  }
}
