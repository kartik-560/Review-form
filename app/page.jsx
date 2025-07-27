import ReviewForm from '@/components/ReviewForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
      <div className="w-full max-w-3xl p-6 bg-white shadow-2xl rounded-2xl border border-blue-100">
        <h1 className="text-3xl font-semibold text-center text-blue-700 mb-6">
          Submit Your Washroom Review
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Your feedback helps us improve hygiene and facilities.
        </p>
        <ReviewForm />
      </div>
    </main>
  )
}
