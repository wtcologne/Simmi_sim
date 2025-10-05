import Link from 'next/link'

export default function Home() {
  const simulations = [
    {
      id: 'light-and-shadow',
      title: 'Licht und Schatten',
      description: 'Erkunden Sie, wie Lichtquellen Schatten mit einstellbaren Parametern erzeugen',
      color: 'from-yellow-500 to-orange-600',
    },
    // Future simulations can be added here
    // {
    //   id: 'refraction',
    //   title: 'Refraction',
    //   description: 'Understand how light bends through different media',
    //   color: 'from-blue-500 to-cyan-600',
    // },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Physik-Simulationen
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Interaktive Visualisierungen grundlegender Physikkonzepte zum Lernen und Erkunden
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {simulations.map((sim) => (
            <Link
              key={sim.id}
              href={`/simulations/${sim.id}`}
              className="group relative overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${sim.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
              <div className="relative p-8">
                <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">
                  {sim.title}
                </h2>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {sim.description}
                </p>
                <div className="mt-4 flex items-center text-blue-400 group-hover:text-blue-300">
                  <span className="text-sm font-medium">Erkunden</span>
                  <svg
                    className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>Erstellt mit Next.js, TypeScript und p5.js</p>
        </div>
      </div>
    </main>
  )
}
