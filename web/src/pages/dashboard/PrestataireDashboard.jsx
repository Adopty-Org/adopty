import { useEffect, useMemo, useState, useCallback } from 'react'
import { PageTransition, FadeIn } from '../../components/Animations'
//import { getMyPrestataireProfile, getMyPrestataireReservations, updatePrestataireProfile, updateReservationStatusAsPrestataire, deleteDisponibilite } from '../services/authApi'
//import { normalizeApiError } from '../lib/http'
//import { useRoleAccess } from '../hooks/useRoleAccess'
import Modal from '../../components/ui/Modal'
import PrestataireProfileForm from '../../components/forms/PrestataireProfileForm'
import AvailabilityForm from '../../components/forms/AvailabilityForm'
import { usePrestataire } from '../../hooks/usePrestataire'

const toCurrency = (value) => `${Number(value || 0).toLocaleString('fr-FR')} DZD`

const toDateLabel = (value) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleDateString('fr-FR')
}

const STATUS_MAP = {
  'En attente': { label: 'En attente', cls: 'bg-surface-container text-on-surface' },
  'Confirmée': { label: 'Confirmée', cls: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  'En cours': { label: 'En cours', cls: 'bg-secondary-fixed text-on-secondary-fixed' },
  'Terminée': { label: 'Terminée', cls: 'bg-primary-fixed text-on-primary-fixed-variant' },
  'Annulée': { label: 'Annulée', cls: 'bg-error-container text-on-error-container' },
}

const getStatusStyle = (statut) => STATUS_MAP[statut] || { label: statut || 'Inconnu', cls: 'bg-surface-container' }

const TYPE_SERVICE_LABELS = {
  1: 'Baby-sitting',
  2: 'Promenade',
  3: 'Toilettage',
  4: 'Vétérinaire',
  5: 'Dressage',
}

const PrestataireDashboard = () => {
  //const { backendUserId } = useRoleAccess()
  const [isLoading, setIsLoading] = useState(true)
  const [apiIssues, setApiIssues] = useState([])
  const [myProfile, setMyProfile] = useState(null)
  const [myReservations, setMyReservations] = useState([])

  // Modales
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isAvailModalOpen, setIsAvailModalOpen] = useState(false)
  const [editingAvail, setEditingAvail] = useState(null)

  const {prestataire} = usePrestataire(1)

  console.log("le prestataire : ", prestataire)

  const loadData = useCallback(async () => {
    if (false/*!backendUserId*/) return
    setIsLoading(true)
    const issues = []

    const profileResult = prestataire;

    const reservationsResult = null;

    /*const [profileResult, reservationsResult] = await Promise.allSettled([
      getMyPrestataireProfile(),
      getMyPrestataireReservations(),
    ])*/

    if (true/*profileResult?.status === 'fulfilled'*/) {
      setMyProfile(profileResult)
    } else {
      issues.push('Profil prestataire')
      //normalizeApiError(profileResult?.reason)
    }

    if (true/*reservationsResult?.status === 'fulfilled'*/) {
      setMyReservations(Array.isArray(reservationsResult) ? reservationsResult : [])
    } else {
      issues.push('Réservations')
      //normalizeApiError(reservationsResult?.reason)
    }

    setApiIssues(issues)
    setIsLoading(false)
  }, [/*backendUserId*/])

  useEffect(() => {
    loadData()
  }, [loadData])

  const stats = useMemo(() => ({
    total: myReservations.length,
    enAttente: myReservations.filter(r => r?.Statut === 'En attente').length,
    terminees: myReservations.filter(r => r?.Statut === 'Terminée').length,
    revenu: myReservations
      .filter(r => r?.Statut === 'Terminée')
      .reduce((sum, r) => sum + Number(r.PrixFinal ?? 0), 0),
  }), [myReservations])

  const handleUpdateStatus = async (id, statut) => {
    try {
      await updateReservationStatusAsPrestataire(id, statut)
      loadData()
    } catch {
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  const handleDeleteAvail = async (id) => {
    if (!window.confirm('Supprimer cette disponibilité ?')) return
    try {
      await deleteDisponibilite(id)
      loadData()
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  const openAddAvail = () => { setEditingAvail(null); setIsAvailModalOpen(true) }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* En-tête */}
        <div>
          {apiIssues.length > 0 && (
            <div className="inline-block px-3 py-1 bg-[#fff1c2] text-[#7a4a00] border-2 border-black font-bold text-[10px] uppercase tracking-wider mb-3">
              ⚠ Sources indisponibles: {apiIssues.join(', ')}
            </div>
          )}
          <h1 className="font-['Chewy'] text-5xl text-primary">Dashboard Prestataire</h1>
          <p className="text-on-surface-variant mt-2">
            Gérez votre profil, vos disponibilités et suivez vos réservations en temps réel.
          </p>
        </div>

        {isLoading && (
          <FadeIn className="flex items-center gap-3 px-4 py-3 bg-surface-container-lowest border-2 border-black rounded-xl">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-primary">Chargement des données...</p>
          </FadeIn>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Réservations', value: stats.total, color: 'text-primary' },
            { label: 'En attente', value: stats.enAttente, color: 'text-secondary' },
            { label: 'Terminées', value: stats.terminees, color: 'text-primary' },
            { label: 'Revenu total', value: toCurrency(stats.revenu), color: 'text-tertiary', small: true },
          ].map(({ label, value, color, small }) => (
            <div key={label} className="bg-surface-container-lowest border-4 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs uppercase font-bold text-on-surface-variant">{label}</p>
              <p className={`font-['Chewy'] ${small ? 'text-2xl' : 'text-4xl'} ${color} mt-2`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Mon profil prestataire */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">badge</span>
              Mon profil prestataire
            </h2>
            {myProfile && (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-4 py-2 bg-primary text-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                Éditer
              </button>
            )}
          </div>
          <div className="p-6">
            {!myProfile ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">badge</span>
                <p className="text-sm font-bold text-on-surface-variant mb-4">
                  Aucun profil prestataire lié à ce compte.
                </p>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-6 py-3 bg-primary text-white border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  Créer mon profil
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-black rounded-xl p-4 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-primary">
                      {TYPE_SERVICE_LABELS[myProfile?.TypeService] || `Service #${myProfile?.TypeService}`}
                    </p>
                    <span className="px-2 py-0.5 bg-primary-fixed text-xs font-extrabold border border-black rounded-full">
                      ★ {Number(myProfile?.NoteMoyenne || 0).toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{myProfile?.ZoneIntervention}</p>
                  <p className="text-sm font-extrabold text-primary">
                    {Number(myProfile?.TarifHoraire || 0).toLocaleString('fr-FR')} DZD / heure
                  </p>
                  {myProfile?.Bio && (
                    <p className="text-sm text-on-surface-variant border-t border-outline-variant pt-2 mt-2">
                      {myProfile?.Bio}
                    </p>
                  )}
                </div>
                <div className="border-2 border-black rounded-xl p-4 bg-white space-y-2">
                  <p className="font-extrabold text-sm uppercase tracking-wider text-on-surface-variant">Infos complémentaires</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-base text-primary">work</span>
                    <span>{myProfile?.Experience || 0} année(s) d'expérience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-base text-primary">star</span>
                    <span>Note moyenne : {Number(myProfile?.NoteMoyenne || 0).toFixed(1)} / 5</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-base text-primary">event_available</span>
                    <span>{stats.terminees} mission(s) terminée(s)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Disponibilités */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">schedule</span>
              Mes disponibilités
            </h2>
            <button
              onClick={openAddAvail}
              className="px-4 py-2 bg-secondary text-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              + Ajouter
            </button>
          </div>
          <div className="p-6">
            <p className="text-xs font-bold text-on-surface-variant italic">
              Définissez vos créneaux pour que les clients puissent réserver vos services.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-surface-container border-2 border-black rounded-full text-xs font-bold">
                Lundi – Vendredi (08:00 – 18:00)
              </span>
              <span className="px-3 py-1 bg-surface-container border-2 border-black rounded-full text-xs font-bold">
                Samedi (09:00 – 14:00)
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Activité Réservations */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">event</span>
              Mes réservations ({myReservations.length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b-2 border-black">
              <tr>
                {['ID', 'Date début', 'Date fin', 'Statut', 'Montant', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {myReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">event_busy</span>
                    <p className="font-bold text-sm">Aucune réservation pour le moment.</p>
                    <p className="text-xs mt-1">Les clients pourront réserver vos services depuis votre profil public.</p>
                  </td>
                </tr>
              ) : (
                myReservations.map((r) => {
                  const { label, cls } = getStatusStyle(r?.Statut)
                  return (
                    <tr key={r?.Id} className="hover:bg-surface-container transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-on-surface-variant">
                        #{String(r?.Id).padStart(4, '0')}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">{toDateLabel(r?.DateDebut)}</td>
                      <td className="px-5 py-4 text-on-surface-variant">{toDateLabel(r?.DateFin)}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black ${cls}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-extrabold text-primary">{toCurrency(r?.PrixFinal)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {r?.Statut === 'En attente' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(r?.Id, 'Confirmée')}
                                className="p-1.5 border border-black bg-primary text-white rounded transition-colors"
                                title="Confirmer"
                              >
                                <span className="material-symbols-outlined text-base">check_circle</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(r?.Id, 'Annulée')}
                                className="p-1.5 border border-black bg-error text-white rounded transition-colors"
                                title="Annuler"
                              >
                                <span className="material-symbols-outlined text-base">cancel</span>
                              </button>
                            </>
                          )}
                          {r?.Statut === 'Confirmée' && (
                            <button
                              onClick={() => handleUpdateStatus(r?.Id, 'En cours')}
                              className="px-2 py-1 border border-black bg-secondary-fixed font-bold text-[10px] uppercase rounded"
                            >
                              Démarrer
                            </button>
                          )}
                          {r?.Statut === 'En cours' && (
                            <button
                              onClick={() => handleUpdateStatus(r?.Id, 'Terminée')}
                              className="px-2 py-1 border border-black bg-primary-fixed font-bold text-[10px] uppercase rounded"
                            >
                              Terminer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </FadeIn>

        {/* Modale profil */}
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title={myProfile ? 'Modifier mon profil' : 'Créer mon profil prestataire'}
          size="lg"
        >
          <PrestataireProfileForm
            initialData={myProfile}
            onClose={() => setIsProfileModalOpen(false)}
            onSuccess={loadData}
          />
        </Modal>

        {/* Modale disponibilités */}
        <Modal
          isOpen={isAvailModalOpen}
          onClose={() => setIsAvailModalOpen(false)}
          title="Gérer mes disponibilités"
          size="lg"
        >
          <AvailabilityForm
            initialData={editingAvail}
            profilId={myProfile?.Id}
            onClose={() => setIsAvailModalOpen(false)}
            onSuccess={loadData}
          />
        </Modal>
      </div>
    </PageTransition>
  )
}

export default PrestataireDashboard