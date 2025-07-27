import { NextResponse } from 'next/server'
import { ReviewService } from '@/lib/services/ReviewService.js'
import { ValidationService } from '@/lib/services/ValidationService.js'
import { ApiError, asyncHandler } from '@/lib/middleware/errorHandler.js'

export const dynamic = 'force-dynamic'

// GET /api/reviews - Get all reviews with pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const radius = parseFloat(searchParams.get('radius') || '1')

    let result

    // If location parameters provided, search by location
    if (latitude && longitude) {
      result = await ReviewService.getReviewsByLocation(
        parseFloat(latitude),
        parseFloat(longitude),
        radius
      )
    } else {
      result = await ReviewService.getAllReviews(page, limit)
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, message: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: result.message
    })

  } catch (error) {
    console.error('GET /api/reviews error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a new review
export async function POST(request) {
  try {
    const formData = await request.formData()

    // Extract form data
    const reviewData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      rating: parseFloat(formData.get('rating')),
      description: formData.get('description') || '',
      reason_ids: JSON.parse(formData.get('reason_ids') || '[]'),
      latitude: parseFloat(formData.get('latitude')),
      longitude: parseFloat(formData.get('longitude')),
      address: formData.get('address') || ''
    }

    // Sanitize input data
    const sanitizedData = ValidationService.sanitizeReviewData(reviewData)

    // Extract images
    const imageCount = parseInt(formData.get('imageCount') || '0')
    const imageFiles = []

    for (let i = 0; i < imageCount; i++) {
      const imageFile = formData.get(`image_${i}`)
      if (imageFile) {
        imageFiles.push(imageFile)
      }
    }

    // Create review using service
    const result = await ReviewService.createReview(sanitizedData, imageFiles)

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
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/reviews error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to create review' },
      { status: 500 }
    )
  }
}