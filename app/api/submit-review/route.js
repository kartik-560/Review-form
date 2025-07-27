import { NextResponse } from 'next/server'
import { ReviewService } from '@/lib/services/ReviewService.js'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ error: "GET method not allowed. Use POST to submit data." }, { status: 405 })
}

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

    // Extract images
    const imageCount = parseInt(formData.get('imageCount') || '0')
    const imageFiles = []

    for (let i = 0; i < imageCount; i++) {
      const imageFile = formData.get(`image_${i}`)
      if (imageFile) {
        imageFiles.push(imageFile)
      }
    }

    // Use ReviewService to create the review
    const result = await ReviewService.createReview(reviewData, imageFiles)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, message: result.message },
        { status: 400 }
      )
    }
    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data
    }, { status: 200 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
