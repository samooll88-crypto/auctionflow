import db from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/session'

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

    const questionResult = await db.query(
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
      WHERE q.id = $1
      `,
      [id]
    )

    if (questionResult.rows.length === 0) {
      return Response.json({ message: '질문을 찾을 수 없습니다.' }, { status: 404 })
    }

    const answerResult = await db.query(
      `
      SELECT
        a.id,
        a.content,
        a.created_at,
        u.nickname
      FROM answers a
      JOIN users u ON a.user_id = u.id
      WHERE a.question_id = $1
      ORDER BY a.id ASC
      `,
      [id]
    )

    return Response.json({
      question: questionResult.rows[0],
      answers: answerResult.rows,
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

    await db.query(
      `
      UPDATE questions
      SET title = $1, content = $2, status = $3
      WHERE id = $4
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

    await db.query(
      `DELETE FROM answers WHERE question_id = $1`,
      [id]
    )

    await db.query(
      `DELETE FROM questions WHERE id = $1`,
      [id]
    )

    return Response.json({ message: '질문이 삭제되었습니다.' })
  } catch (error) {
    console.error('질문 삭제 오류:', error)
    return Response.json({ message: '질문 삭제 실패' }, { status: 500 })
  }
}