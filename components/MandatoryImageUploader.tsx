'use client'

import { useState, useRef } from 'react'
import { Camera, X, Upload, CheckCircle } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import Image from 'next/image'

interface OptionalImageUploaderProps {
  images: File[]
  onImagesChange: (images: File[]) => void
  maxImages?: number
  maxSizeKB?: number
}

export default function OptionalImageUploader({
  images,
  onImagesChange,
  maxImages = 3,
  maxSizeKB = 300,
}: OptionalImageUploaderProps) {
  const [loading, setLoading] = useState(false)
  const [compressionStatus, setCompressionStatus] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: maxSizeKB / 1024,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.8,
    }

    try {
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      console.error('Compression error:', error)
      throw new Error('Failed to compress image')
    }
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    setLoading(true)
    setCompressionStatus('Processing images...')
    const newImages: File[] = []

    try {
      for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
        const file = files[i]

        if (!file.type.startsWith('image/')) {
          alert(`File "${file.name}" is not an image`)
          continue
        }

        setCompressionStatus(`Compressing ${file.name}...`)

        const compressedFile = await compressImage(file)
        const renamedFile = new File([compressedFile], file.name, {
          type: compressedFile.type,
          lastModified: Date.now(),
        })

        newImages.push(renamedFile)
      }

      onImagesChange([...images, ...newImages])
      setCompressionStatus('Images compressed successfully!')

      setTimeout(() => setCompressionStatus(''), 3000)
    } catch (error) {
      console.error('Error processing images:', error)
      alert('Error processing images. Please try again.')
      setCompressionStatus('')
    } finally {
      setLoading(false)
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    onImagesChange(updatedImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openCamera = () => {
    cameraInputRef.current?.click()
  }

  const canAddMore = images.length < maxImages

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Camera className="h-4 w-4 mr-1" />
          {/* Label updated to show it's optional */}
          Upload Photos (Optional - Max {maxImages})
        </label>
        <span className="text-xs text-gray-500">
          Max {maxSizeKB}KB each (auto-compressed)
        </span>
      </div>

      {/* Upload Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={openCamera}
          disabled={!canAddMore || loading}
          className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Camera className="h-5 w-5 mr-2" />
          Take Photo
        </button>

        <button
          type="button"
          onClick={openFileDialog}
          disabled={!canAddMore || loading}
          className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload Files
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={!canAddMore || loading}
        title="Upload image files"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={!canAddMore || loading}
        title="Take a photo"
      />

      {/* Status Messages */}
      {loading && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm text-blue-700">{compressionStatus}</span>
        </div>
      )}

      {compressionStatus && !loading && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">{compressionStatus}</span>
        </div>
      )}

      {/* Requirement Status block has been removed */}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <Image
                src={URL.createObjectURL(image)}
                alt={`Photo ${index + 1}`}
                width={400}
                height={400}
                style={{
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                  borderRadius: '0.5rem', // Match the parent div's rounded-lg
                }}
                unoptimized
              />
              <button
                type="button"
                title="Remove image"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <X size={14} />
              </button>
              <div className="mt-2 text-xs text-gray-600 text-center">
                <div className="font-medium truncate">{image.name}</div>
                <div className="text-gray-500">
                  {Math.round(image.size / 1024)}KB
                  {image.size <= maxSizeKB * 1024 && (
                    <span className="text-green-600 ml-1">✓</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}