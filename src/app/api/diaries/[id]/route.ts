export const runtime = 'edge'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { diaries } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// DELETE /api/diaries/:id - 删除日记
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

    const diary = diaries.findById(id)

    if (!diary) {
      return NextResponse.json(
        { error: '日记不存在' },
        { status: 404 }
      )
    }

    if (diary.authorId !== user.id) {
      return NextResponse.json(
        { error: '只能删除自己的日记' },
        { status: 403 }
      )
    }

    diaries.delete(id)

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除日记失败:', error)
    return NextResponse.json(
      { error: '删除日记失败' },
      { status: 500 }
    )
  }
}
