'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, MessageSquare, CheckSquare, Send, CheckCircle } from 'lucide-react'
import SmileyRating from './SmileyRating'
import MandatoryImageUploader from './MandatoryImageUploader' // Or your optional uploader
import LocationDetector from './LocationDetector' // Or your improved LocationInput

// Define Location type
type Location = {
  latitude: number
  longitude: number
  address: string
}

// Zod schema for form validation
const reviewSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().min(10, 'A valid 10-digit phone number is required'),
  rating: z.number().min(1, 'Rating is required').max(10),
  reason_ids: z.array(z.number()),
  description: z.string().optional(),
  images: z.array(z.instanceof(File)).optional(), // Images are optional
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string()
  }).nullable()
})

type ReviewFormData = z.infer<typeof reviewSchema>

// --- NEW: Common washroom issues for the Indian context ---
const commonIndianWashroomIssues = [
  // Cleanliness & Hygiene
  { id: 1, text: 'Dirty or unflushed toilets (Western or Indian)' },
  { id: 2, text: 'Wet, slippery, or muddy floors' },
  { id: 3, text: 'Unpleasant or strong odor' },
  { id: 4, text: 'Paan / Gutka spit stains' },
  { id: 5, text: 'Overflowing dustbins' },
  { id: 6, text: 'General grime (stained walls, dirty mirrors)' },
  // Water & Fixtures
  { id: 7, text: 'No water in taps or for flush' },
  { id: 8, text: 'Leaking taps, pipes, or cisterns' },
  { id: 9, text: 'Broken or missing health faucet (jet spray)' },
  { id: 10, text: 'No mug or lota available' },
  { id: 11, text: 'Broken or missing toilet seat' },
  { id: 12, text: 'Faulty or broken door lock/latch' },
  { id: 13, text: 'Low water pressure' },
  // Supplies & Amenities
  { id: 14, text: 'No hand-washing soap' },
  { id: 15, text: 'No toilet paper available' },
  { id: 16, text: 'Faulty hand dryer or no paper towels' },
  { id: 17, text: 'Poor or no lighting' },
  { id: 18, text: 'No hooks for bags or clothes' },
  { id: 19, text: 'Poor ventilation (no fan or window)' }
];

export default function ReviewForm() {
  const [images, setImages] = useState<File[]>([])
  const [location, setLocation] = useState<Location | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }, // Use isValid for button state
    setValue,
    watch,
    reset,
    trigger
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    mode: 'onChange', // Validate on change for better UX
    defaultValues: {
      rating: 0,
      reason_ids: [],
      description: '',
      images: [],
      location: null
    }
  })

  // Watch for changes to update UI or logic
  const rating = watch('rating')
  const selectedReasons = watch('reason_ids')

  // Set form values manually when state changes
  const handleImagesChange = (newImages: File[]) => {
    setImages(newImages)
    setValue('images', newImages, { shouldValidate: true })
  }

  const handleLocationChange = (newLocation: Location | null) => {
    setLocation(newLocation)
    setValue('location', newLocation, { shouldValidate: true })
  }
  
  const handleRatingChange = (newRating: number) => {
      setValue('rating', newRating, { shouldValidate: true });
  }

  const handleReasonToggle = (reasonId: number) => {
    const updatedReasons = selectedReasons.includes(reasonId)
      ? selectedReasons.filter(id => id !== reasonId)
      : [...selectedReasons, reasonId]
    setValue('reason_ids', updatedReasons)
  }

  const onSubmit = async (data: ReviewFormData) => {
    if (!data.location) {
        alert('Please set a location to submit your review.');
        return;
    }

    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      
      // Append all form data
      formData.append('name', data.name)
      formData.append('email', data.email)
      formData.append('phone', data.phone)
      formData.append('rating', data.rating.toString())
      formData.append('description', data.description || '')
      formData.append('reason_ids', JSON.stringify(data.reason_ids))
      
      // Append location data safely
      formData.append('latitude', data.location.latitude.toString())
      formData.append('longitude', data.location.longitude.toString())
      formData.append('address', data.location.address)
      
      // Append images
      formData.append('imageCount', data.images?.length.toString() || '0')
      data.images?.forEach((image, index) => {
        formData.append(`image_${index}`, image)
      })
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/reviews`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      // --- Success ---
      setShowSuccess(true)
      reset()
      setImages([])
      setLocation(null)
      
      setTimeout(() => setShowSuccess(false), 5000)

    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Your washroom review has been submitted successfully. Thank you for helping improve public facilities!
          </p>
          <button
            onClick={() => setShowSuccess(false)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Submit Another Review
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <h1 className="text-3xl font-bold mb-3">Public Washroom Review</h1>
          <p className="text-blue-100 text-lg">Help others by sharing your washroom experience.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-8">
          
          {/* --- Use your improved LocationInput component --- */}
          <LocationDetector 
            location={location} 
            onLocationChange={handleLocationChange}
          />
          {errors.location && (
             <p className="text-red-500 text-xs mt-1">Location is a required field.</p>
          )}

          {/* Personal Information */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><User className="h-4 w-4 mr-1" /> Name *</label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><Mail className="h-4 w-4 mr-1" /> Email *</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><Phone className="h-4 w-4 mr-1" /> Phone *</label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="10-digit mobile number"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Overall Rating *</label>
            <SmileyRating
              rating={rating}
              onRatingChange={handleRatingChange}
              size={32}
            />
            {errors.rating && <p className="text-red-500 text-xs mt-2">{errors.rating.message}</p>}
          </div>

          {/* --- Use your OptionalImageUploader component --- */}
          <MandatoryImageUploader
            images={images}
            onImagesChange={handleImagesChange}
          />
          {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images.message}</p>}

          {/* Issues Checklist */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-4"><CheckSquare className="h-4 w-4 mr-1" /> Select Observed Issues (Optional):</label>
            <div className="grid sm:grid-cols-2 gap-3">
              {/* --- MAPPED NEW LIST --- */}
              {commonIndianWashroomIssues.map((reason) => (
                <label key={reason.id} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(reason.id)}
                    onChange={() => handleReasonToggle(reason.id)}
                    className="mt-0.5 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{reason.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Detailed Review */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><MessageSquare className="h-4 w-4 mr-1" /> Additional Comments (Optional)</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Share more details about your experience..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Submitting Review...</span>
              </>
            ) : (
              <>
                <Send className="h-6 w-6" />
                <span>Submit Review</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}