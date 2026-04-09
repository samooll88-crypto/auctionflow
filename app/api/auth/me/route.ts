import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/session'

export async function GET() {
  const token = (await cookies()).get('token')?.value

  if (!token) {
    return Response.json({ user: null })
  }

  try {
    const payload = await verifyToken(token)
    return Response.json({ user: payload })
  } catch {
    return Response.json({ user: null })
  }
}