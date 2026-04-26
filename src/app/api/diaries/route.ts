export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { diaries } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

const diarySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD'),
  content: z.string().min(1, '日记内容不能为空').max(10000, '日记最多10000个字符'),
  mood: z.string().default(''),
  isPublic: z.boolean().default(false),
})

// GET /api/diaries - 获取日记列表
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userDiaries = diaries.findByAuthorId(user.id)

    return NextResponse.json(userDiaries)
  } catch (error) {
    console.error('获取日记列表失败:', error)
    return NextResponse.json(
      { error: '获取日记列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/diaries - 创建/更新日记
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const data = diarySchema.parse(body)

    // 检查该日期是否已有日记
    const existingDiary = diaries.findByAuthorAndDate(user.id, data.date)

    let diary
    if (existingDiary) {
      // 更新已有日记
      diary = diaries.update(existingDiary.id, {
        content: data.content,
        mood: data.mood,
        isPublic: data.isPublic,
      })
    } else {
      // 创建新日记
      diary = diaries.create({
        date: data.date,
        content: data.content,
        mood: data.mood,
        isPublic: data.isPublic,
        authorId: user.id,
      })
    }

    return NextResponse.json(diary, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      )
    }
    console.error('保存日记失败:', error)
    return NextResponse.json(
      { error: '保存日记失败' },
      { status: 500 }
    )
  }
}
