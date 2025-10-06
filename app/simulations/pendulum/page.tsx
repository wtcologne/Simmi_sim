import PendulumSimulation from '@/components/PendulumSimulation'

export default function PendulumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Fadenpendel-Simulation
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Erkunden Sie die Physik des Fadenpendels mit interaktiven Einstellungen und Echtzeit-Visualisierung
          </p>
        </div>
        
        <PendulumSimulation />
      </div>
    </div>
  )
}