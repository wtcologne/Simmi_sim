'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import type P5 from 'react-p5/node_modules/@types/p5'

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false,
})

interface LightSource {
  x: number
  y: number
  color: string
  intensity: number
  isExtended: boolean
  radius: number
  isDragging?: boolean
}

interface Obstacle {
  x: number
  y: number
  width: number
  height: number
  isDragging?: boolean
}

export default function LightAndShadowSimulation() {
  const [lightSources, setLightSources] = useState<LightSource[]>([
    { x: 150, y: 200, color: '#ffff00', intensity: 1.0, isExtended: false, radius: 20 },
  ])
  const [obstacle, setObstacle] = useState<Obstacle>({
    x: 400,
    y: 300,
    width: 40,
    height: 120,
  })
  const [shadowData, setShadowData] = useState<any>(null)
  const [draggedElement, setDraggedElement] = useState<{ type: 'light' | 'obstacle', index?: number } | null>(null)

  const canvasWidth = 800
  const canvasHeight = 600
  const groundY = 500

  const addLightSource = () => {
    if (lightSources.length < 3) {
      setLightSources([
        ...lightSources,
        {
          x: Math.random() * 200 + 50, // Links positionieren
          y: Math.random() * 200 + 100,
          color: '#ffff00',
          intensity: 1.0,
          isExtended: false,
          radius: 20,
        },
      ])
    }
  }

  const removeLightSource = (index: number) => {
    setLightSources(lightSources.filter((_, i) => i !== index))
  }

  const updateLightSource = (index: number, updates: Partial<LightSource>) => {
    const newLights = [...lightSources]
    newLights[index] = { ...newLights[index], ...updates }
    setLightSources(newLights)
  }

  const updateObstacle = (updates: Partial<Obstacle>) => {
    setObstacle({ ...obstacle, ...updates })
  }

  // Fetch shadow calculations from Python backend
  useEffect(() => {
    const fetchShadowData = async () => {
      try {
        const response = await fetch('/api/shadow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lights: lightSources,
            obstacle,
            groundY,
            canvasWidth,
            canvasHeight,
          }),
        })
        const data = await response.json()
        setShadowData(data)
      } catch (error) {
        console.log('Shadow API not available, using client-side calculations')
      }
    }

    fetchShadowData()
  }, [lightSources, obstacle])

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 255, g: 255, b: 255 }
  }

  const setup = (p5: P5, canvasParentRef: Element) => {
    p5.createCanvas(canvasWidth, canvasHeight).parent(canvasParentRef)
  }

  const draw = (p5: P5) => {
    // Background - dark scene
    p5.background(20, 20, 30)

    // Draw ground
    p5.fill(40, 40, 50)
    p5.noStroke()
    p5.rect(0, groundY, canvasWidth, canvasHeight - groundY)

    // Draw light area (left side)
    p5.fill(60, 60, 80)
    p5.noStroke()
    p5.rect(0, 0, 250, groundY)

    // Draw obstacle area (center)
    p5.fill(50, 50, 70)
    p5.noStroke()
    p5.rect(250, 0, 300, groundY)

    // Draw shadow area (right side)
    p5.fill(30, 30, 50)
    p5.noStroke()
    p5.rect(550, 0, 250, groundY)

    // Draw area labels
    p5.fill(200)
    p5.textSize(16)
    p5.textAlign(p5.CENTER)
    p5.text('Lichtquellen', 125, 30)
    p5.text('Hindernis', 400, 30)
    p5.text('Schattenfall', 675, 30)

    // Draw shadows for each light source
    lightSources.forEach((light) => {
      const rgb = hexToRgb(light.color)
      
      if (light.isExtended) {
        // Extended light source - create soft shadow with penumbra
        const numSamples = 12
        for (let i = 0; i < numSamples; i++) {
          const angle = (i / numSamples) * Math.PI * 2
          const sampleX = light.x + Math.cos(angle) * light.radius
          const sampleY = light.y + Math.sin(angle) * light.radius
          
          // Calculate shadow
          drawShadowFromPoint(p5, sampleX, sampleY, rgb, light.intensity / numSamples)
        }
      } else {
        // Point light source
        drawShadowFromPoint(p5, light.x, light.y, rgb, light.intensity)
      }
    })

    // Draw obstacle
    p5.fill(120, 100, 80)
    p5.stroke(100, 80, 60)
    p5.strokeWeight(2)
    p5.rect(obstacle.x - obstacle.width/2, obstacle.y - obstacle.height, obstacle.width, obstacle.height)
    
    // Draw obstacle base
    p5.fill(100, 80, 60)
    p5.noStroke()
    p5.ellipse(obstacle.x, groundY, obstacle.width + 8, 12)

    // Draw light sources
    lightSources.forEach((light, index) => {
      const rgb = hexToRgb(light.color)
      
      if (light.isExtended) {
        // Draw extended light source
        p5.fill(rgb.r, rgb.g, rgb.b, 150)
        p5.noStroke()
        p5.ellipse(light.x, light.y, light.radius * 2, light.radius * 2)
        
        // Glow effect
        for (let i = 3; i > 0; i--) {
          p5.fill(rgb.r, rgb.g, rgb.b, 30 * light.intensity / i)
          p5.ellipse(light.x, light.y, light.radius * 2 + i * 15, light.radius * 2 + i * 15)
        }
      } else {
        // Draw point light source
        p5.fill(rgb.r, rgb.g, rgb.b, 200)
        p5.noStroke()
        p5.ellipse(light.x, light.y, 20, 20)
        
        // Glow effect
        for (let i = 3; i > 0; i--) {
          p5.fill(rgb.r, rgb.g, rgb.b, 40 * light.intensity / i)
          p5.ellipse(light.x, light.y, 20 + i * 15, 20 + i * 15)
        }
      }
      
      // Draw label
      p5.fill(255)
      p5.noStroke()
      p5.textSize(12)
      p5.textAlign(p5.CENTER)
      p5.text(`L${index + 1}`, light.x, light.y - 30)
    })

    // Draw obstacle label
    p5.fill(255)
    p5.noStroke()
    p5.textSize(12)
    p5.textAlign(p5.CENTER)
    p5.text('Hindernis', obstacle.x, obstacle.y - obstacle.height - 10)

    // UI hints
    p5.fill(150)
    p5.textSize(11)
    p5.textAlign(p5.LEFT)
    p5.text('Ziehen Sie die Lichter und das Hindernis per Drag & Drop', 10, canvasHeight - 10)
  }

  const drawShadowFromPoint = (
    p5: P5,
    lightX: number,
    lightY: number,
    rgb: { r: number; g: number; b: number },
    intensity: number
  ) => {
    // Calculate shadow from obstacle
    const dx = obstacle.x - lightX
    const dy = obstacle.y - lightY
    
    if (dy <= 0) return // Light below obstacle
    
    // Shadow extends from obstacle in the direction away from light
    const shadowLength = (obstacle.height * Math.abs(dx)) / dy
    const shadowEndX = obstacle.x + shadowLength
    
    // Only draw shadow in the shadow area (right side)
    if (shadowEndX > 550) {
      // Draw shadow as a quad
      p5.fill(0, 0, 0, 120 * intensity)
      p5.noStroke()
      p5.beginShape()
      p5.vertex(obstacle.x - obstacle.width/2, groundY)
      p5.vertex(obstacle.x + obstacle.width/2, groundY)
      p5.vertex(shadowEndX + obstacle.width/2, groundY)
      p5.vertex(shadowEndX - obstacle.width/2, groundY)
      p5.endShape(p5.CLOSE)
    }
    
    // Add colored tint to ground near shadow
    p5.fill(rgb.r, rgb.g, rgb.b, 20 * intensity)
    const illuminationRadius = 150
    p5.ellipse(obstacle.x, groundY, illuminationRadius, 50)
  }

  const mousePressed = (p5: P5) => {
    // Check if clicking on a light source
    for (let i = 0; i < lightSources.length; i++) {
      const light = lightSources[i]
      const distance = p5.dist(p5.mouseX, p5.mouseY, light.x, light.y)
      if (distance < 30) {
        setDraggedElement({ type: 'light', index: i })
        updateLightSource(i, { isDragging: true })
        return
      }
    }

    // Check if clicking on obstacle
    if (p5.mouseX > obstacle.x - obstacle.width/2 && 
        p5.mouseX < obstacle.x + obstacle.width/2 &&
        p5.mouseY > obstacle.y - obstacle.height && 
        p5.mouseY < obstacle.y) {
      setDraggedElement({ type: 'obstacle' })
      updateObstacle({ isDragging: true })
    }
  }

  const mouseDragged = (p5: P5) => {
    if (draggedElement?.type === 'light' && draggedElement.index !== undefined) {
      const newX = Math.max(50, Math.min(200, p5.mouseX)) // Constrain to left area
      const newY = Math.max(50, Math.min(groundY - 50, p5.mouseY))
      updateLightSource(draggedElement.index, { x: newX, y: newY })
    } else if (draggedElement?.type === 'obstacle') {
      const newX = Math.max(350, Math.min(450, p5.mouseX)) // Constrain to center area
      const newY = Math.max(obstacle.height/2, Math.min(groundY - obstacle.height/2, p5.mouseY))
      updateObstacle({ x: newX, y: newY })
    }
  }

  const mouseReleased = (p5: P5) => {
    if (draggedElement?.type === 'light' && draggedElement.index !== undefined) {
      updateLightSource(draggedElement.index, { isDragging: false })
    } else if (draggedElement?.type === 'obstacle') {
      updateObstacle({ isDragging: false })
    }
    setDraggedElement(null)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <Sketch setup={setup} draw={draw} mousePressed={mousePressed} mouseDragged={mouseDragged} mouseReleased={mouseReleased} />
        </div>
      </div>

      <div className="lg:w-96 space-y-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Lichtquellen</h2>
          
          {lightSources.map((light, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-600">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-blue-400">Licht {index + 1}</h3>
                {lightSources.length > 1 && (
                  <button
                    onClick={() => removeLightSource(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Entfernen
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Position X: {Math.round(light.x)}
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={light.x}
                    onChange={(e) => updateLightSource(index, { x: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Position Y: {Math.round(light.y)}
                  </label>
                  <input
                    type="range"
                    min="50"
                    max={groundY - 50}
                    value={light.y}
                    onChange={(e) => updateLightSource(index, { y: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Farbe</label>
                  <input
                    type="color"
                    value={light.color}
                    onChange={(e) => updateLightSource(index, { color: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Intensität: {light.intensity.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={light.intensity}
                    onChange={(e) => updateLightSource(index, { intensity: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-400">Erweiterte Lichtquelle</label>
                  <input
                    type="checkbox"
                    checked={light.isExtended}
                    onChange={(e) => updateLightSource(index, { isExtended: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                </div>

                {light.isExtended && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Radius: {Math.round(light.radius)}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={light.radius}
                      onChange={(e) => updateLightSource(index, { radius: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {lightSources.length < 3 && (
            <button
              onClick={addLightSource}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              + Lichtquelle hinzufügen
            </button>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Hindernis-Eigenschaften</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Höhe: {obstacle.height}px
              </label>
              <input
                type="range"
                min="50"
                max="200"
                value={obstacle.height}
                onChange={(e) => updateObstacle({ height: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Breite: {obstacle.width}px
              </label>
              <input
                type="range"
                min="20"
                max="80"
                value={obstacle.width}
                onChange={(e) => updateObstacle({ width: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Position X: {Math.round(obstacle.x)}
              </label>
              <input
                type="range"
                min="350"
                max="450"
                value={obstacle.x}
                onChange={(e) => updateObstacle({ x: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Position Y: {Math.round(obstacle.y)}
              </label>
              <input
                type="range"
                min={obstacle.height/2}
                max={groundY - obstacle.height/2}
                value={obstacle.y}
                onChange={(e) => updateObstacle({ y: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-white">Über diese Simulation</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Diese Simulation zeigt, wie Lichtquellen Schatten erzeugen. Punktlichtquellen erzeugen
            scharfe Schatten (Kernschatten), während erweiterte Lichtquellen weiche Schatten mit einem
            Halbschatten-Bereich erzeugen. Experimentieren Sie mit mehreren Lichtern, um zu sehen,
            wie sich Schatten überlagern und interagieren.
          </p>
        </div>
      </div>
    </div>
  )
}