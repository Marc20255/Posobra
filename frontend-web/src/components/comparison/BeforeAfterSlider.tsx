'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Photo {
  id: number
  photo_url: string
  description?: string
  is_before: boolean
}

interface BeforeAfterSliderProps {
  beforePhotos: Photo[]
  afterPhotos: Photo[]
}

export function BeforeAfterSlider({ beforePhotos, afterPhotos }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [currentPair, setCurrentPair] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const maxPairs = Math.max(beforePhotos.length, afterPhotos.length)
  const currentBefore = beforePhotos[currentPair] || beforePhotos[0]
  const currentAfter = afterPhotos[currentPair] || afterPhotos[0]

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    updateSliderPosition(e.clientX)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return
    updateSliderPosition(e.clientX)
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const updateSliderPosition = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }

  useEffect(() => {
    if (isDragging.current) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging.current])

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }

  if (!currentBefore && !currentAfter) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma foto disponível para comparação</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controles de navegação */}
      {maxPairs > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPair(Math.max(0, currentPair - 1))}
            disabled={currentPair === 0}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600">
            {currentPair + 1} de {maxPairs}
          </span>
          <button
            onClick={() => setCurrentPair(Math.min(maxPairs - 1, currentPair + 1))}
            disabled={currentPair === maxPairs - 1}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Slider de Comparação */}
      <div
        ref={containerRef}
        className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg cursor-col-resize"
        onMouseDown={handleMouseDown}
        onTouchMove={handleTouchMove}
        onTouchStart={(e) => {
          const touch = e.touches[0]
          updateSliderPosition(touch.clientX)
        }}
      >
        {/* Foto Depois (fundo) */}
        {currentAfter && (
          <div className="absolute inset-0">
            <Image
              src={currentAfter.photo_url}
              alt={currentAfter.description || 'Foto depois'}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded">
              DEPOIS
            </div>
          </div>
        )}

        {/* Foto Antes (sobreposta) */}
        {currentBefore && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <Image
              src={currentBefore.photo_url}
              alt={currentBefore.description || 'Foto antes'}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded">
              ANTES
            </div>
          </div>
        )}

        {/* Linha divisória e controle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-gray-400 rounded"></div>
              <div className="w-1 h-4 bg-gray-400 rounded"></div>
            </div>
          </div>
        </div>

        {/* Instrução */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black bg-opacity-50 text-white text-sm rounded">
          Arraste para comparar
        </div>
      </div>

      {/* Descrições */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {currentBefore && (
          <div className="bg-yellow-50 p-3 rounded">
            <p className="font-semibold text-yellow-900 mb-1">Antes</p>
            {currentBefore.description && (
              <p className="text-yellow-800">{currentBefore.description}</p>
            )}
          </div>
        )}
        {currentAfter && (
          <div className="bg-green-50 p-3 rounded">
            <p className="font-semibold text-green-900 mb-1">Depois</p>
            {currentAfter.description && (
              <p className="text-green-800">{currentAfter.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

