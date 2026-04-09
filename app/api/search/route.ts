import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseNo = (searchParams.get('caseNo') || '').trim()

    if (!caseNo) {
      return NextResponse.json(
        { message: '사건번호를 입력하세요.' },
        { status: 400 }
      )
    }

    const result = await db.query(
      `
      SELECT
        id,
        auction_id,
        case_no,
        property_type,
        address,
        appraisal_price,
        minimum_sale_price
      FROM auction_items
      WHERE case_no LIKE $1
      ORDER BY address ASC
      `,
      [`%${caseNo}%`]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: '해당 사건번호 데이터를 찾지 못했습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('검색 API 오류:', error)
    return NextResponse.json(
      { message: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}