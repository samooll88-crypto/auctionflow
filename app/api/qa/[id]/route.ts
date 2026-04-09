import db from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/session'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'

interface QuestionDetailRow extends RowDataPacket {
  id: number
  title: string
  content: string
  status: string
  created_at: string
  nickname: string
}

interface AnswerRow extends RowDataPacket {
  id: number
  content: string
  created_at: string
  nickname: string
}

type TokenPayload = {
  id: number
  email: string
  role?: string
}

const ADMIN_EMAIL = 'samooll@naver.com'

async function getAdminUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return null

  const payload = (await verifyToken(token)) as TokenPayload

  if (!payload?.email || payload.email !== ADMIN_EMAIL) {
    return null
  }

  return payload
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const [questions] = await db.query<QuestionDetailRow[]>(
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
      WHERE q.id = ?
      `,
      [id]
    )

    if (questions.length === 0) {
      return Response.json({ message: '질문을 찾을 수 없습니다.' }, { status: 404 })
    }

    const [answers] = await db.query<AnswerRow[]>(
      `
      SELECT
        a.id,
        a.content,
        a.created_at,
        u.nickname
      FROM answers a
      JOIN users u ON a.user_id = u.id
      WHERE a.question_id = ?
      ORDER BY a.id ASC
      `,
      [id]
    )

    return Response.json({
      question: questions[0],
      answers,
    })
  } catch (error) {
    console.error('질문 상세 조회 오류:', error)
    return Response.json({ message: '질문 상세 조회 실패' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUser()

    if (!adminUser) {
      return Response.json(
        { message: '운영자만 질문을 수정할 수 있습니다.' },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const { title, content, status } = await req.json()

    if (!title?.trim() || !content?.trim()) {
      return Response.json(
        { message: '제목과 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    await db.query<ResultSetHeader>(
      `
      UPDATE questions
      SET title = ?, content = ?, status = ?
      WHERE id = ?
      `,
      [title.trim(), content.trim(), status?.trim() || '답변대기', id]
    )

    return Response.json({ message: '질문이 수정되었습니다.' })
  } catch (error) {
    console.error('질문 수정 오류:', error)
    return Response.json({ message: '질문 수정 실패' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUser()

    if (!adminUser) {
      return Response.json(
        { message: '운영자만 질문을 삭제할 수 있습니다.' },
        { status: 403 }
      )
    }

    const { id } = await context.params

    await db.query<ResultSetHeader>(
      `DELETE FROM answers WHERE question_id = ?`,
      [id]
    )

    await db.query<ResultSetHeader>(
      `DELETE FROM questions WHERE id = ?`,
      [id]
    )

    return Response.json({ message: '질문이 삭제되었습니다.' })
  } catch (error) {
    console.error('질문 삭제 오류:', error)
    return Response.json({ message: '질문 삭제 실패' }, { status: 500 })
  }
}