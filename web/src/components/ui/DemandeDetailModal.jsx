// components/DemandeDetailModal.jsx
/*import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimalCard from './AnimalCard'

const DemandeDetailModal = ({ demande, onClose, onAccept, onRefuse, isOpen }) => {
  const [loading, setLoading] = useState(false)
  const [commentaireRetour, setCommentaireRetour] = useState('')
  const [action, setAction] = useState(null) // 'accept' ou 'refuse'

  console.log('DemandeDetailModal rendu avec demande :', demande)

  const handleAccept = async () => {
    setLoading(true)
    await onAccept(demande.Id, commentaireRetour)
    setLoading(false)
    onClose()
    setCommentaireRetour('')
    setAction(null)
  }

  const handleRefuse = async () => {
    setLoading(true)
    await onRefuse(demande.Id, commentaireRetour)
    setLoading(false)
    onClose()
    setCommentaireRetour('')
    setAction(null)
  }

  const openAcceptModal = () => {
    setAction('accept')
  }

  const openRefuseModal = () => {
    setAction('refuse')
  }

  const cancelAction = () => {
    setAction(null)
    setCommentaireRetour('')
  }

  let infos = {}
  try { infos = JSON.parse(demande.utilisateur || '{}') } catch {}

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {action == null && (
            <>
            {/* Header * /}
            <div className="px-6 py-4 border-b-4 border-black bg-primary flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="font-['Chewy'] text-2xl text-white">
                  Demande d'adoption
                </h2>
                <button onClick={onClose} className="text-white hover:bg-white/10 rounded-lg p-1 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Content - scrollable * /}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Section Candidat * /}
              <div className="bg-surface-container border-2 border-black rounded-lg p-4">
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined">person</span>
                  Informations du candidat
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-on-surface-variant text-xs">Nom complet</p>
                    <p className="font-bold">{demande?.utilisateur?.Prenom /*infos.Prenom* /} {demande?.utilisateur?.Nom /*infos.Nom* /}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs">Email</p>
                    <p className="font-bold">{demande?.utilisateur?.AddresseEmail /*infos.email* /}</p>
                  </div>
                  {demande?.utilisateur?.Telephone && (
                    <div>
                      <p className="text-on-surface-variant text-xs">Téléphone</p>
                      <p className="font-bold">{demande?.utilisateur?.Telephone}</p>
                    </div>
                  )}
                  {demande?.utilisateur?.Addresse && (
                    <div className="col-span-2">
                      <p className="text-on-surface-variant text-xs">Adresse</p>
                      <p className="font-bold">{demande?.utilisateur?.Addresse}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Animal * /}
              <div className="bg-surface-container border-2 border-black rounded-lg p-4">
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined">pets</span>
                  Informations de l'animal
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-on-surface-variant text-xs">Nom</p>
                    <p className="font-bold">{demande?.animal?.Nom || `Animal #${demande.IdAnimal}`}</p>
                  </div>
                  {demande?.animal?.Race && (
                    <div>
                      <p className="text-on-surface-variant text-xs">Race</p>
                      <p className="font-bold">{demande?.animal?.Race?.Nom}</p>
                    </div>
                  )}
                  {demande?.animal?.Age && (
                    <div>
                      <p className="text-on-surface-variant text-xs">Âge</p>
                      <p className="font-bold">{demande?.animal?.Age}</p>
                    </div>
                  )}

                  <AnimalCard animal={demande?.animal} />
                </div>
              </div>

              {/* Section Questionnaire d'adoption * /}
              <div className="bg-surface-container border-2 border-black rounded-lg p-4">
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined">quiz</span>
                  Questionnaire d'adoption
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-on-surface-variant text-xs">Type de logement</p>
                      <p className="font-bold capitalize">{demande.TypeLogement || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-xs">Jardin</p>
                      <p className="font-bold">{demande.Jardin ? 'Oui' : 'Non'}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-xs">Autres animaux</p>
                      <p className="font-bold">{demande.Animaux ? 'Oui' : 'Non'}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-xs">Enfants</p>
                      <p className="font-bold">{demande.Enfants ? 'Oui' : 'Non'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs">Disponibilité</p>
                    <p className="font-bold">{demande.Disponibilite || 'Non renseignée'}</p>
                  </div>
                  {demande.ComentaireDepart && (
                    <div>
                      <p className="text-on-surface-variant text-xs">Message / Motivation</p>
                      <p className="italic border-l-4 border-primary pl-3 mt-1">{demande.ComentaireDepart}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Détails de la demande * /}
              <div className="bg-surface-container border-2 border-black rounded-lg p-4">
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined">info</span>
                  Détails de la demande
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-on-surface-variant text-xs">Date de demande</p>
                    <p className="font-bold">{new Date(demande.DateDemande).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs">Statut actuel</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-extrabold border border-black 
                      ${demande.Statut === 'En attente' ? 'bg-secondary-fixed' :
                        demande.Statut === 'Acceptée' ? 'bg-primary-fixed' : 'bg-error-container text-on-error-container'}`}>
                      {demande.Statut}
                    </span>
                  </div>
                </div>
                {demande.CommentaireRetour && (
                  <div className="mt-3 pt-3 border-t border-outline">
                    <p className="text-on-surface-variant text-xs">Commentaire du refuge</p>
                    <p className="text-sm mt-1">{demande.CommentaireRetour}</p>
                  </div>
                )}
              </div>
            </div>

              {/* Footer Actions * /}
              <div className="px-6 py-4 border-t-4 border-black bg-surface-container flex justify-end gap-3 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border-2 border-black bg-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm rounded-lg hover:bg-surface transition-all"
                >
                  Retour
                </button>
                {demande?.statut?.Statut === 'En cours' && (
                  <>
                    <button
                      onClick={openRefuseModal}
                      className="px-4 py-2 border-2 border-black bg-error text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                      Refuser
                    </button>
                    <button
                      onClick={openAcceptModal}
                      className="px-4 py-2 border-2 border-black bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">check</span>
                      Accepter
                    </button>
                  </>
                )}
              </div>
              </>
            )}
          

          {/* Modal de confirmation avec commentaire * /}
          <AnimatePresence>
            {action && (
              <>
                
                  <div className="px-6 py-4 border-b-4 border-black bg-primary">
                    <h2 className="font-['Chewy'] text-xl text-white">
                      {action === 'accept' ? 'Accepter la demande' : 'Refuser la demande'}
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm">
                      {action === 'accept' 
                        ? 'Vous allez accepter cette demande d\'adoption. Vous pouvez ajouter un commentaire (optionnel) :'
                        : 'Vous allez refuser cette demande d\'adoption. Vous pouvez ajouter un commentaire pour expliquer votre décision :'}
                    </p>
                    <textarea
                      value={commentaireRetour}
                      onChange={(e) => setCommentaireRetour(e.target.value)}
                      placeholder="Votre commentaire..."
                      className="w-full border-2 border-black rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      rows="4"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={cancelAction}
                        className="px-4 py-2 border-2 border-black bg-white font-bold text-sm rounded-lg"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={action === 'accept' ? handleAccept : handleRefuse}
                        disabled={loading}
                        className={`px-4 py-2 border-2 border-black text-white font-bold text-sm rounded-lg flex items-center gap-2
                          ${action === 'accept' ? 'bg-primary' : 'bg-error'}`}
                      >
                        {loading ? 'Chargement...' : (action === 'accept' ? 'Accepter' : 'Refuser')}
                      </button>
                    </div>
                  </div>
                
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}

export default DemandeDetailModal*/
// components/DemandeDetailModal.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimalCard from './AnimalCard'

