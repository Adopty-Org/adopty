import { useEffect, useMemo, useState, useCallback } from 'react'
import { PageTransition, FadeIn } from '../../components/Animations'
//import { getMyPrestataireProfile, getMyPrestataireReservations, updatePrestataireProfile, updateReservationStatusAsPrestataire, deleteDisponibilite } from '../services/authApi'
//import { normalizeApiError } from '../lib/http'
//import { useRoleAccess } from '../hooks/useRoleAccess'
import Modal from '../../components/ui/Modal'
import PrestataireProfileForm from '../../components/forms/PrestataireProfileForm'
import AvailabilityForm from '../../components/forms/AvailabilityForm'
import { usePrestataire, usePrestataires } from '../../hooks/usePrestataire'
import AvailabilityCalendar from '../../components/ui/AvailabilityCalendar'
import { useDisponibilites } from '../../hooks/useDisponibilite'
import { useDeleteReservation, useReservations, useUpdateReservation } from '../../hooks/useReservation'
import AnnonceFormModal from '../../components/forms/AnnonceFormModal'
import { useUtilisateur } from '../../hooks/useUtilisateur'
import { useUser } from '@clerk/clerk-react'
import { useAnnoncesPrestataire, useAnnoncesUtilisateur } from '../../hooks/useAnnonce'
import ReservationForm from '../../components/forms/ReservationForm'

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
  const [reservationAnnonceOpen, setReservationAnnonceOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)

  // Modales
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isAvailModalOpen, setIsAvailModalOpen] = useState(false)
  const [editingAvail, setEditingAvail] = useState(null)
  const [lannonce, setLannonce] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  const {user} = useUser()

  const {utilisateur} = useUtilisateur(user?.id)

  const {prestatairesUtilMap} = usePrestataires()

  const {prestataire,isLoading: prestataireLoading} = usePrestataire(prestatairesUtilMap.get(utilisateur?.Id)?.Id)
  const {disponibilites,DisponibilitesLoading} = useDisponibilites(prestatairesUtilMap.get(utilisateur?.Id)?.Id);
  const {reservationProfilMap, ReservationsLoading}= useReservations()
    //console.log("les disponibilites  : ", disponibilites)

  const updateReservation = useUpdateReservation()
  const deleteReservation = useDeleteReservation()

  const [selectedReservation, setSelectedReservation] = useState(null)
  const [isAnnonceModalOpen, setIsAnnonceModalOpen] = useState(false)
  const { annonces, AnnoncesLoading } = useAnnoncesUtilisateur()

  console.log("le prestataire : ", prestataire)

  const mesAnnonces = useMemo(() => {
    if (!utilisateur?.Id) return []

    return annonces.filter(a =>
      /*Number(a.IdUtilisateur) !== Number(utilisateur.Id) &&*/
      [1, 2, 6].includes(Number(a.Statut))
    )
  }, [annonces, utilisateur?.Id])

  const loadData = useCallback(async () => {
    if (false/*!backendUserId*/) return
    setIsLoading(true)
    const issues = []

    const profileResult = prestataire;

    const reservationsResult = prestataire?.Id
  ? reservationProfilMap.get(prestataire.Id).filter((a) => {a.Statut ===2 || a.Statut === 1 || a.Statut === 6 }) || []
  : []

    

    

    if (true) {
      setMyProfile(profileResult)
    } else {
      issues.push('Profil prestataire')
      //normalizeApiError(profileResult?.reason)
    }

    if (true) {
      setMyReservations(Array.isArray(reservationsResult) ? reservationsResult : [])
    } else {
      issues.push('Réservations')
      //normalizeApiError(reservationsResult?.reason)
    }

    setApiIssues(issues)
    setIsLoading(false)
  }, [prestataire?.Id, reservationProfilMap])

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

  const handleUpdateReservationStatus = async (id, statut) => {
    try {
      await updateReservation.mutateAsync({
        prestataire: prestataire.Id,
        id,
        formData: { Statut: statut, IdProfil: prestataire.Id }
      })

      loadData()
    } catch (error) {
      console.error(error)
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  const openReservationAnnonceModal = (annonce) => {
    if(selectedSlot === null){
      setSelectedSlot({IdProfil: prestataire.Id, DateDebut: annonce.DateDebut, DateFin: annonce.DateFin, TypeService: annonce.TypeService, IdAnimal: annonce.IdAnimal, IdAnnonce: annonce.Id})
    } 

    setSelectedSlot({
      IdProfil: prestataire.Id,
      IdAnnonce: annonce.Id,
      DateDebut: annonce.DateDebut,
      DateFin: annonce.DateFin,
      TypeService: annonce.TypeService,
      IdAnimal: annonce.IdAnimal,
      PrixSouhaite: annonce.PrixSouhaite,
      NotesAnnonce: annonce.Notes,
    })
    
    setReservationAnnonceOpen(true)
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
        {/* Annonces */}
        <FadeIn>
          <div className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">

            <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex justify-between items-center">
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">campaign</span>
                Mes annonces
              </h2>

              {/*<button
                onClick={() => setIsAnnonceModalOpen(true)}
                className="px-4 py-2 bg-primary text-white font-bold border-2 border-black rounded-lg"
              >
                + Nouvelle annonce
              </button>*/}
            </div>

            <div className="p-6">

              {AnnoncesLoading && (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!AnnoncesLoading && mesAnnonces.length === 0 && (
                <div className="text-center py-12 max-w-lg mx-auto">
                  <span className="material-symbols-outlined text-6xl opacity-30">
                    campaign
                  </span>

                  <h3 className="mt-4 font-extrabold text-lg text-primary">
                    Aucune annonce publiée
                  </h3>

                  <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
                    Les annonces vous permettent de publier vos besoins concernant vos animaux
                    afin d'être contacté par des prestataires qualifiés.
                  </p>

                  <div className="mt-4 text-xs text-on-surface-variant bg-surface-container border-2 border-black rounded-xl p-4 text-left">
                    <p className="font-bold mb-2">Exemples d'annonces :</p>

                    <ul className="space-y-1">
                      <li>🐾 Je cherche un promeneur pour mon chien pendant une semaine.</li>
                      <li>🏠 Je recherche une garde à domicile pour mon chat durant mes vacances.</li>
                      <li>🛁 Je souhaite trouver un toiletteur près de chez moi.</li>
                      <li>🎓 Je cherche un éducateur canin pour mon chiot.</li>
                    </ul>
                  </div>

                  {/*<button
                    onClick={() => setIsAnnonceModalOpen(true)}
                    className="mt-6 px-6 py-3 bg-primary text-white font-bold border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                  >
                    Créer ma première annonce
                  </button>*/}
                </div>
              )}

              {!AnnoncesLoading && mesAnnonces.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {mesAnnonces.map((annonce) => (
                    <div
                      key={annonce.Id}
                      className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >

                      <div className="p-4 border-b-2 border-black bg-surface-container">
                        <div className="flex justify-between items-center">

                          <span className="font-extrabold text-primary">
                            #{annonce.Id}
                          </span>

                          <span className="px-2 py-1 text-xs border border-black rounded-full bg-primary-fixed">
                            {annonce.TypeAnnonce}
                          </span>

                        </div>
                      </div>

                      <div className="p-4 space-y-2">

                        <p className="font-bold">
                          Service : {annonce.typeService?.Type || annonce.TypeService}
                        </p>

                        <p className="text-sm text-on-surface-variant">
                          {annonce.Notes || "Aucune description"}
                        </p>

                        <p className="text-sm">
                          📅 {new Date(annonce.DateDebut).toLocaleDateString("fr-FR")} to {new Date(annonce.DateFin).toLocaleDateString("fr-FR")}
                        </p>

                        <p className="text-sm">
                          💰 {Number(annonce.PrixSouhaite || 0).toLocaleString("fr-FR")} DZD
                        </p>

                      </div>

                      <div className="p-4 border-t-2 border-black flex gap-2">

                        <button
                          className="flex-1 py-2 bg-primary text-white border-2 border-black rounded-lg font-bold" onClick={() => openReservationAnnonceModal(annonce)}
                        >
                          Postuler
                        </button>

                        <button
                          className="flex-1 py-2 bg-error text-white border-2 border-black rounded-lg font-bold" onClick={() => {setLannonce(annonce) ;setIsReportModalOpen(true)}}
                        >
                          Signaler
                        </button>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

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
            {!disponibilites && (
              <p className="text-xs font-bold text-on-surface-variant italic">
                Définissez vos créneaux pour que les clients puissent réserver vos services.
              </p>
            )} {disponibilites && (
              disponibilites.map(d => (
                <div key={d.Id} className="flex items-center justify-between bg-surface-container border-2 border-black rounded-lg px-4 py-2">
                  <div>
                    <p className="font-bold text-on-surface-variant">{d.Frequence}</p>
                    <p className="text-sm text-on-surface-variant">{d.DateDebut} - {d.DateFin}</p>
                    <p className="text-sm text-on-surface-variant">Récurrence: {d.Recurrence}</p>
                    <p className="text-sm text-on-surface-variant">Statut: {d.Disponibilite ? 'Disponible' : 'Indisponible'}</p>
                  </div>
                </div>
              ))

            )}
            {!disponibilites && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-surface-container border-2 border-black rounded-full text-xs font-bold">
                Lundi – Vendredi (08:00 – 18:00)
              </span>
              <span className="px-3 py-1 bg-surface-container border-2 border-black rounded-full text-xs font-bold">
                Samedi (09:00 – 14:00)
              </span>
            </div>)}
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
                    <tr key={r?.Id} className="hover:bg-surface-container transition-colors" onClick={() => setSelectedReservation(r)}>
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
        ><AvailabilityCalendar mode="provider" profilId={myProfile?.Id} onSlotClick={editingAvail}/>
          <AvailabilityForm
            initialData={editingAvail}
            profilId={myProfile?.Id}
            onClose={() => setIsAvailModalOpen(false)}
            onSuccess={loadData}
          />
        </Modal>
      </div>


      {selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border-4 border-black rounded-xl max-w-xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

            <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex justify-between items-center">
              <h3 className="font-['Chewy'] text-2xl text-primary">
                Réservation #{selectedReservation.Id}
              </h3>

              <button onClick={() => setSelectedReservation(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p><strong>Date début :</strong> {new Date(selectedReservation.DateDebut).toLocaleString('fr-FR')}</p>
              <p><strong>Date fin :</strong> {new Date(selectedReservation.DateFin).toLocaleString('fr-FR')}</p>
              <p><strong>Prix :</strong> {toCurrency(selectedReservation.PrixFinal)}</p>
              <p><strong>Notes :</strong> {selectedReservation.Notes || "Aucune note"}</p>
              <p><strong>Statut :</strong> {selectedReservation.statut?.Statut || selectedReservation.Statut}</p>
            </div>

            <div className="p-4 border-t-4 border-black bg-surface-container flex gap-3 justify-end">
              <button
                onClick={() => handleUpdateReservationStatus(selectedReservation.Id, 4)}
                className="px-4 py-2 bg-primary text-white border-2 border-black font-bold rounded-lg"
              >
                Accepter
              </button>

              <button
                onClick={() => handleUpdateReservationStatus(selectedReservation.Id, 5)}
                className="px-4 py-2 bg-error text-white border-2 border-black font-bold rounded-lg"
              >
                Refuser
              </button>

              {/*<button
                onClick={() => handleDeleteReservation(selectedReservation.Id)}
                className="px-4 py-2 bg-black text-white border-2 border-black font-bold rounded-lg"
              >
                Supprimer
              </button>*/}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={reservationAnnonceOpen}
        onClose={() => setReservationAnnonceOpen(false)}
        title={`Réserver — ${prestataire?.utilisateur?.Nom}`}
        size="md"
      >
        <ReservationForm
          utilisateur={utilisateur}
          prestataire={prestataire}
          initialSlot={selectedSlot}
          onClose={() => setReservationAnnonceOpen(false)}
          TypeReservation="annonce"
        />
      </Modal>

      {lannonce && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          targetType="lannonce"
          targetId={lannonce.Id}
          targetName={lannonce.Nom}
        />
      )}
      
    </PageTransition>
  )
}

export default PrestataireDashboard