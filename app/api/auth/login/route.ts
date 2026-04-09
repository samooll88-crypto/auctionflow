import db from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createToken } from '@/lib/session'
import type { RowDataPacket } from 'mysql2'

interface UserRow extends RowDataPacket {
  id: number
  email: string
  password_hash: string
  nickname: string
  role: string
}

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const [users] = await db.query<UserRow[]>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  )

  if (users.length === 0) {
    return Response.json({ message: '이메일 또는 비밀번호 오류' }, { status: 400 })
  }

  const user = users[0]

  const isMatch = await bcrypt.compare(password, user.password_hash)

  if (!isMatch) {
    return Response.json({ message: '이메일 또는 비밀번호 오류' }, { status: 400 })
  }

  const token = await createToken({
    id: user.id,
    email: user.email,
    role: user.role,
  })

  return new Response(JSON.stringify({ message: '로그인 성공' }), {
    headers: {
      'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=604800`,
      'Content-Type': 'application/json',
    },
  })
}