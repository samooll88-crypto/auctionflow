'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !nickname.trim()) {
      alert('모든 항목을 입력해주세요.')
      return
    }

    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 6) {
      alert('비밀번호는 6자 이상 입력해주세요.')
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, nickname: nickname.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || '회원가입 실패')
        return
      }

      alert('회원가입이 완료됐어요! 로그인해주세요.')
      router.push('/login')
    } catch (error) {
      console.error('회원가입 오류:', error)
      alert('회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold text-[#1B2E4B]">회원가입</h1>
        <p className="mb-6 text-sm text-slate-500">
          낙찰이지! 회원이 되어 경매 비용을 계산해보세요.
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
            <label className="mb-1 block text-sm font-medium text-slate-700">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 입력"
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력"
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">비밀번호 확인</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 재입력"
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-orange-400"
              onKeyDown={(e) => { if (e.key === 'Enter') handleRegister() }}
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>

          <p className="text-center text-sm text-slate-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-semibold text-orange-500 hover:text-orange-600">
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}