import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  try {
    const result = await db.query(
      'SELECT * FROM saved_calculations ORDER BY id DESC'
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'DB 오류' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    await db.query(
      `INSERT INTO saved_calculations
      (user_id, case_no, address, property_type, appraisal_price, minimum_sale_price,
       bid_price, acquisition_tax_rate, acquisition_tax, loan_percent, loan_amount,
       legal_fee, eviction_cost, arrears_fee, repair_cost, other_cost,
       extra_cost, total_cost, own_capital)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        body.userId,
        body.caseNo,
        body.address,
        body.propertyType,
        body.appraisalPrice,
        body.minimumSalePrice,
        body.bidPrice,
        body.taxRate,
        body.tax,
        body.loanPercent,
        body.loanAmount,
        body.legalFee,
        body.evictionCost,
        body.arrearsFee,
        body.repairCost,
        body.otherCost,
        body.extraCost,
        body.totalCost,
        body.ownCapital,
      ]
    )

    return NextResponse.json({ message: '저장 완료' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: '저장 실패' }, { status: 500 })
  }
}