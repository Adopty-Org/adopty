// components/ui/Carousel.js

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

const Carousel = ({ photos, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isAnimating, setIsAnimating] = useState(false)

  // Navigation avec les flèches du clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === 'Escape') onClose()
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  const prevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
    setTimeout(() => setIsAnimating(false), 300)
  }

  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsAnimating(false), 300)
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Conteneur principal */}
      <div 
        className="relative max-w-7xl w-full mx-4 h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 text-white">
          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
            <span className="font-['Plus_Jakarta_Sans'] font-bold">
              {currentIndex + 1} / {photos.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="bg-black/50 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70 transition-all hover:scale-110"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Image principale */}
        <div className="flex-1 relative flex items-center justify-center min-h-0">
          <button
            onClick={prevSlide}
            className="absolute left-4 z-10 bg-black/50 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center hover:bg-black/70 transition-all hover:scale-110 disabled:opacity-50"
            disabled={isAnimating}
          >
            <span className="material-symbols-outlined text-white text-3xl">chevron_left</span>
          </button>

          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={photos[currentIndex]?.Url || photos[currentIndex]}
              alt={`Photo ${currentIndex + 1}`}
              className={`max-w-full max-h-full object-contain transition-all duration-300 ${
                isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            />
          </div>

          <button
            onClick={nextSlide}
            className="absolute right-4 z-10 bg-black/50 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center hover:bg-black/70 transition-all hover:scale-110"
            disabled={isAnimating}
          >
            <span className="material-symbols-outlined text-white text-3xl">chevron_right</span>
          </button>
        </div>

        {/* Miniatures */}
        {photos.length > 1 && (
          <div className="mt-4 overflow-x-auto pb-2">
            <div className="flex gap-2 justify-center min-w-min">
              {photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (isAnimating) return
                    setIsAnimating(true)
                    setCurrentIndex(idx)
                    setTimeout(() => setIsAnimating(false), 300)
                  }}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentIndex 
                      ? 'border-primary scale-110 shadow-lg' 
                      : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <img
                    src={photo?.Url || photo}
                    alt={`Miniature ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === currentIndex && (
                    <div className="absolute inset-0 bg-primary/20" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default Carousel