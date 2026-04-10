'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

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

type Answer = {
  id: number
  content: string
  created_at: string
  nickname: string
}

type DetailResponse = {
  question: Question
  answers: Answer[]
}

type MeResponse = {
  user: {
    id: number
    email: string
    role?: string
  } | null
}

const ADMIN_EMAIL = 'samooll@naver.com'

export default function QaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [detail, setDetail] = useState<DetailResponse | null>(null)
  const [user, setUser] = useState<MeResponse['user']>(null)

  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editStatus, setEditStatus] = useState('답변대기')
  const [editingQuestion, setEditingQuestion] = useState(false)

  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null)
  const [editingAnswerContent, setEditingAnswerContent] = useState('')

  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    const init = async () => {
      if (!id) return

      try {
        const [detailRes, meRes] = await Promise.all([
          fetch(`/api/qa/${id}`, { cache: 'no-store' }),
          fetch('/api/auth/me', { cache: 'no-store' }),
        ])

        const detailData = await detailRes.json()
        const meData: MeResponse = await meRes.json()

        setDetail(detailData)
        setUser(meData.user)

        if (detailData?.question) {
          setEditTitle(detailData.question.title)
          setEditContent(detailData.question.content)
          setEditStatus(detailData.question.status)
        }
      } catch (error) {
        console.error('질문 상세 초기 데이터 로딩 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [id])

  const refreshDetail = async () => {
    try {
      const res = await fetch(`/api/qa/${id}`, { cache: 'no-store' })
      const data = await res.json()
      setDetail(data)

      if (data?.question) {
        setEditTitle(data.question.title)
        setEditContent(data.question.content)
        setEditStatus(data.question.status)
      }
    } catch (error) {
      console.error('질문 상세 새로고침 오류:', error)
    }
  }

  const handleAnswerSubmit = async () => {
    if (!answer.trim()) {
      setMessage('답변 내용을 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)
      setMessage('')

      const res = await fetch(`/api/qa/${id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: answer }),
      })

      const data = await res.json()
      setMessage(data.message || '처리되었습니다.')

      if (res.ok) {
        setAnswer('')
        await refreshDetail()
      }
    } catch (error) {
      console.error('답변 등록 오류:', error)
      setMessage('답변 등록 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuestionUpdate = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    try {
      const res = await fetch(`/api/qa/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          status: editStatus,
        }),
      })

      const data = await res.json()
      alert(data.message || '처리되었습니다.')

      if (res.ok) {
        setEditingQuestion(false)
        await refreshDetail()
      }
    } catch (error) {
      console.error('질문 수정 오류:', error)
      alert('질문 수정 중 오류가 발생했습니다.')
    }
  }

  const handleQuestionDelete = async () => {
    const ok = confirm('이 질문과 연결된 답변까지 모두 삭제할까요?')
    if (!ok) return

    try {
      const res = await fetch(`/api/qa/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      alert(data.message || '처리되었습니다.')

      if (res.ok) {
        router.push('/qa')
      }
    } catch (error) {
      console.error('질문 삭제 오류:', error)
      alert('질문 삭제 중 오류가 발생했습니다.')
    }
  }

  const startEditAnswer = (answerItem: Answer) => {
    setEditingAnswerId(answerItem.id)
    setEditingAnswerContent(answerItem.content)
  }

  const cancelEditAnswer = () => {
    setEditingAnswerId(null)
    setEditingAnswerContent('')
  }

  const handleAnswerUpdate = async (answerId: number) => {
    if (!editingAnswerContent.trim()) {
      alert('답변 내용을 입력해주세요.')
      return
    }

    try {
      const res = await fetch(`/api/answer/${answerId}`, {  // ✅ 수정: answers → answer
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingAnswerContent }),
      })

      const data = await res.json()
      alert(data.message || '처리되었습니다.')

      if (res.ok) {
        setEditingAnswerId(null)
        setEditingAnswerContent('')
        await refreshDetail()
      }
    } catch (error) {
      console.error('답변 수정 오류:', error)
      alert('답변 수정 중 오류가 발생했습니다.')
    }
  }

  const handleAnswerDelete = async (answerId: number) => {
    const ok = confirm('이 답변을 삭제할까요?')
    if (!ok) return

    try {
      const res = await fetch(`/api/answer/${answerId}`, {  // ✅ 수정: answers → answer
        method: 'DELETE',
      })

      const data = await res.json()
      alert(data.message || '처리되었습니다.')

      if (res.ok) {
        await refreshDetail()
      }
    } catch (error) {
      console.error('답변 삭제 오류:', error)
      alert('답변 삭제 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-10">불러오는 중...</div>
  }

  if (!detail || !detail.question) {
    return <div className="mx-auto max-w-5xl px-4 py-10">질문을 찾을 수 없습니다.</div>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            {editingQuestion ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />

                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-40 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />

                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="답변대기">답변대기</option>
                  <option value="답변완료">답변완료</option>
                </select>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleQuestionUpdate}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    질문 수정 저장
                  </button>
                  <button
                    onClick={() => {
                      setEditingQuestion(false)
                      setEditTitle(detail.question.title)
                      setEditContent(detail.question.content)
                      setEditStatus(detail.question.status)
                    }}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  {detail.question.title}
                </h1>

                <p className="mt-4 whitespace-pre-line text-slate-700">
                  {detail.question.content}
                </p>

                <p className="mt-4 text-sm text-slate-400">
                  작성자: {detail.question.nickname} · {formatDate(detail.question.created_at)} · 상태: {formatStatus(detail.question.status)}
                </p>
              </>
            )}
          </div>

          {isAdmin && !editingQuestion && (
            <div className="flex gap-2">
              <button
                onClick={() => setEditingQuestion(true)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                질문 수정
              </button>
              <button
                onClick={handleQuestionDelete}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
              >
                질문 삭제
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold">답변</h2>

        <div className="mt-6 space-y-4">
          {detail.answers.length === 0 ? (
            <p className="text-sm text-slate-500">아직 등록된 답변이 없습니다.</p>
          ) : (
            detail.answers.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-5">
                {editingAnswerId === item.id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editingAnswerContent}
                      onChange={(e) => setEditingAnswerContent(e.target.value)}
                      className="min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleAnswerUpdate(item.id)}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        답변 수정 저장
                      </button>
                      <button
                        onClick={cancelEditAnswer}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-line text-slate-700">{item.content}</p>

                    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <p className="text-xs text-slate-400">
                        작성자: {item.nickname} · {formatDate(item.created_at)}
                      </p>

                      {isAdmin && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditAnswer(item)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            답변 수정
                          </button>
                          <button
                            onClick={() => handleAnswerDelete(item.id)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50"
                          >
                            답변 삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">답변 작성</h2>

          <div className="mt-5 space-y-4">
            <textarea
              placeholder="답변 내용"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-40 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              onClick={handleAnswerSubmit}
              disabled={submitting}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? '등록 중...' : '답변 등록'}
            </button>

            {message && <p className="text-sm text-slate-600">{message}</p>}
          </div>
        </div>
      )}
    </div>
  )
}