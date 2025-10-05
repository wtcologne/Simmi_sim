import Link from 'next/link'
import LightAndShadowSimulation from '@/components/LightAndShadowSimulation'

export default function LightAndShadowPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Zurück zu den Simulationen
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Licht und Schatten
          </h1>
          <p className="text-gray-400 text-lg">
            Erkunden Sie, wie verschiedene Lichtquellen Schatten erzeugen und verändern
          </p>
        </div>

        <LightAndShadowSimulation />
      </div>
    </main>
  )
}
