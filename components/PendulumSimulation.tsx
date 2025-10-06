'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import type P5 from 'react-p5/node_modules/@types/p5'

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false,
})

interface Pendulum {
  angle: number
  angularVelocity: number
  length: number
  mass: number
  damping: number
  color: string
  isDragging: boolean
  dragStartAngle?: number
}

export default function PendulumSimulation() {
  const [pendulums, setPendulums] = useState<Pendulum[]>([
    {
      angle: Math.PI / 4, // 45 degrees
      angularVelocity: 0,
      length: 200,
      mass: 1,
      damping: 0.995,
      color: '#3b82f6',
      isDragging: false,
    }
  ])
  const [gravity, setGravity] = useState<number>(0.5)
  const [isRunning, setIsRunning] = useState<boolean>(true)
  const [showTrail, setShowTrail] = useState<boolean>(true)
  const [trailLength, setTrailLength] = useState<number>(100)
  const [showForces, setShowForces] = useState<boolean>(false)
  const [timeScale, setTimeScale] = useState<number>(1.0)
  
  const [isMobile, setIsMobile] = useState(false)
  const canvasWidth = typeof window !== 'undefined' && window.innerWidth < 768 ? Math.min(400, window.innerWidth - 32) : 800
  const canvasHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? 400 : 600
  const pivotX = canvasWidth / 2
  const pivotY = 100
  const trailRef = useRef<{ x: number; y: number; time: number }[]>([])

  const addPendulum = () => {
    if (pendulums.length < 3) {
      setPendulums([
        ...pendulums,
        {
          angle: Math.PI / 6 + Math.random() * Math.PI / 3, // Random angle between 30-90 degrees
          angularVelocity: 0,
          length: 150 + Math.random() * 100, // Random length between 150-250
          mass: 0.5 + Math.random() * 1.5, // Random mass between 0.5-2.0
          damping: 0.99 + Math.random() * 0.005, // Random damping
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
          isDragging: false,
        }
      ])
    }
  }

  const removePendulum = (index: number) => {
    setPendulums(pendulums.filter((_, i) => i !== index))
  }

  const updatePendulum = (index: number, updates: Partial<Pendulum>) => {
    const newPendulums = [...pendulums]
    newPendulums[index] = { ...newPendulums[index], ...updates }
    setPendulums(newPendulums)
  }

  const resetPendulums = () => {
    setPendulums(pendulums.map(p => ({
      ...p,
      angle: Math.PI / 4,
      angularVelocity: 0,
      isDragging: false
    })))
    trailRef.current = []
  }

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const setup = (p5: P5, canvasParentRef: Element) => {
    const width = isMobile ? Math.min(400, window.innerWidth - 32) : 800
    const height = isMobile ? 400 : 600
    p5.createCanvas(width, height).parent(canvasParentRef)
  }

  const draw = (p5: P5) => {
    // Background
    p5.background(20, 20, 30)
    
    // Draw grid
    drawGrid(p5)
    
    // Draw pendulum system
    drawPendulumSystem(p5)
    
    // Draw trail
    if (showTrail) {
      drawTrail(p5)
    }
    
    // Draw forces if enabled
    if (showForces) {
      drawForces(p5)
    }
    
    // Draw UI elements
    drawUI(p5)
  }

  const drawGrid = (p5: P5) => {
    p5.stroke(40, 40, 50)
    p5.strokeWeight(1)
    
    // Vertical lines
    for (let x = 0; x < canvasWidth; x += 50) {
      p5.line(x, 0, x, canvasHeight)
    }
    
    // Horizontal lines
    for (let y = 0; y < canvasHeight; y += 50) {
      p5.line(0, y, canvasWidth, y)
    }
  }

  const drawPendulumSystem = (p5: P5) => {
    // Draw pivot point
    p5.fill(200, 200, 200)
    p5.noStroke()
    p5.ellipse(pivotX, pivotY, 12, 12)
    
    // Draw pivot support
    p5.fill(150, 150, 150)
    p5.rect(pivotX - 20, pivotY - 5, 40, 10)
    
    // Draw each pendulum
    pendulums.forEach((pendulum, index) => {
      if (pendulum.isDragging) return // Skip drawing while dragging
      
      // Calculate bob position
      const bobX = pivotX + Math.sin(pendulum.angle) * pendulum.length
      const bobY = pivotY + Math.cos(pendulum.angle) * pendulum.length
      
      // Draw string
      p5.stroke(100, 100, 100)
      p5.strokeWeight(2)
      p5.line(pivotX, pivotY, bobX, bobY)
      
      // Draw bob
      const bobSize = 15 + pendulum.mass * 5
      p5.fill(pendulum.color)
      p5.noStroke()
      p5.ellipse(bobX, bobY, bobSize, bobSize)
      
      // Draw bob outline
      p5.stroke(255, 255, 255, 100)
      p5.strokeWeight(1)
      p5.noFill()
      p5.ellipse(bobX, bobY, bobSize, bobSize)
      
      // Draw angle indicator
      if (pendulums.length === 1) {
        drawAngleIndicator(p5, pendulum.angle)
      }
      
      // Draw pendulum label
      if (pendulums.length > 1) {
        p5.fill(255)
        p5.noStroke()
        p5.textSize(12)
        p5.textAlign(p5.CENTER)
        p5.text(`P${index + 1}`, bobX, bobY - bobSize/2 - 5)
      }
    })
  }

  const drawAngleIndicator = (p5: P5, angle: number) => {
    const arcRadius = 80
    const startAngle = -Math.PI/2
    const endAngle = -Math.PI/2 + angle
    
    p5.stroke(255, 255, 255, 150)
    p5.strokeWeight(2)
    p5.noFill()
    p5.arc(pivotX, pivotY, arcRadius * 2, arcRadius * 2, startAngle, endAngle)
    
    // Draw angle text
    p5.fill(255, 255, 255, 200)
    p5.noStroke()
    p5.textSize(14)
    p5.textAlign(p5.CENTER)
    const angleDegrees = Math.round(angle * 180 / Math.PI)
    p5.text(`${angleDegrees}°`, pivotX + 60, pivotY - 20)
  }

  const drawTrail = (p5: P5) => {
    if (trailRef.current.length < 2) return
    
    p5.stroke(255, 255, 255, 100)
    p5.strokeWeight(1)
    p5.noFill()
    
    p5.beginShape()
    for (let i = 0; i < trailRef.current.length; i++) {
      const point = trailRef.current[i]
      const alpha = (i / trailRef.current.length) * 100
      p5.stroke(255, 255, 255, alpha)
      p5.vertex(point.x, point.y)
    }
    p5.endShape()
  }

  const drawForces = (p5: P5) => {
    pendulums.forEach((pendulum) => {
      if (pendulum.isDragging) return
      
      const bobX = pivotX + Math.sin(pendulum.angle) * pendulum.length
      const bobY = pivotY + Math.cos(pendulum.angle) * pendulum.length
      
      // Gravity force (downward)
      const gravityForce = gravity * pendulum.mass * 50
      p5.stroke(255, 0, 0)
      p5.strokeWeight(3)
      p5.line(bobX, bobY, bobX, bobY + gravityForce)
      
      // Tension force (toward pivot)
      const tensionForce = 30
      const tensionX = pivotX - bobX
      const tensionY = pivotY - bobY
      const tensionLength = Math.sqrt(tensionX * tensionX + tensionY * tensionY)
      const tensionScale = tensionForce / tensionLength
      
      p5.stroke(0, 255, 0)
      p5.strokeWeight(3)
      p5.line(bobX, bobY, bobX + tensionX * tensionScale, bobY + tensionY * tensionScale)
      
      // Velocity vector
      const velocityScale = 20
      p5.stroke(0, 0, 255)
      p5.strokeWeight(2)
      const velocityX = Math.cos(pendulum.angle) * pendulum.angularVelocity * velocityScale
      const velocityY = -Math.sin(pendulum.angle) * pendulum.angularVelocity * velocityScale
      p5.line(bobX, bobY, bobX + velocityX, bobY + velocityY)
    })
  }

  const drawUI = (p5: P5) => {
    // Draw control hints
    p5.fill(200, 200, 200, 150)
    p5.noStroke()
    p5.textSize(12)
    p5.textAlign(p5.LEFT)
    p5.text('Ziehen Sie das Pendel, um es zu starten', 10, canvasHeight - 30)
    p5.text('Leertaste: Start/Stopp | R: Reset', 10, canvasHeight - 15)
  }

  const updatePhysics = (p5: P5) => {
    if (!isRunning) return
    
    pendulums.forEach((pendulum, index) => {
      if (pendulum.isDragging) return
      
      // Calculate angular acceleration
      const angularAcceleration = -(gravity * Math.sin(pendulum.angle)) / pendulum.length
      
      // Update angular velocity with damping
      const newAngularVelocity = (pendulum.angularVelocity + angularAcceleration * timeScale) * pendulum.damping
      
      // Update angle
      const newAngle = pendulum.angle + newAngularVelocity * timeScale
      
      updatePendulum(index, {
        angle: newAngle,
        angularVelocity: newAngularVelocity
      })
      
      // Add to trail
      const bobX = pivotX + Math.sin(newAngle) * pendulum.length
      const bobY = pivotY + Math.cos(newAngle) * pendulum.length
      
      trailRef.current.push({ x: bobX, y: bobY, time: p5.millis() })
      
      // Limit trail length
      if (trailRef.current.length > trailLength) {
        trailRef.current.shift()
      }
    })
  }

  const mousePressed = (p5: P5) => {
    // Check if clicking on any pendulum bob
    for (let i = 0; i < pendulums.length; i++) {
      const pendulum = pendulums[i]
      const bobX = pivotX + Math.sin(pendulum.angle) * pendulum.length
      const bobY = pivotY + Math.cos(pendulum.angle) * pendulum.length
      const bobSize = 15 + pendulum.mass * 5
      const touchRadius = isMobile ? bobSize + 20 : bobSize + 10
      
      const distance = p5.dist(p5.mouseX, p5.mouseY, bobX, bobY)
      if (distance < touchRadius) {
        updatePendulum(i, { 
          isDragging: true,
          dragStartAngle: pendulum.angle
        })
        return
      }
    }
  }

  const touchStarted = (p5: P5) => {
    // Handle touch events for mobile
    if (p5.touches.length > 0) {
      const touch = p5.touches[0]
      p5.mouseX = touch.x
      p5.mouseY = touch.y
      mousePressed(p5)
    }
    return false // Prevent default touch behavior
  }

  const mouseDragged = (p5: P5) => {
    const draggingPendulum = pendulums.find(p => p.isDragging)
    if (!draggingPendulum) return
    
    const index = pendulums.findIndex(p => p.isDragging)
    const dx = p5.mouseX - pivotX
    const dy = p5.mouseY - pivotY
    const newAngle = Math.atan2(dx, dy)
    
    updatePendulum(index, { angle: newAngle })
  }

  const touchMoved = (p5: P5) => {
    // Handle touch drag for mobile
    if (p5.touches.length > 0) {
      const touch = p5.touches[0]
      p5.mouseX = touch.x
      p5.mouseY = touch.y
      mouseDragged(p5)
    }
    return false // Prevent default touch behavior
  }

  const mouseReleased = (p5: P5) => {
    const draggingPendulum = pendulums.find(p => p.isDragging)
    if (!draggingPendulum) return
    
    const index = pendulums.findIndex(p => p.isDragging)
    updatePendulum(index, { 
      isDragging: false,
      angularVelocity: 0 // Reset velocity when released
    })
  }

  const touchEnded = (p5: P5) => {
    // Handle touch end for mobile
    mouseReleased(p5)
    return false // Prevent default touch behavior
  }

  const keyPressed = (p5: P5) => {
    if (p5.key === ' ') {
      setIsRunning(!isRunning)
    } else if (p5.key === 'r' || p5.key === 'R') {
      resetPendulums()
    }
  }

  // Update physics in the draw loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning) {
        // This will be called by the p5 draw function
      }
    }, 16) // ~60 FPS
    
    return () => clearInterval(interval)
  }, [isRunning])

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <div className="bg-gray-800 rounded-xl p-2 md:p-4 border border-gray-700">
          <Sketch 
            setup={setup} 
            draw={(p5) => {
              draw(p5)
              updatePhysics(p5)
            }} 
            mousePressed={mousePressed} 
            mouseDragged={mouseDragged} 
            mouseReleased={mouseReleased}
            touchStarted={touchStarted}
            touchMoved={touchMoved}
            touchEnded={touchEnded}
            keyPressed={keyPressed}
          />
        </div>
      </div>

      <div className="lg:w-96 space-y-4 md:space-y-6">
        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Simulation</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Simulation läuft</label>
              <input
                type="checkbox"
                checked={isRunning}
                onChange={(e) => setIsRunning(e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Spur anzeigen</label>
              <input
                type="checkbox"
                checked={showTrail}
                onChange={(e) => setShowTrail(e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Kräfte anzeigen</label>
              <input
                type="checkbox"
                checked={showForces}
                onChange={(e) => setShowForces(e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Zeitgeschwindigkeit: {timeScale.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={timeScale}
                onChange={(e) => setTimeScale(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Spur-Länge: {trailLength}
              </label>
              <input
                type="range"
                min="20"
                max="200"
                value={trailLength}
                onChange={(e) => setTrailLength(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Schwerkraft: {gravity.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={gravity}
                onChange={(e) => setGravity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  isRunning 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={resetPendulums}
                className="flex-1 py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Pendel</h2>
          
          {pendulums.map((pendulum, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-600">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-blue-400">Pendel {index + 1}</h3>
                {pendulums.length > 1 && (
                  <button
                    onClick={() => removePendulum(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Entfernen
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Länge: {Math.round(pendulum.length)}px
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={pendulum.length}
                    onChange={(e) => updatePendulum(index, { length: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Masse: {pendulum.mass.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={pendulum.mass}
                    onChange={(e) => updatePendulum(index, { mass: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Farbe</label>
                  <input
                    type="color"
                    value={pendulum.color}
                    onChange={(e) => updatePendulum(index, { color: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Dämpfung: {pendulum.damping.toFixed(3)}
                  </label>
                  <input
                    type="range"
                    min="0.95"
                    max="1.0"
                    step="0.001"
                    value={pendulum.damping}
                    onChange={(e) => updatePendulum(index, { damping: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="text-xs text-gray-500">
                  <p>Winkel: {Math.round(pendulum.angle * 180 / Math.PI)}°</p>
                  <p>Geschwindigkeit: {pendulum.angularVelocity.toFixed(3)} rad/s</p>
                </div>
              </div>
            </div>
          ))}

          {pendulums.length < 3 && (
            <button
              onClick={addPendulum}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              + Pendel hinzufügen
            </button>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-white">Steuerung</h3>
          <div className="text-sm text-gray-400 space-y-2">
            <p><strong className="text-blue-400">Maus/Touch:</strong> Pendel ziehen zum Starten</p>
            <p><strong className="text-green-400">Leertaste:</strong> Simulation starten/stoppen</p>
            <p><strong className="text-yellow-400">R-Taste:</strong> Alle Pendel zurücksetzen</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-white">Über diese Simulation</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            Diese Simulation zeigt die Physik eines Fadenpendels. Ein Fadenpendel ist ein klassisches 
            Beispiel für harmonische Schwingung, bei der die Rückstellkraft proportional zur Auslenkung ist.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            <strong className="text-yellow-400">Physik:</strong> Die Schwingungsdauer hängt nur von der 
            Länge des Pendels und der Schwerkraft ab, nicht von der Masse oder der Anfangsauslenkung 
            (für kleine Winkel).
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            <strong className="text-blue-400">Interaktion:</strong> Ziehen Sie das Pendel, um es zu starten. 
            Experimentieren Sie mit verschiedenen Längen, Massen und Dämpfungswerten, um zu sehen, 
            wie sich das Schwingungsverhalten ändert.
          </p>
        </div>
      </div>
    </div>
  )
}