'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatStatus(status: string) {
  if (status === 'open') return '답변대기'
  if (status === 'closed' || status === 'answered') return '답변완료'
  return status
}

type Question = {
  id: number
  title: string
  content: string
  status: string
  created_at: string
  nickname: string
}

type MeResponse = {
  user: {
    id: number
    email: string
    role?: string
  } | null
}

export default function QaPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<MeResponse['user']>(null)
  const [authLoading, setAuthLoading] = useState(true)  // 로그인 체크 로딩
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const [questionsRes, meRes] = await Promise.all([
          fetch('/api/qa', { cache: 'no-store' }),
          fetch('/api/auth/me', { cache: 'no-store' }),
        ])

        const questionsData = await questionsRes.json()
        const meData: MeResponse = await meRes.json()

        setQuestions(Array.isArray(questionsData) ? questionsData : [])
        setUser(meData.user)
      } catch (error) {
        console.error('QA 초기 데이터 로딩 오류:', error)
      } finally {
        setLoading(false)
        setAuthLoading(false)
      }
    }

    init()
  }, [])

  const refreshQuestions = async () => {
    try {
      const res = await fetch('/api/qa', { cache: 'no-store' })
      const data = await res.json()
      setQuestions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('질문 목록 새로고침 오류:', error)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      setMessage('로그인 후 질문을 작성할 수 있습니다.')
      return
    }

    if (!title.trim() || !content.trim()) {
      setMessage('제목과 내용을 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)
      setMessage('')

      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      const data = await res.json()
      setMessage(data.message || '처리되었습니다.')

      if (res.ok) {
        setTitle('')
        setContent('')
        await refreshQuestions()
      }
    } catch (error) {
      console.error('질문 등록 오류:', error)
      setMessage('질문 등록 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1B2E4B]">질문답변</h1>
        <p className="mt-3 text-sm text-slate-500">
          계산 후 애매한 점이 있다면 질문을 남겨보세요.
        </p>
      </div>

      {/* 질문 작성 */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-[#1B2E4B]">질문 작성</h2>

        {authLoading ? (
          <p className="mt-4 text-sm text-slate-400">로딩 중...</p>
        ) : user ? (
          <div className="mt-5 space-y-4">
            <input
              type="text"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400"
            />

            <textarea
              placeholder="내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-40 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400"
            />

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-xl bg-[#1B2E4B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#253d61] disabled:opacity-60"
            >
              {submitting ? '등록 중...' : '질문 등록'}
            </button>

            {message && (
              <p className="text-sm text-slate-600">{message}</p>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-orange-50 p-4 text-sm text-slate-600">
            질문 작성은 로그인 후 가능합니다.{' '}
            <Link href="/login" className="font-semibold text-orange-500">
              로그인하러 가기 →
            </Link>
          </div>
        )}
      </div>

      {/* 질문 목록 */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-[#1B2E4B]">질문 목록</h2>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">불러오는 중...</p>
        ) : (
          <div className="mt-6 space-y-4">
            {questions.length === 0 ? (
              <p className="text-sm text-slate-500">등록된 질문이 없습니다.</p>
            ) : (
              questions.map((question) => (
                <Link
                  key={question.id}
                  href={`/qa/${question.id}`}
                  className="block rounded-2xl border border-slate-200 p-5 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      {question.title}
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      question.status === 'open'
                        ? 'bg-orange-50 text-orange-500'
                        : 'bg-green-50 text-green-600'
                    }`}>
                      {formatStatus(question.status)}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {question.content}
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    작성자: {question.nickname} · {formatDate(question.created_at)}
                  </p>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}