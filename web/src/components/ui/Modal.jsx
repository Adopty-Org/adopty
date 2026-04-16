import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${sizes[size]} bg-[#fbfbe2] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b-4 border-black bg-surface-container">
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-primary">{title}</h2>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center border-2 border-black rounded-lg hover:bg-error hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal
