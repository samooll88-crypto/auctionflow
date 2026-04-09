'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email.trim()) {
      alert('이메일을 입력하세요.')
      return
    }
    if (!password.trim()) {
      alert('비밀번호를 입력하세요.')
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || '로그인 실패')
        return
      }

      sessionStorage.setItem('userEmail', email.trim())
      window.dispatchEvent(new Event('user-auth-changed'))
      router.push('/')
    } catch (error) {
      console.error('로그인 오류:', error)
      alert('로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold text-[#1B2E4B]">로그인</h1>
        <p className="mb-6 text-sm text-slate-500">
          이메일과 비밀번호를 입력해주세요.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-orange-400"
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-lg bg-[#1B2E4B] py-3 font-semibold text-white hover:bg-[#253d61] disabled:opacity-60"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <p className="text-center text-sm text-slate-500">
            아직 계정이 없으신가요?{' '}
            <Link href="/register" className="font-semibold text-orange-500 hover:text-orange-600">
              회원가입하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}