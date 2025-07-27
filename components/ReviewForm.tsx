'use client'

import { useState, useEffect } from 'react'

export default function SubmitReview() {
  type FormState = {
    name: string
    phone: string
    remarks: string
    images: File[]
  }

  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    remarks: '',
    images: [],
  })
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        (err) => {
          console.warn('Geolocation not allowed:', err)
        }
      )
    }
  }, [])

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []) as File[]
    setForm({ ...form, images: files })

    const previews = files.map((file) => URL.createObjectURL(file))
    setPreviews(previews)
  }

  const removeImage = (index: number) => {
    const newFiles = [...form.images]
    const newPreviews = [...previews]
    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)

    setForm({ ...form, images: newFiles })
    setPreviews(newPreviews)
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!form.name || !form.phone) {
      setError('Name and phone number are required.')
      setLoading(false)
      return
    }

    try {
      const base64Images = await Promise.all(
        form.images.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(file)
          })
        })
      )

      const res = await fetch('http://localhost:5000/cleaner-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: 1, // hardcoded for now; update if needed
          name: form.name,
          phone: form.phone,
          remarks: form.remarks,
          images: base64Images,
          location: locationCoords,
        }),
      })

      if (!res.ok) throw new Error('Submission failed')

      setSuccess(true)
      setForm({ name: '', phone: '', remarks: '', images: [] })
      setPreviews([])
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white shadow-xl rounded-lg w-full max-w-2xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">Submit Cleanliness Review</h2>

        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded relative text-sm">
            ✅ Your review has been submitted successfully!
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded relative text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium text-sm text-gray-700">Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700">Phone *</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700">Remarks</label>
            <textarea
              name="remarks"
              rows={3}
              value={form.remarks}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700">Upload Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm"
            />
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {previews.map((src, index) => (
                  <div key={index} className="relative group">
                    <img src={src} alt="" className="rounded-md shadow" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full px-2 py-1 opacity-80 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {locationCoords && (
            <div className="text-sm text-gray-500">
              Location: {locationCoords.lat.toFixed(4)}, {locationCoords.lng.toFixed(4)}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  )
}
