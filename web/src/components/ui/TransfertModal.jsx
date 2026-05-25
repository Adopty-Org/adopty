// components/TransfertModal.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TransfertModal = ({ isOpen, onClose, animal, refuges, onSubmit }) => {
  const [selectedRefuge, setSelectedRefuge] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setSelectedRefuge('')
      setCommentaire('')
      setSearchTerm('')
    }
  }, [isOpen])

  const filteredRefuges = refuges?.filter(refuge => 
    refuge.Id !== animal?.IdRefuge && // Exclure son propre refuge
    (refuge.Nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     refuge.Ville?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  const handleSubmit = async () => {
    if (!selectedRefuge) {
      alert('Veuillez sélectionner un refuge de destination')
      return
    }

    setLoading(true)
    await onSubmit({
      idAnimal: animal.Id,
      idRefugeCible: selectedRefuge,
      commentaireDepart: commentaire
    })
    setLoading(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white rounded-xl border-4 border-black max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b-4 border-black bg-primary flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="font-['Chewy'] text-2xl text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">swap_horiz</span>
                  Demander un transfert
                </h2>
                <button onClick={onClose} className="text-white hover:bg-white/10 rounded-lg p-1 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Animal info */}
              <div className="bg-surface-container border-2 border-black rounded-lg p-3">
                <p className="text-xs text-on-surface-variant">Animal à transférer</p>
                <p className="font-bold text-lg">{animal?.Nom}</p>
                <p className="text-sm">{animal?.Race?.Espece?.Nom} - {animal?.Race?.Nom}</p>
              </div>

              {/* Search refuge */}
              <div>
                <label className="block text-sm font-bold mb-2">Refuge de destination *</label>
                <input
                  type="text"
                  placeholder="Rechercher un refuge par nom ou ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-2 border-black rounded-lg p-2 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                <div className="border-2 border-black rounded-lg max-h-48 overflow-y-auto">
                  {filteredRefuges.length === 0 ? (
                    <div className="p-4 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl mb-2">search_off</span>
                      <p className="text-sm">Aucun refuge trouvé</p>
                    </div>
                  ) : (
                    filteredRefuges.map(refuge => (
                      <button
                        key={refuge?.Id}
                        onClick={() => setSelectedRefuge(refuge?.Id)}
                        className={`w-full text-left p-3 border-b border-black last:border-b-0 transition-colors
                          ${selectedRefuge === refuge?.Id 
                            ? 'bg-primary-fixed border-l-4 border-l-primary' 
                            : 'hover:bg-surface-container'}`}
                      >
                        <p className="font-bold">{refuge?.Nom}</p>
                        <p className="text-xs text-on-surface-variant">
                          {refuge?.Ville}, {refuge?.CodePostal}
                        </p>
                        {refuge?.Telephone && (
                          <p className="text-xs text-on-surface-variant mt-1">
                            📞 {refuge?.Telephone}
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-bold mb-2">Message pour le refuge (optionnel)</label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Expliquez pourquoi vous souhaitez transférer cet animal..."
                  className="w-full border-2 border-black rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="4"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t-4 border-black bg-surface-container flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border-2 border-black bg-white font-bold text-sm rounded-lg hover:bg-surface transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedRefuge}
                className="px-4 py-2 border-2 border-black bg-primary text-white font-bold text-sm rounded-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Chargement...' : (
                  <>
                    <span className="material-symbols-outlined text-base">send</span>
                    Envoyer la demande
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

export default TransfertModal