const DemandeDetailModal = ({ 
  demande, 
  onClose, 
  onAccept, 
  onRefuse, 
  isOpen,
  type = 'adoption' // 'adoption' ou 'transfert'
}) => {
  const [loading, setLoading] = useState(false)
  const [commentaireRetour, setCommentaireRetour] = useState('')

  const [action, setAction] = useState(null) // 'accept' ou 'refuse'

  console.log(`DemandeDetailModal (${type}) rendu avec demande :`, demande)

  // Calculer les valeurs directement sans useState
  const IdUtilisateur = type === 'adoption' 
    ? demande?.IdUtilisateur 
    : demande?.IdRefugeCible;
  
  const IdAnimal = type === 'adoption' 
    ? demande?.IdAnimal 
    : demande?.IdAnimal;

  const handleAccept = async () => {
    setLoading(true)
    await onAccept(demande.Id, commentaireRetour, IdUtilisateur, IdAnimal, type)
    setLoading(false)
    onClose()
    setCommentaireRetour('')
    setAction(null)
  }

  const handleRefuse = async () => {
    setLoading(true)
    await onRefuse(demande.Id, commentaireRetour)
    setLoading(false)
    onClose()
    setCommentaireRetour('')
    setAction(null)
  }

  const openAcceptModal = () => {
    setAction('accept')
  }

  const openRefuseModal = () => {
    setAction('refuse')
  }

  const cancelAction = () => {
    setAction(null)
    setCommentaireRetour('')
  }

  // Configuration spécifique selon le type
  const config = {
    adoption: {
      title: "Demande d'adoption",
      icon: "pets",
      sectionCandidat: true,
      sectionAnimal: true,
      sectionQuestionnaire: true,
      getStatutText: (statut) => {
        const statuts = {
          1: 'En attente',
          2: 'En cours',
          3: 'Acceptée',
          4: 'Refusée',
          5: 'Annulée',
          6: 'Archivée'
        }
        return statuts[statut] || 'Inconnu'
      },
      getStatutClass: (statut) => {
        if (statut === 1 || statut === 2) return 'bg-secondary-fixed'
        if (statut === 3) return 'bg-primary-fixed'
        return 'bg-error-container text-on-error-container'
      }
    },
    transfert: {
      title: "Demande de transfert",
      icon: "swap_horiz",

      sectionCandidat: true,
      sectionAnimal: true,
      sectionQuestionnaire: false,
      getStatutText: (statut) => {
        const statuts = {
          1: 'En attente',
          2: 'En cours',
          3: 'Approuvé',
          4: 'Refusé',
          5: 'Annulé',
          6: 'Terminé'
        }
        return statuts[statut] || 'Inconnu'
      },
      getStatutClass: (statut) => {
        if (statut === 1 || statut === 2) return 'bg-secondary-fixed'
        if (statut === 3 || statut === 6) return 'bg-primary-fixed'
        return 'bg-error-container text-on-error-container'
      }
    }
  }

  const currentConfig = config[type]
  const statutText = currentConfig.getStatutText(demande.Statut)
  const statutClass = currentConfig.getStatutClass(demande.Statut)

  let infos = {}
  try { infos = JSON.parse(demande.utilisateur || '{}') } catch {}

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
            className="bg-white rounded-xl border-4 border-black max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {action == null ? (
              <>
                {/* Header */}
                <div className="px-6 py-4 border-b-4 border-black bg-primary flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <h2 className="font-['Chewy'] text-2xl text-white flex items-center gap-2">
                      <span className="material-symbols-outlined">{currentConfig.icon}</span>
                      {currentConfig.title}
                    </h2>
                    <button onClick={onClose} className="text-white hover:bg-white/10 rounded-lg p-1 transition-colors">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>

                {/* Content - scrollable */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  
                  {/* Section Candidat */}
                  {currentConfig.sectionCandidat && (
                    <div className="bg-surface-container border-2 border-black rounded-lg p-4">
                      <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined">person</span>
                        Informations du demandeur
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-on-surface-variant text-xs">Nom complet</p>
                          <p className="font-bold">{demande?.utilisateur?.Prenom} {demande?.utilisateur?.Nom}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant text-xs">Email</p>
                          <p className="font-bold">{demande?.utilisateur?.AddresseEmail}</p>
                        </div>
                        {demande?.utilisateur?.Telephone && (
                          <div>
                            <p className="text-on-surface-variant text-xs">Téléphone</p>
                            <p className="font-bold">{demande?.utilisateur?.Telephone}</p>
                          </div>
                        )}
                        {demande?.utilisateur?.Addresse && (
                          <div className="col-span-2">
                            <p className="text-on-surface-variant text-xs">Adresse</p>
                            <p className="font-bold">{demande?.utilisateur?.Addresse}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Section Candidat(refuge) */}
                  {!currentConfig.sectionCandidat && (
                    <div className="bg-surface-container border-2 border-black rounded-lg p-4">
                      <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined">person</span>
                        Informations du demandeur
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-on-surface-variant text-xs">Nom </p>
                          <p className="font-bold">{demande?.refuge?.Nom}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant text-xs">Description</p>
                          <p className="font-bold">{demande?.refuge?.Description}</p>
                        </div>
                        {demande?.refuge?.Telephone && (
                          <div>
                            <p className="text-on-surface-variant text-xs">Téléphone</p>
                            <p className="font-bold">{demande?.refuge?.Telephone}</p>
                          </div>
                        )}
                        {demande?.refuge?.Addresse && (
                          <div className="col-span-2">
                            <p className="text-on-surface-variant text-xs">Adresse</p>
                            <p className="font-bold">{demande?.refuge?.Addresse}</p>
                          </div>
                        )}
                        {demande?.refuge?.AddresseGPS && (
                          <div className="col-span-2">
                            <p className="text-on-surface-variant text-xs">Adresse GPS</p>
                            <p className="font-bold">{demande?.refuge?.AddresseGPS}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section Animal */}
                  {currentConfig.sectionAnimal && (
                    <div className="bg-surface-container border-2 border-black rounded-lg p-4">
                      <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined">pets</span>
                        Informations de l'animal
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-on-surface-variant text-xs">Nom</p>
                          <p className="font-bold">{demande?.animal?.Nom || `Animal #${demande.IdAnimal}`}</p>
                        </div>
                        {demande?.animal?.Race && (
                          <div>
                            <p className="text-on-surface-variant text-xs">Race</p>
                            <p className="font-bold">{demande?.animal?.Race?.Nom}</p>
                          </div>
                        )}
                        {demande?.animal?.Age && (
                          <div>
                            <p className="text-on-surface-variant text-xs">Âge</p>
                            <p className="font-bold">{demande?.animal?.Age}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <AnimalCard animal={demande?.animal} />
                      </div>
                    </div>
                  )}

                  {/* Section Questionnaire d'adoption (uniquement pour adoption) */}
                  {currentConfig.sectionQuestionnaire && (
                    <div className="bg-surface-container border-2 border-black rounded-lg p-4">
                      <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined">quiz</span>
                        Questionnaire d'adoption
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-on-surface-variant text-xs">Type de logement</p>
                            <p className="font-bold capitalize">{demande.TypeLogement || 'Non renseigné'}</p>
                          </div>
                          <div>
                            <p className="text-on-surface-variant text-xs">Jardin</p>
                            <p className="font-bold">{demande.Jardin ? 'Oui' : 'Non'}</p>
                          </div>
                          <div>
                            <p className="text-on-surface-variant text-xs">Autres animaux</p>
                            <p className="font-bold">{demande.Animaux ? 'Oui' : 'Non'}</p>
                          </div>
                          <div>
                            <p className="text-on-surface-variant text-xs">Enfants</p>
                            <p className="font-bold">{demande.Enfants ? 'Oui' : 'Non'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-on-surface-variant text-xs">Disponibilité</p>
                          <p className="font-bold">{demande.Disponibilite || 'Non renseignée'}</p>
                        </div>
                        {demande.ComentaireDepart && (
                          <div>
                            <p className="text-on-surface-variant text-xs">Message / Motivation</p>
                            <p className="italic border-l-4 border-primary pl-3 mt-1">{demande.ComentaireDepart}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section informations de transfert (pour transfert) */}
                  {type === 'transfert' && demande.RefugeSource && (
                    <div className="bg-surface-container border-2 border-black rounded-lg p-4">
                      <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined">location_on</span>
                        Informations de transfert
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-on-surface-variant text-xs">Refuge source</p>
                          <p className="font-bold">{demande.RefugeSource?.Nom || 'Non spécifié'}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant text-xs">Refuge destination</p>
                          <p className="font-bold">{demande.RefugeDestination?.Nom || 'Non spécifié'}</p>
                        </div>
                        {demande.DateTransfert && (
                          <div>
                            <p className="text-on-surface-variant text-xs">Date de transfert souhaitée</p>
                            <p className="font-bold">{new Date(demande.DateTransfert).toLocaleDateString('fr-FR')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section Détails de la demande */}
                  <div className="bg-surface-container border-2 border-black rounded-lg p-4">
                    <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined">info</span>
                      Détails de la demande
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-on-surface-variant text-xs">Date de demande</p>
                        <p className="font-bold">{new Date(demande.DateDemande).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant text-xs">Statut actuel</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-extrabold border border-black ${statutClass}`}>
                          {statutText}
                        </span>
                      </div>
                    </div>
                    {demande.CommentaireRetour && (
                      <div className="mt-3 pt-3 border-t border-outline">
                        <p className="text-on-surface-variant text-xs">Commentaire du refuge</p>
                        <p className="text-sm mt-1">{demande.CommentaireRetour}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t-4 border-black bg-surface-container flex justify-end gap-3 flex-shrink-0">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border-2 border-black bg-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm rounded-lg hover:bg-surface transition-all"
                  >
                    Retour
                  </button>
                  {(demande.Statut === 1 || demande.Statut === 2 || demande.Statut === 6) && (
                    <>
                      <button
                        onClick={openRefuseModal}
                        className="px-4 py-2 border-2 border-black bg-error text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                        Refuser
                      </button>
                      <button
                        onClick={openAcceptModal}
                        className="px-4 py-2 border-2 border-black bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">check</span>
                        {type === 'adoption' ? 'Accepter' : 'Approuver'}
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              /* Modal de confirmation avec commentaire */
              <div className="flex flex-col h-full">
                <div className="px-6 py-4 border-b-4 border-black bg-primary">
                  <h2 className="font-['Chewy'] text-xl text-white">
                    {action === 'accept' 
                      ? (type === 'adoption' ? 'Accepter la demande d\'adoption' : 'Approuver la demande de transfert')
                      : (type === 'adoption' ? 'Refuser la demande d\'adoption' : 'Refuser la demande de transfert')}
                  </h2>
                </div>
                <div className="p-6 space-y-4 flex-1">
                  <p className="text-sm">
                    {action === 'accept' 
                      ? (type === 'adoption'
                        ? 'Vous allez accepter cette demande d\'adoption. Vous pouvez ajouter un commentaire (optionnel) :'
                        : 'Vous allez approuver cette demande de transfert. Vous pouvez ajouter un commentaire (optionnel) :')
                      : (type === 'adoption'
                        ? 'Vous allez refuser cette demande d\'adoption. Vous pouvez ajouter un commentaire pour expliquer votre décision :'
                        : 'Vous allez refuser cette demande de transfert. Vous pouvez ajouter un commentaire pour expliquer votre décision :')}
                  </p>
                  <textarea
                    value={commentaireRetour}
                    onChange={(e) => setCommentaireRetour(e.target.value)}
                    placeholder="Votre commentaire..."
                    className="w-full border-2 border-black rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="4"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={cancelAction}
                      className="px-4 py-2 border-2 border-black bg-white font-bold text-sm rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={action === 'accept' ? handleAccept : handleRefuse}
                      disabled={loading}
                      className={`px-4 py-2 border-2 border-black text-white font-bold text-sm rounded-lg flex items-center gap-2
                        ${action === 'accept' ? 'bg-primary' : 'bg-error'}`}
                    >
                      {loading ? 'Chargement...' : (action === 'accept' ? (type === 'adoption' ? 'Accepter' : 'Approuver') : 'Refuser')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DemandeDetailModal