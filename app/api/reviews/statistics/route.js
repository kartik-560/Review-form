import { NextResponse } from 'next/server'
import { ReviewService } from '@/lib/services/ReviewService.js'

export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    const result = await ReviewService.getReviewStatistics()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, message: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message
    })

  } catch (error) {
    console.error('GET /api/reviews/statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}