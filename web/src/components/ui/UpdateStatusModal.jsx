// components/UpdateStatusModal.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const UpdateStatusModal = ({ isOpen, onClose, order, onUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  // Définition des statuts possibles
  const statusOptions = [
    { value: 1, label: 'Disponible', color: 'bg-primary-fixed' },
    { value: 2, label: 'En attente', color: 'bg-surface-container' },
    { value: 3, label: 'Adopté', color: 'bg-success-container' },
    { value: 4, label: 'Validé', color: 'bg-tertiary-fixed' },
    { value: 5, label: 'Rejeté', color: 'bg-error-container' },
    { value: 6, label: 'En cours', color: 'bg-secondary-fixed' },
    { value: 7, label: 'Livré', color: 'bg-tertiary-fixed' },
    { value: 8, label: 'Payée', color: 'bg-primary-fixed' },
    { value: 9, label: 'Expédiée', color: 'bg-secondary-fixed' },
    { value: 10, label: 'Livrée', color: 'bg-tertiary-fixed' }
  ]

  useEffect(() => {
    if (!isOpen) {
      setSelectedStatus(null)
    }
  }, [isOpen])

  // Pré-sélectionner le statut actuel quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && order) {
      setSelectedStatus(order?.statut?.Id)
    }
  }, [isOpen, order])

  const handleSubmit = async () => {
    if (!selectedStatus || selectedStatus === order?.statut?.Id) {
      if (selectedStatus === order?.statut?.Id) {
        alert('Veuillez sélectionner un statut différent')
      } else {
        alert('Veuillez sélectionner un statut')
      }
      return
    }

    setLoading(true)
    await onUpdate(order.Id, selectedStatus)
    setLoading(false)
    onClose()
  }

  // Trouver le label du statut actuel
  const currentStatusLabel = statusOptions.find(s => s.value === order?.statut?.Id)?.label || order?.statut?.Statut

  return (
    <AnimatePresence>
      {isOpen && order && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl border-4 border-black max-w-md w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - fixed */}
            <div className="px-6 py-4 border-b-4 border-black bg-primary flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">sync</span>
                  Changer le statut
                </h2>
                <button onClick={onClose} className="text-white hover:bg-white/10 rounded-lg p-1 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Content - scrollable */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Order info */}
              <div className="bg-surface-container border-2 border-black rounded-lg p-3">
                <p className="text-xs text-on-surface-variant">Commande concernée</p>
                <p className="font-bold text-lg">#{order.Id}</p>
                <div className="space-y-1 mt-2">
                  {order?.lines?.map((line, idx) => (
                    <p key={idx} className="text-xs">
                      {line.Quantite}x {line.ProduitNom}
                    </p>
                  ))}
                </div>
                <p className="text-sm font-extrabold text-primary mt-2">
                  Total: {Number(order.Total_prix).toFixed(2)} DZD
                </p>
              </div>

              {/* Status actuel */}
              <div className="bg-surface-container-low border-2 border-black rounded-lg p-3">
                <p className="text-xs text-on-surface-variant mb-1">Statut actuel</p>
                <span className={`px-3 py-1 rounded-full text-sm font-extrabold border border-black inline-block
                  ${order?.statut?.Id === 8 ? 'bg-primary-fixed' : 
                    order?.statut?.Id === 9 ? 'bg-secondary-fixed' : 
                    order?.statut?.Id === 10 || order?.statut?.Id === 7 ? 'bg-tertiary-fixed' : 
                    order?.statut?.Id === 3 ? 'bg-success-container' :
                    order?.statut?.Id === 5 ? 'bg-error-container' :
                    'bg-surface-container'}`}>
                  {currentStatusLabel}
                </span>
              </div>

              {/* Nouveau statut */}
              <div>
                <label className="block text-sm font-extrabold mb-2">Nouveau statut *</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedStatus(option.value)}
                      disabled={option.value === order?.statut?.Id}
                      className={`w-full text-left p-3 border-2 border-black rounded-lg transition-all
                        ${selectedStatus === option.value 
                          ? `${option.color} border-l-8 border-l-primary` 
                          : 'bg-white hover:bg-surface-container'
                        }
                        ${option.value === order?.statut?.Id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-extrabold">{option.label}</p>
                          {option.value === order?.statut?.Id && (
                            <p className="text-xs text-on-surface-variant mt-1">(Statut actuel)</p>
                          )}
                        </div>
                        {selectedStatus === option.value && (
                          <span className="material-symbols-outlined">check_circle</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer - fixed */}
            <div className="px-6 py-4 border-t-4 border-black bg-surface-container flex-shrink-0 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border-2 border-black bg-white font-extrabold text-sm rounded-lg hover:bg-surface transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedStatus || selectedStatus === order?.statut?.Id}
                className="px-4 py-2 border-2 border-black bg-primary text-white font-extrabold text-sm rounded-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  'Chargement...'
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">save</span>
                    Appliquer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UpdateStatusModal