'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type p5Types from 'p5'

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
}

export default function LightAndShadowSimulation() {
  const [lightSources, setLightSources] = useState<LightSource[]>([
    { x: 200, y: 150, color: '#ffffff', intensity: 1.0, isExtended: false, radius: 20 },
  ])
  const [stickHeight, setStickHeight] = useState(150)
  const [stickX, setStickX] = useState(400)
  const [shadowData, setShadowData] = useState<any>(null)

  const canvasWidth = 800
  const canvasHeight = 600
  const groundY = 500

  const addLightSource = () => {
    if (lightSources.length < 3) {
      setLightSources([
        ...lightSources,
        {
          x: Math.random() * (canvasWidth - 100) + 50,
          y: Math.random() * 200 + 100,
          color: '#ffffff',
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

  // Fetch shadow calculations from Python backend
  useEffect(() => {
    const fetchShadowData = async () => {
      try {
        const response = await fetch('/api/shadow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lights: lightSources,
            stickX,
            stickHeight,
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
  }, [lightSources, stickHeight, stickX])

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

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(canvasWidth, canvasHeight).parent(canvasParentRef)
  }

  const draw = (p5: p5Types) => {
    // Background - dark scene
    p5.background(20, 20, 30)

    // Draw ground
    p5.fill(40, 40, 50)
    p5.noStroke()
    p5.rect(0, groundY, canvasWidth, canvasHeight - groundY)

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

    // Draw stick
    p5.stroke(100, 80, 60)
    p5.strokeWeight(8)
    p5.line(stickX, groundY, stickX, groundY - stickHeight)
    
    // Draw stick base
    p5.fill(100, 80, 60)
    p5.noStroke()
    p5.ellipse(stickX, groundY, 12, 8)

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
        p5.ellipse(light.x, light.y, 16, 16)
        
        // Glow effect
        for (let i = 3; i > 0; i--) {
          p5.fill(rgb.r, rgb.g, rgb.b, 40 * light.intensity / i)
          p5.ellipse(light.x, light.y, 16 + i * 15, 16 + i * 15)
        }
      }
      
      // Draw label
      p5.fill(255)
      p5.noStroke()
      p5.textSize(12)
      p5.textAlign(p5.CENTER)
      p5.text(`L${index + 1}`, light.x, light.y - 30)
    })

    // UI hints
    p5.fill(150)
    p5.textSize(11)
    p5.textAlign(p5.LEFT)
    p5.text('Adjust parameters below to see real-time changes', 10, canvasHeight - 10)
  }

  const drawShadowFromPoint = (
    p5: p5Types,
    lightX: number,
    lightY: number,
    rgb: { r: number; g: number; b: number },
    intensity: number
  ) => {
    // Calculate shadow endpoints on the ground
    const dx = stickX - lightX
    const dy = groundY - lightY
    
    if (dy <= 0) return // Light below ground
    
    // Shadow extends from stick base in the direction away from light
    const shadowLength = (stickHeight * Math.abs(dx)) / dy
    const shadowEndX = stickX + shadowLength
    
    // Draw shadow as a quad
    p5.fill(0, 0, 0, 80 * intensity)
    p5.noStroke()
    p5.beginShape()
    p5.vertex(stickX - 4, groundY)
    p5.vertex(stickX + 4, groundY)
    p5.vertex(shadowEndX + 8, groundY)
    p5.vertex(shadowEndX - 8, groundY)
    p5.endShape(p5.CLOSE)
    
    // Add colored tint to ground near shadow
    p5.fill(rgb.r, rgb.g, rgb.b, 20 * intensity)
    const illuminationRadius = 150
    p5.ellipse(stickX, groundY, illuminationRadius, 50)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <Sketch setup={setup} draw={draw} />
        </div>
      </div>

      <div className="lg:w-96 space-y-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Light Sources</h2>
          
          {lightSources.map((light, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-600">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-blue-400">Light {index + 1}</h3>
                {lightSources.length > 1 && (
                  <button
                    onClick={() => removeLightSource(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
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
                    max={canvasWidth - 50}
                    value={light.x}
                    onChange={(e) => updateLightSource(index, { x: Number(e.target.value) })}
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
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Color</label>
                  <input
                    type="color"
                    value={light.color}
                    onChange={(e) => updateLightSource(index, { color: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Intensity: {light.intensity.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={light.intensity}
                    onChange={(e) => updateLightSource(index, { intensity: Number(e.target.value) })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-400">Extended Light Source</label>
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
              + Add Light Source
            </button>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Object Properties</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Stick Height: {stickHeight}px
              </label>
              <input
                type="range"
                min="50"
                max="250"
                value={stickHeight}
                onChange={(e) => setStickHeight(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Stick Position: {stickX}px
              </label>
              <input
                type="range"
                min="100"
                max={canvasWidth - 100}
                value={stickX}
                onChange={(e) => setStickX(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-white">About This Simulation</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            This simulation demonstrates how light sources create shadows. Point light sources create
            sharp shadows (umbra), while extended light sources create soft shadows with a penumbra
            region. Experiment with multiple lights to see how shadows overlap and interact.
          </p>
        </div>
      </div>
    </div>
  )
}
