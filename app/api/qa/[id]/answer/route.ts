import db from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/session'
import type { ResultSetHeader } from 'mysql2'

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

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUser()

    if (!adminUser) {
      return Response.json(
        { message: '운영자만 답변을 등록할 수 있습니다.' },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const { content } = await req.json()

    if (!content?.trim()) {
      return Response.json(
        { message: '답변 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    await db.query<ResultSetHeader>(
      `INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)`,
      [id, adminUser.id, content.trim()]
    )

    return Response.json({ message: '답변이 등록되었습니다.' })
  } catch (error) {
    console.error('답변 등록 오류:', error)
    return Response.json({ message: '답변 등록 실패' }, { status: 500 })
  }
}