import { NextResponse } from 'next/server'
import { ReviewService } from '@/lib/services/ReviewService.js'
import { ValidationService } from '@/lib/services/ValidationService.js'

export const dynamic = 'force-dynamic'


export async function GET(request, { params }) {
  try {
    const { id } = params
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Invalid review ID', message: 'Review ID must be a valid number' },
        { status: 400 }
      )
    }

    const result = await ReviewService.getReview(parseInt(id))

    if (!result.success) {
      const statusCode = result.error === 'Review not found' ? 404 : 400
      return NextResponse.json(
        { error: result.error, message: result.message },
        { status: statusCode }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message
    })

  } catch (error) {
    console.error(`GET /api/reviews/${params.id} error:`, error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

// PUT /api/reviews/[id] - Update a specific review
export async function PUT(request, { params }) {
  try {
    const { id } = params
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Invalid review ID', message: 'Review ID must be a valid number' },
        { status: 400 }
      )
    }

    const updateData = await request.json()
    
    // Sanitize input data
    const sanitizedData = ValidationService.sanitizeReviewData(updateData)

    const result = await ReviewService.updateReview(parseInt(id), sanitizedData)

    if (!result.success) {
      const statusCode = result.error === 'Review not found' ? 404 : 400
      return NextResponse.json(
        { error: result.error, message: result.message },
        { status: statusCode }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message
    })

  } catch (error) {
    console.error(`PUT /api/reviews/${params.id} error:`, error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id] - Delete a specific review
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Invalid review ID', message: 'Review ID must be a valid number' },
        { status: 400 }
      )
    }

    const result = await ReviewService.deleteReview(parseInt(id))

    if (!result.success) {
      const statusCode = result.error === 'Review not found' ? 404 : 400
      return NextResponse.json(
        { error: result.error, message: result.message },
        { status: statusCode }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message
    })

  } catch (error) {
    console.error(`DELETE /api/reviews/${params.id} error:`, error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to delete review' },
      { status: 500 }
    )
  }
}