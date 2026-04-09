import db from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/session'

type TokenPayload = {
  id: number
  email: string
  role?: string
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return Response.json({ message: '로그인이 필요합니다.' }, { status: 401 })
    }

    const payload = (await verifyToken(token)) as TokenPayload

    if (!payload?.id) {
      return Response.json({ message: '유효하지 않은 사용자입니다.' }, { status: 401 })
    }

    const result = await db.query(
      `
      SELECT
        q.id,
        q.title,
        q.content,
        q.status,
        q.created_at,
        u.nickname
      FROM questions q
      JOIN users u ON q.user_id = u.id
      WHERE q.user_id = $1
      ORDER BY q.id DESC
      `,
      [payload.id]
    )

    return Response.json(result.rows)
  } catch (error) {
    console.error('내 질문 목록 조회 오류:', error)
    return Response.json({ message: '내 질문 목록 조회 실패' }, { status: 500 })
  }
}