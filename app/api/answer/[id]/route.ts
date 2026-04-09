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
  const token = (await cookies()).get('token')?.value

  if (!token) return null

  const payload = (await verifyToken(token)) as TokenPayload

  if (!payload?.email || payload.email !== ADMIN_EMAIL) {
    return null
  }

  return payload
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUser()

    if (!adminUser) {
      return Response.json({ message: '운영자만 답변을 수정할 수 있습니다.' }, { status: 403 })
    }

    const { id } = await params
    const { content } = await req.json()

    if (!content?.trim()) {
      return Response.json({ message: '답변 내용을 입력해주세요.' }, { status: 400 })
    }

    await db.query(
      `UPDATE answers SET content = $1 WHERE id = $2`,
      [content.trim(), id]
    )

    return Response.json({ message: '답변이 수정되었습니다.' })
  } catch (error) {
    console.error('답변 수정 오류:', error)
    return Response.json({ message: '답변 수정 실패' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUser()

    if (!adminUser) {
      return Response.json({ message: '운영자만 답변을 삭제할 수 있습니다.' }, { status: 403 })
    }

    const { id } = await params

    const answerResult = await db.query(
      `SELECT question_id FROM answers WHERE id = $1`,
      [id]
    )

    if (answerResult.rows.length === 0) {
      return Response.json({ message: '답변을 찾을 수 없습니다.' }, { status: 404 })
    }

    const questionId = answerResult.rows[0].question_id

    await db.query(
      `DELETE FROM answers WHERE id = $1`,
      [id]
    )

    const remainResult = await db.query(
      `SELECT id FROM answers WHERE question_id = $1 LIMIT 1`,
      [questionId]
    )

    if (remainResult.rows.length === 0) {
      await db.query(
        `UPDATE questions SET status = '답변대기' WHERE id = $1`,
        [questionId]
      )
    }

    return Response.json({ message: '답변이 삭제되었습니다.' })
  } catch (error) {
    console.error('답변 삭제 오류:', error)
    return Response.json({ message: '답변 삭제 실패' }, { status: 500 })
  }
}