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
      ORDER BY q.id DESC
      `
    )

    return Response.json(result.rows)
  } catch (error) {
    console.error('질문 목록 조회 오류:', error)
    return Response.json({ message: '질문 목록 조회 실패' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('token')?.value

    if (!token) {
      return Response.json({ message: '로그인이 필요합니다.' }, { status: 401 })
    }

    const payload = (await verifyToken(token)) as TokenPayload
    const userId = payload.id

    const { title, content } = await req.json()

    if (!title || !content) {
      return Response.json({ message: '제목과 내용을 입력해주세요.' }, { status: 400 })
    }

    await db.query(
      `
      INSERT INTO questions (user_id, title, content)
      VALUES ($1, $2, $3)
      `,
      [userId, title, content]
    )

    return Response.json({ message: '질문 등록 성공' })
  } catch (error) {
    console.error('질문 등록 오류:', error)
    return Response.json({ message: '질문 등록 실패' }, { status: 500 })
  }
}