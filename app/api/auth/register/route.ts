import db from '@/lib/db'
import bcrypt from 'bcryptjs'
import type { RowDataPacket } from 'mysql2'

interface ExistingUserRow extends RowDataPacket {
  id: number
}

export async function POST(req: Request) {
  const { email, password, nickname } = await req.json()

  if (!email || !password || !nickname) {
    return Response.json({ message: '모든 값을 입력해주세요' }, { status: 400 })
  }

  const [existing] = await db.query<ExistingUserRow[]>(
    'SELECT id FROM users WHERE email = ?',
    [email]
  )

  if (existing.length > 0) {
    return Response.json({ message: '이미 존재하는 이메일입니다' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 10)

  await db.query(
    'INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)',
    [email, hashed, nickname]
  )

  return Response.json({ message: '회원가입 성공' })
}