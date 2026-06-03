import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useUser, useClerk, useAuth, SignedIn, SignedOut } from '@clerk/clerk-react'
import { PageTransition, FadeIn } from '../../components/Animations'
//import { getMyReservations, getMesDemandesAdoption, annulerDemandeAdoption, getMesCommandes, cancelReservation } from '../services/authApi'
//import { useCurrentUser } from '../hooks/useCurrentUser'
//import { normalizeApiError } from '../lib/http'
//import { useRoleAccess, ROLE_KEYS } from '../hooks/useRoleAccess'

import { useUtilisateur, useUtilisateurs } from '../../hooks/useUtilisateur'
import { useDemandeAdoptions } from '../../hooks/useDemandeAdoption'
import { useCommandes } from '../../hooks/useCommande'
import { useReservations, useUpdateReservation } from '../../hooks/useReservation'
import { animalApi, annonceApi, utilisateurApi } from '../../lib/api'
import AnimalForm from '../../components/forms/AnimalForm'
import AnnonceFormModal from '../../components/forms/AnnonceFormModal'
import { useAnnoncesUtilisateur } from "../../hooks/useAnnonce"
import Modal from '../../components/ui/Modal'
import { usePrestataires } from '../../hooks/usePrestataire'



const ROLE_META = {
    Admin: {
        icon: "admin_panel_settings",
        label: "Administrateur",
        color: "bg-error text-white"
    },
    Refuge: {
        icon: "home_work",
        label: "Gestionnaire de Refuge",
        color: "bg-secondary text-white"
    },
    Prestataire: {
        icon: "handshake",
        label: "Prestataire",
        color: "bg-tertiary text-white"
    },
    Utilisateur: {
        icon: "person",
        label: "Utilisateur",
        color: "bg-primary-fixed text-on-primary-fixed-variant"
    }
    };

const NAV_ITEMS = [
  { id: 'profil',      label: 'Mon Profil',        icon: 'person' },
  { id: 'adoptions',  label: 'Mes Adoptions',      icon: 'pets' },
  { id: 'animaux',  label: 'Mes Animaux',      icon: 'home' },
  { id: 'annonces',  label: 'Mes Annonces',      icon: 'home' },
  { id: 'commandes',  label: 'Mes Commandes',      icon: 'receipt_long' },
  { id: 'reservations', label: 'Mes Réservations', icon: 'event' },
  { id: 'favoris',  label: 'Mes Favoris',      icon: 'favorite' },
]

const StatutBadge = ({ statut }) => {
  const s = String(statut ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  let cls = 'bg-surface-container text-on-surface'
  if (s.includes('accept') || s.includes('valide') || s.includes('livre')) cls = 'bg-primary-fixed text-on-primary-fixed-variant'
  if (s.includes('attente') || s.includes('cours')) cls = 'bg-secondary-fixed text-on-secondary-fixed'
  if (s.includes('refuse') || s.includes('annul')) cls = 'bg-error-container text-on-error-container'
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black ${cls}`}>
      {statut || 'En attente'}
    </span>
  )
}

const EmptyState = ({ icon, message, linkTo, linkLabel }) => (
  <div className="py-14 flex flex-col items-center gap-4 text-center text-on-surface-variant">
    <span className="material-symbols-outlined text-6xl opacity-25">{icon}</span>
    <p className="font-bold">{message}</p>
    {linkTo && (
      <Link
        to={linkTo}
        className="px-5 py-2.5 bg-primary text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm"
      >
        {linkLabel}
      </Link>
    )}
  </div>
)

const UserProfile = () => {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  //const { userId } = useAuth()
  //const { role } = useRoleAccess()

  const [activeSection, setActiveSection] = useState('profil')
  /*const [reservations,  setReservations]  = useState([])
  const [adoptions,     setAdoptions]     = useState([])
  const [commandes,     setCommandes]     = useState([])
  const [animaux,       setAnimaux]       = useState([])*/
  const [isLoading,     setIsLoading]     = useState(true)
  const [showAnimalModal, setShowAnimalModal] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState(null)
  const [selectedCommande, setSelectedCommande] = useState(null)
  const [selectedAnnonce, setSelectedAnnonce] = useState(null)
  const [isCandidaturesModalOpen, setIsCandidaturesModalOpen] = useState(false)
  
  const [isAnnonceModalOpen, setIsAnnonceModalOpen] = useState(false)

  // Profil backend via hook (ex-mapUtilisateur)
  //const { user: backendProfile } = useCurrentUser()

  const { isLoading:utilisateursLoading, utilisateurMap }= useUtilisateurs()
  const {utilisateur, isLoading: utilisateurLoading, error, refetch: refetchUtilisateur} = useUtilisateur(user?.id)
  const { demandeAdoptionUtilisateurMap, DemandeAdoptionsLoading } = useDemandeAdoptions(utilisateurMap)
  const {commandeUtilisateurMap, isLoading: commandesLoading } = useCommandes()
  const { reservationAnnonceMap, reservationUtilisateurMap, ReservationsLoading } = useReservations()
  const {prestatairesMap} = usePrestataires()
  

  const { annonces, AnnoncesLoading } = useAnnoncesUtilisateur()

  const mesAnnonces = useMemo(() => {
    if (!utilisateur?.Id) return []

    return annonces.filter(
      a => {return (
          Number(a.IdUtilisateur) === Number(utilisateur.Id) &&
          [1, 2, 6].includes(Number(a.Statut))
        )
      }
    )
  }, [annonces, utilisateur?.Id])

  const updateReservation = useUpdateReservation()

  const isloading = utilisateursLoading || utilisateurLoading || DemandeAdoptionsLoading || commandesLoading || ReservationsLoading

  console.log("utilisateur", utilisateur)

  
  const roles = utilisateur?.Roles ?? [];

  const hasOtherRoleThanUser = roles.some(
  role => role.Nom !== "Utilisateur"
  );

  const filteredRoles = hasOtherRoleThanUser
  ? roles.filter(role => role.Nom !== "Utilisateur")
  : roles;

  const rolesMeta = filteredRoles.map(role =>
  ROLE_META[role.Nom] ?? {
      icon: "person",
      label: role.Nom,
      color: "bg-gray-500 text-white",
  }
  );

  const candidaturesAnnonce = useMemo(() => {
    if (!selectedAnnonce?.Id) return []

    return reservationAnnonceMap.get(selectedAnnonce.Id) ?? []
  }, [reservationAnnonceMap, selectedAnnonce?.Id])

  /*useEffect(() => {
    const loadProfile = async () => {
      if (!utilisateur?.Id) return
      setIsLoading(true)
      try {
        // Adoptions depuis le vrai endpoint demande_adoption
        const adoptionsData = demandeAdoptionUtilisateurMap.get(utilisateur.Id)//await getMesDemandesAdoption().catch(() => [])
        setAdoptions(Array.isArray(adoptionsData) ? adoptionsData : [])

        // Réservations de services (endpoint réservations classiques)
        const reservationsData = reservationUtilisateurMap.get(utilisateur.Id)//[]//await getMyReservations().catch(() => [])
        const allReservations = Array.isArray(reservationsData) ? reservationsData : []
        setReservations(allReservations.filter(r => r.IdProfil && !r.IdAnimal))

        // Commandes boutique
        const commandesData = commandeUtilisateurMap.get(utilisateur.Id)//[]//await getMesCommandes().catch(() => [])
        setCommandes(Array.isArray(commandesData) ? commandesData : [])

        // Animaux
        const animauxData = utilisateur.Animals //[]//await getMesAnimaux().catch(() => [])
        setAnimaux(Array.isArray(animauxData) ? animauxData : [])
      } catch (error) {
        normalizeApiError(error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [utilisateur?.Id, DemandeAdoptionsLoading, ReservationsLoading, commandesLoading, utilisateur?.Animals])*/ // Recharger si l'utilisateur change ou si les maps de données changent

    const adoptions = useMemo(() => {
    if (!utilisateur?.Id) return []
    const data = demandeAdoptionUtilisateurMap.get(utilisateur.Id)
    return Array.isArray(data) ? data : data ? [data] : []
    }, [utilisateur?.Id, demandeAdoptionUtilisateurMap])

    const reservations = useMemo(() => {
    if (!utilisateur?.Id) return []
    const data = reservationUtilisateurMap.get(utilisateur.Id) ?? []
    return data.filter(r => r.IdProfil && !r.IdAnimal)
    }, [utilisateur?.Id, reservationUtilisateurMap])

    const commandes = useMemo(() => {
    if (!utilisateur?.Id) return []
    return commandeUtilisateurMap.get(utilisateur.Id) ?? []
    }, [utilisateur?.Id, commandeUtilisateurMap])

    console.log("commandes", commandes)

    const animaux = useMemo(() => {
    return utilisateur?.Animals ?? []
    }, [utilisateur?.Id])

    const favoris = useMemo(() => {
    return utilisateur?.wishlist?.ligneWishlist ?? []
    }, [utilisateur?.wishlist])

  const handleAddAnimal = () => {
      setEditingAnimal(null)
      setShowAnimalModal(true)
    }
  
    const handleEditAnimal = (animal) => {
      setEditingAnimal(animal)
      setShowAnimalModal(true)
    }
  
    const handleDeleteAnimal = async (animalId) => {
      if (!confirm('Supprimer cet animal ?')) return
      
      try {
        await animalApi.delete(animalId)
        refetchUtilisateur() // Recharge la liste
      } catch (err) {
        console.error('Erreur suppression:', err)
        alert('Erreur lors de la suppression')
      }
    }
  
    const handleModalClose = () => {
      setShowAnimalModal(false)
      setEditingAnimal(null)
    }
  
    const handleAnimalSuccess = async (id, isEdit) => {
      if(!isEdit){
        await utilisateurApi.addAnimal(id, utilisateur?.Id)
      }
      
      refetchUtilisateur()
      handleModalClose()
    }

    const handleUpdateReservationStatus = async (IdAnnonce, IdProfil, id, statut) => {
      try {

        const prestataire = prestatairesMap.get(IdProfil)
        await updateReservation.mutateAsync({
          prestataire: prestataire.Id,
          id,
          formData: { Statut: statut, IdProfil: prestataire.Id }
        })

        await annonceApi.uupdateStatut({
          id: IdAnnonce,
          formData: { Statut: statut }
        })

        
      } catch (error) {
        console.error(error)
        alert('Erreur lors de la mise à jour du statut')
      }
    }

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <PageTransition>
      <SignedOut>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
          <span className="material-symbols-outlined text-7xl text-on-surface-variant/30">account_circle</span>
          <h2 className="font-['Chewy'] text-4xl text-primary">Vous n'êtes pas connecté</h2>
          <Link to="/auth" className="px-8 py-4 bg-primary text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            Se connecter / S'inscrire
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">

          {/* Hero header */}
          <FadeIn className="bg-primary border-4 border-black shadow-[8px_8px_0px_0px_rgba(148,73,37,1)] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8">
            <div className="relative flex-shrink-0">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={user.fullName} className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-secondary flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-['Chewy'] text-4xl text-white">
                    {(user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || '?').toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-fixed border-2 border-black rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '12px' }}>verified</span>
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="font-['Chewy'] text-3xl md:text-4xl text-white mb-1">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Mon Profil'}
              </h1>
              <p className="text-white/70 font-bold text-sm mb-3">{user?.primaryEmailAddress?.emailAddress}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {rolesMeta.length > 0 && rolesMeta.map((roleMeta, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider ${roleMeta.color}`}
                  >
                        <span className="material-symbols-outlined text-base">
                        {roleMeta.icon}
                        </span>
                        {roleMeta.label}
                    </span>
                    ))}
                {rolesMeta.length === 0 && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider bg-gray-500 text-white">
                    <span className="material-symbols-outlined text-base">person</span>
                    Utilisateur
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {(/*role === ROLE_KEYS.ADMIN || role === ROLE_KEYS.REFUGE || role === ROLE_KEYS.PRESTATAIRE*/hasOtherRoleThanUser) && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary border-2 border-black font-bold text-sm hover:bg-primary-fixed transition-colors rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <span className="material-symbols-outlined text-base">dashboard</span>
                  Mon Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut(() => window.location.href = '/')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border-2 border-white/30 text-white font-bold text-sm hover:bg-white/20 transition-colors rounded-lg"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Déconnexion
              </button>
            </div>
          </FadeIn>

          {/* Layout 2 colonnes */}
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Sidebar navigation */}
            <aside className="lg:w-56 flex-shrink-0">
              <nav className="bg-surface-container-lowest border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-left transition-colors border-b border-outline-variant last:border-0
                      ${activeSection === item.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-surface-container text-on-surface'
                      }`}
                  >
                    <span className="material-symbols-outlined text-base">{item.icon}</span>
                    {item.label}
                    {item.id === 'adoptions' && adoptions.length > 0 && (
                      <span className={`ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-black ${activeSection === 'adoptions' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                        {adoptions.length}
                      </span>
                    )}
                    {item.id === 'reservations' && reservations.length > 0 && (
                      <span className={`ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-black ${activeSection === 'reservations' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                        {reservations.length}
                      </span>
                    )}
                    {item.id === 'commandes' && commandes.length > 0 && (
                      <span className={`ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-black ${activeSection === 'commandes' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                        {commandes.length}
                      </span>
                    )}
                    {item.id === 'animaux' && animaux.length > 0 && (
                      <span className={`ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-black ${activeSection === 'animaux' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                        {animaux.length}
                      </span>
                    )}
                    {item.id === 'favoris' && favoris.length > 0 && (
                      <span className={`ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-black ${activeSection === 'favoris' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                        {favoris.length}
                      </span>
                    )}
                    {item.id === 'annonces' && mesAnnonces.length > 0 && (
                      <span className={`ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-black ${activeSection === 'annonces' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                        {mesAnnonces.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Raccourcis */}
              <div className="mt-4 bg-secondary-fixed border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant mb-3">Raccourcis</p>
                <div className="space-y-1.5">
                  {[
                    { to: '/animaux', icon: 'pets', label: 'Animaux' },
                    { to: '/boutique', icon: 'shopping_bag', label: 'Boutique' },
                    { to: '/services', icon: 'handshake', label: 'Services' },
                    { to: '/signalement', icon: 'report', label: 'Signaler' },
                  ].map(link => (
                    <Link key={link.to} to={link.to} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/60 transition-colors text-sm font-bold">
                      <span className="material-symbols-outlined text-primary text-base">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">

              {/* SECTION PROFIL */}
              {activeSection === 'profil' && (
                <FadeIn className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
                  <div className="bg-surface-container border-b-4 border-black px-6 py-4">
                    <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined">person</span>
                      Informations personnelles
                    </h2>
                  </div>
                  <div className="p-6 space-y-0 divide-y divide-outline-variant">
                    {[
                      { label: 'Prénom', value: /*backendProfile?.prenom ||*/ user?.firstName, icon: 'badge' },
                      { label: 'Nom', value: /*backendProfile?.nom ||*/ user?.lastName, icon: 'badge' },
                      { label: 'Email', value: /*backendProfile?.email ||*/ user?.primaryEmailAddress?.emailAddress, icon: 'mail' },
                      { label: 'Wilaya', value: /*backendProfile?.wilaya*/"cool", icon: 'location_on' },
                      { label: 'Adresse', value: /*backendProfile*//*?.adresse*/"pas d'adresse", icon: 'home' },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="flex items-center justify-between gap-4 py-4">
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <span className="material-symbols-outlined text-base">{icon}</span>
                          <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                        </div>
                        <span className="font-bold text-sm text-right">{value || <span className="text-on-surface-variant font-normal italic">Non renseigné</span>}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 pb-6">
                    <div className="bg-secondary-fixed border-2 border-black rounded-xl p-4 flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary">info</span>
                      <p className="text-sm text-on-surface-variant">
                        Pour modifier vos informations, contactez l'administrateur ou mettez à jour votre profil Clerk.
                      </p>
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* SECTION COMMANDES BOUTIQUE */}
              {activeSection === 'commandes' && (
                <FadeIn className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
                  <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex items-center justify-between">
                    <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined">receipt_long</span>
                      Mes commandes
                    </h2>
                    <Link to="/boutique" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                      <span className="material-symbols-outlined text-base">store</span>
                      Boutique
                    </Link>
                  </div>

                  {isloading ? (
                    <div className="py-10 flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : commandes.length === 0 ? (
                    <EmptyState
                      icon="shopping_bag"
                      message="Vous n'avez encore passé aucune commande."
                      linkTo="/boutique"
                      linkLabel="Découvrir la boutique"
                    />
                  ) : (
                    <div className="divide-y divide-outline-variant">
                      {/* Regrouper par commandeId pour éviter doublons */}
                      {Object.values(
                        commandes.reduce((acc, row) => {
                          const id = row.commandeId ?? row.Id
                          if (!acc[id]) acc[id] = { ...row, refuges: [] }
                          if (row.NomRefuge) acc[id].refuges.push(row.NomRefuge)
                          return acc
                        }, {})
                      ).map((cmd, idx) => {
                        const statutLabel = cmd.StatutLabel ?? cmd.Statut ?? 'En cours'
                        const paiementLabel = cmd.PaiementStatutLabel ?? 'Validé'
                        const ref = cmd.PaymentRef ?? ''
                        const isSimulated = ref.startsWith('SIM-')
                        return (
                          <button
                              key={cmd.Id ?? cmd.commandeId ?? `cmd-${idx}`}
                              onClick={() => setSelectedCommande(cmd)}
                              className="w-full text-left p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container/50 transition-colors"
                            >
                          {/*<div key={cmd.commandeId ?? `cmd-${idx}`} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container/50 transition-colors">*/}
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary-fixed rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-primary text-xl">shopping_bag</span>
                              </div>
                              <div>
                                <p className="font-extrabold text-sm">Commande #{String(cmd.commandeId ?? idx + 1).padStart(6, '0')}</p>
                                <p className="text-xs text-on-surface-variant mt-0.5">
                                  {cmd.refuges?.length > 0 ? cmd.refuges.filter(Boolean).join(', ') : 'Refuge partenaire'}
                                </p>
                                <p className="text-xs text-on-surface-variant">
                                  {isSimulated ? 'Paiement simulé' : ref}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              {cmd.Total_prix != null && (
                                <span className="font-extrabold text-primary">{Number(cmd.Total_prix).toLocaleString('fr-DZ')} DZD</span>
                              )}
                              <StatutBadge statut={paiementLabel} />
                              <StatutBadge statut={statutLabel} />
                            </div>

                            
                          </button>
                        )
                      })}
                    </div>
                  )}
                </FadeIn>
              )}

              {/* SECTION ADOPTIONS */}
              {activeSection === 'adoptions' && (
                <FadeIn className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
                  <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex items-center justify-between">
                    <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined">pets</span>
                      Mes demandes d'adoption
                    </h2>
                    <Link to="/animaux" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                      <span className="material-symbols-outlined text-base">add</span>
                      Faire une demande
                    </Link>
                  </div>

                  {isloading ? (
                    <div className="py-10 flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : adoptions.length === 0 ? (
                    <EmptyState
                      icon="pets"
                      message="Vous n'avez encore fait aucune demande d'adoption."
                      linkTo="/animaux"
                      linkLabel="Voir les animaux disponibles"
                    />
                  ) : (
                    <div className="divide-y divide-outline-variant">
                      {adoptions.map((adop, idx) => {
                        const isEnAttente = String(adop.StatutLabel ?? adop.Statut ?? '').toLowerCase().includes('attente')
                        const isAccepted = String(adop.StatutLabel ?? adop.Statut ?? '').toLowerCase().includes('accept')
                        const isRefused = String(adop.StatutLabel ?? adop.Statut ?? '').toLowerCase().includes('refus')
                        return (
                          <div key={adop.Id ? `adop-${adop.Id}` : `adop-idx-${idx}`} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0
                                ${isAccepted ? 'bg-primary-fixed' : isRefused ? 'bg-error-container' : 'bg-secondary-fixed'}`}>
                                <span className={`material-symbols-outlined text-xl
                                  ${isAccepted ? 'text-primary' : isRefused ? 'text-error' : 'text-secondary'}`}>pets</span>
                              </div>
                              <div>
                                <p className="font-extrabold text-sm">{adop.AnimalNom || `Animal #${adop.IdAnimal}`}</p>
                                <p className="text-xs text-on-surface-variant mt-0.5">
                                  {adop.RefugeNom && <span>{adop.RefugeNom} · </span>}
                                  {adop.DateDemande
                                    ? new Date(adop.DateDemande).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                                    : 'Date inconnue'}
                                </p>
                                {adop.CommentaireRetour && (
                                  <p className="text-xs text-on-surface-variant mt-1 italic border-l-2 border-outline-variant pl-2">
                                    Réponse du refuge : "{adop.CommentaireRetour}"
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <StatutBadge statut={adop.StatutLabel || adop.Statut || 'En attente'} />
                              {isAccepted && (
                                <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">celebration</span>
                                  Félicitations !
                                </span>
                              )}
                              {isEnAttente && (
                                <button
                                  onClick={async () => {
                                    if (!window.confirm('Annuler cette demande ?')) return
                                    try {
                                      await annulerDemandeAdoption(adop.Id)
                                      setAdoptions(prev => prev.filter(a => a.Id !== adop.Id))
                                    } catch {
                                      alert('Erreur lors de l\'annulation')
                                    }
                                  }}
                                  className="text-[10px] text-error font-bold flex items-center gap-1 hover:underline"
                                >
                                  <span className="material-symbols-outlined text-xs">cancel</span>
                                  Annuler
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </FadeIn>
              )}

              {/* SECTION RESERVATIONS SERVICES */}
              {activeSection === 'reservations' && (
                <FadeIn className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
                  <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex items-center justify-between">
                    <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined">event</span>
                      Mes réservations de services
                    </h2>
                    <Link
                      to="/services"
                      className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      Réserver un service
                    </Link>
                  </div>

                  {isloading ? (
                    <div className="py-10 flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : reservations.length === 0 ? (
                    <EmptyState
                      icon="event"
                      message="Vous n'avez encore aucune réservation de service."
                      linkTo="/services"
                      linkLabel="Voir les prestataires"
                    />
                  ) : (
                    <div className="divide-y divide-outline-variant">
                      {reservations.map((res, idx) => {
                        const sLabel = res.StatutLabel ?? res.Statut ?? 'En attente'
                        const isEnAttente = sLabel.toLowerCase().includes('attente')
                        return (
                          <div key={res.Id ? `res-${res.Id}` : `res-idx-${idx}`} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-secondary-fixed rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-secondary text-xl">handshake</span>
                              </div>
                              <div>
                                <p className="font-bold text-sm">
                                  {res.TypeServiceLabel ?? res.TypeService ?? `Réservation #${String(res.Id || idx + 1).padStart(4, '0')}`}
                                </p>
                                <p className="text-xs text-on-surface-variant mt-0.5">
                                  {res.PrestataireNom && <span className="font-bold">{res.PrestataireNom} · </span>}
                                  {res.DateDebut
                                    ? new Date(res.DateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                                    : 'Date à confirmer'}
                                  {res.PrixFinal && ` · ${Number(res.PrixFinal).toLocaleString('fr-DZ')} DZD`}
                                </p>
                                {res.Notes && (
                                  <p className="text-xs text-on-surface-variant mt-1 italic">"{res.Notes}"</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <StatutBadge statut={sLabel} />
                              {isEnAttente && (
                                <button
                                  onClick={async () => {
                                    if (!window.confirm('Annuler cette réservation ?')) return
                                    try {
                                      await cancelReservation(res.Id)
                                      setReservations(prev => prev.map(r => r.Id === res.Id ? { ...r, StatutLabel: 'Annulée', Statut: 'Annulée' } : r))
                                    } catch { alert('Erreur lors de l\'annulation') }
                                  }}
                                  className="text-[10px] text-error font-bold flex items-center gap-1 hover:underline"
                                >
                                  <span className="material-symbols-outlined text-xs">cancel</span>
                                  Annuler
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </FadeIn>
              )}

              {/* SECTION ANIMAUX */}
                {activeSection === 'animaux' && (
                    <FadeIn delay={0.2}>
                        <div className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
                        <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex justify-between items-center flex-wrap gap-4">
                            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined">pets</span>
                            Mes animaux
                            </h2>
                            <button
                            onClick={handleAddAnimal}
                            className="px-4 py-2 bg-primary text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm flex items-center gap-2"
                            >
                            <span className="material-symbols-outlined text-base">add</span>
                            Ajouter un animal
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {utilisateurLoading && (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                            )}
                            
                            {error && (
                            <div className="p-4 bg-error-container text-on-error-container border-2 border-black rounded-lg font-bold text-sm">
                                Erreur: {error}
                            </div>
                            )}
                            
                            {!utilisateurLoading && !error && utilisateur?.Animals?.length === 0 && (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">pets</span>
                                <p className="mt-4 text-on-surface-variant font-bold">Vous n'avez pas encore ajouté d'animaux</p>
                                <button
                                onClick={handleAddAnimal}
                                className="mt-4 px-6 py-3 bg-primary text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                >
                                Ajouter mon premier animal
                                </button>
                            </div>
                            )}
                            
                            {!utilisateurLoading && !error && utilisateur?.Animals?.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {utilisateur?.Animals?.map((animal) => (
                                <div key={animal.id} className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    {/* Image - à adapter selon ta structure AnimalCard */}
                                    <div className="relative h-40 bg-secondary-fixed">
                                    {animal.photos?.[0] ? (
                                        <img src={animal?.photos[0]?.Url} alt={animal.Nom} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/50">pets</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button
                                        onClick={() => handleEditAnimal(animal)}
                                        className="p-2 bg-white border-2 border-black rounded-lg hover:bg-primary-fixed transition-colors"
                                        >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button
                                        onClick={() => handleDeleteAnimal(animal.id)}
                                        className="p-2 bg-white border-2 border-black rounded-lg hover:bg-error-container transition-colors"
                                        >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                    </div>
                                    <div className="p-4">
                                    <h3 className="font-['Chewy'] text-xl text-primary">{animal.Nom}</h3>
                                    <p className="text-sm font-bold text-on-surface-variant">
                                        {animal.Race?.Nom} • {animal.Age} ans • {animal.Genre === 'oui' ? 'Mâle' : 'Femelle'}
                                    </p>
                                    {animal.Bio && (
                                        <p className="text-sm mt-2 line-clamp-2">{animal.Bio}</p>
                                    )}
                                    </div>
                                </div>
                                ))}
                            </div>
                            )}
                        </div>
                        </div>
                    

                
                    </FadeIn>
                )}
                {/* SECTION ANIMAUX */}
                {activeSection === 'favoris' && (
                    <FadeIn delay={0.2}>
                        <div className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
                        <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex justify-between items-center flex-wrap gap-4">
                            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined">favorite</span>
                            Mes favoris
                            </h2>
                            <button
                            
                            className="px-4 py-2 bg-primary text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm flex items-center gap-2"
                            >
                            <span className="material-symbols-outlined text-base">add</span>
                            Ajouter un animal
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {utilisateurLoading && (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                            )}
                            
                            {error && (
                            <div className="p-4 bg-error-container text-on-error-container border-2 border-black rounded-lg font-bold text-sm">
                                Erreur: {error}
                            </div>
                            )}
                            
                            {!utilisateurLoading && !error && utilisateur?.wishlist?.ligneWishlist?.length === 0 && (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">pets</span>
                                <p className="mt-4 text-on-surface-variant font-bold">Vous n'avez pas encore ajouté d'animaux</p>
                                <button
                                
                                className="mt-4 px-6 py-3 bg-primary text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                >
                                Ajouter mon premier animal
                                </button>
                            </div>
                            )}
                            
                            {!utilisateurLoading && !error && utilisateur?.wishlist?.ligneWishlist?.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {utilisateur?.wishlist?.ligneWishlist?.map((ligne) => (
                                <div key={ligne.Id} className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    {/* Image - à adapter selon ta structure AnimalCard */}
                                    <div className="relative h-40 bg-secondary-fixed">
                                    
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button
                                        
                                        className="p-2 bg-white border-2 border-black rounded-lg hover:bg-primary-fixed transition-colors"
                                        >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button
                                        
                                        className="p-2 bg-white border-2 border-black rounded-lg hover:bg-error-container transition-colors"
                                        >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                    </div>
                                    <div className="p-4">
                                    <h3 className="font-['Chewy'] text-xl text-primary">{ligne?.IdAnimal}</h3>
                                    
                                    {ligne?.IdProduit && (
                                        <p className="text-sm mt-2 line-clamp-2">{ligne?.Produit}</p>
                                    )}
                                    </div>
                                </div>
                                ))}
                            </div>
                            )}
                        </div>
                        </div>
                    

                
                    </FadeIn>
                )}

                {activeSection === "annonces" && (
                  <FadeIn>
                    <div className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">

                      <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex justify-between items-center">
                        <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined">campaign</span>
                          Mes annonces
                        </h2>

                        <button
                          onClick={() => setIsAnnonceModalOpen(true)}
                          className="px-4 py-2 bg-primary text-white font-bold border-2 border-black rounded-lg"
                        >
                          + Nouvelle annonce
                        </button>
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

                            <button
                              onClick={() => setIsAnnonceModalOpen(true)}
                              className="mt-6 px-6 py-3 bg-primary text-white font-bold border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                            >
                              Créer ma première annonce
                            </button>
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
                                  <div className="flex justify-between items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-primary">
                                        #{annonce.Id}
                                      </span>

                                      <span className="px-2 py-1 text-xs border border-black rounded-full bg-primary-fixed font-bold">
                                        {annonce.TypeAnnonce}
                                      </span>
                                    </div>

                                    <button
                                      onClick={() => {
                                        setSelectedAnnonce(annonce)
                                        setIsCandidaturesModalOpen(true)
                                      }}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary text-white border-2 border-black rounded-lg font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        group
                                      </span>
                                      Candidatures
                                    </button>
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
                                    className="flex-1 py-2 bg-primary text-white border-2 border-black rounded-lg font-bold"
                                  >
                                    Modifier
                                  </button>

                                  <button
                                    className="flex-1 py-2 bg-error text-white border-2 border-black rounded-lg font-bold"
                                  >
                                    Supprimer
                                  </button>

                                </div>

                              </div>
                            ))}

                          </div>
                        )}

                      </div>

                    </div>
                  </FadeIn>
                )}
            </main>
          </div>
        </div>
      </SignedIn>

      {/* Modal pour AnimalForm */}
      {showAnimalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex justify-between items-center">
              <h3 className="font-['Chewy'] text-2xl text-primary">
                {editingAnimal ? 'Modifier mon animal' : 'Ajouter un animal'}
              </h3>
              <button onClick={handleModalClose} className="p-2 hover:bg-black/10 rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <AnimalForm
                initialData={editingAnimal}
                refugeId={user?.unsafeMetadata?.refugeId} // À adapter selon ta logique
                onClose={handleModalClose}
                onSuccess={handleAnimalSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {selectedCommande && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-surface-container-lowest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          
          <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex justify-between items-center">
            <h3 className="font-['Chewy'] text-2xl text-primary">
              Commande #{String(selectedCommande.Id).padStart(6, "0")}
            </h3>

            <button
              onClick={() => setSelectedCommande(null)}
              className="p-2 hover:bg-black/10 rounded-lg"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-black rounded-xl p-4 bg-white">
                <p className="text-xs font-bold text-on-surface-variant uppercase">ID commande</p>
                <p className="font-extrabold">{selectedCommande.Id}</p>
              </div>

              <div className="border-2 border-black rounded-xl p-4 bg-white">
                <p className="text-xs font-bold text-on-surface-variant uppercase">Utilisateur</p>
                <p className="font-extrabold">#{selectedCommande.IdUtilisateur}</p>
              </div>

              <div className="border-2 border-black rounded-xl p-4 bg-white">
                <p className="text-xs font-bold text-on-surface-variant uppercase">Statut</p>
                <div className="mt-2">
                  <StatutBadge statut={selectedCommande.statut?.Statut ?? selectedCommande.Statut} />
                </div>
              </div>

              <div className="border-2 border-black rounded-xl p-4 bg-white">
                <p className="text-xs font-bold text-on-surface-variant uppercase">Total général</p>
                <p className="font-extrabold text-primary">
                  {Number(selectedCommande.totalGeneral ?? 0).toLocaleString("fr-DZ")} DZD
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-extrabold text-primary mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined">inventory_2</span>
                Sous-commandes
              </h4>

              {selectedCommande.sousCommandes?.length === 0 ? (
                <div className="border-2 border-black rounded-xl p-5 text-center text-on-surface-variant font-bold">
                  Aucune sous-commande trouvée pour cette commande.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedCommande.sousCommandes.map((sc) => (
                    <div
                      key={sc.Id}
                      className="border-2 border-black rounded-xl p-4 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-extrabold">Sous-commande #{sc.Id}</p>
                          <p className="text-xs text-on-surface-variant font-bold">
                            Refuge #{sc.IdRefuge}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-extrabold text-primary">
                            {Number(sc.Total_prix ?? 0).toLocaleString("fr-DZ")} DZD
                          </p>
                          <StatutBadge statut={sc.statut?.Statut ?? sc.Statut} />
                        </div>
                      </div>

                      {sc.stripe_transfer_id && (
                        <p className="text-xs mt-2 text-on-surface-variant">
                          Transfer Stripe : {sc.stripe_transfer_id}
                        </p>
                      )}

                      {sc.platformFee != null && (
                        <p className="text-xs text-on-surface-variant">
                          Frais plateforme : {Number(sc.platformFee).toLocaleString("fr-DZ")} DZD
                        </p>
                      )}

                      <div className="mt-4 border-t-2 border-outline-variant pt-3">
                        <p className="text-xs font-extrabold uppercase text-on-surface-variant mb-2">
                          Produits commandés
                        </p>

                        {sc.lignesCommande?.length === 0 ? (
                          <p className="text-xs text-on-surface-variant italic">
                            Aucun produit trouvé pour cette sous-commande.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {(() => {
                              const lignes = Array.isArray(sc?.lignesCommande)
                                ? sc.lignesCommande
                                : sc?.lignesCommande
                                  ? [sc.lignesCommande]
                                  : []

                              return lignes.length === 0 ? (
                                <p className="text-xs text-on-surface-variant italic">
                                  Aucun produit trouvé pour cette sous-commande.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {lignes.map((ligne) => (
                                    <div
                                      key={ligne.Id}
                                      className="flex items-center justify-between gap-3 bg-surface-container rounded-lg border border-black px-3 py-2"
                                    >
                                      <div>
                                        <p className="text-sm font-extrabold">
                                          Produit #{ligne.IdProduit ?? "—"}
                                        </p>
                                        <p className="text-xs text-on-surface-variant">
                                          Ligne #{ligne.Id}
                                        </p>
                                      </div>

                                      <span className="px-2 py-1 rounded-full border border-black text-xs font-extrabold bg-white">
                                        x{ligne.Quantite ?? 1}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    )}

    <Modal
      isOpen={isCandidaturesModalOpen}
      onClose={() => {
        setIsCandidaturesModalOpen(false)
        setSelectedAnnonce(null)
      }}
      title={`Candidatures annonce #${selectedAnnonce?.Id ?? ""}`}
      size="lg"
    >
      <div className="space-y-4">
        {candidaturesAnnonce.length === 0 ? (
          <div className="text-center py-10 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl opacity-30">
              group_off
            </span>
            <p className="mt-3 font-bold">
              Aucune candidature pour cette annonce.
            </p>
          </div>
        ) : (
          candidaturesAnnonce.map((reservation) => (
            <div
              key={reservation.Id}
              className="border-2 border-black rounded-xl p-4 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-extrabold text-primary">
                    Candidature #{reservation.Id}
                  </p>

                  <p className="text-sm text-on-surface-variant">
                    Prestataire #{reservation.IdProfil}
                  </p>

                  <p className="text-sm text-on-surface-variant">
                    Du {new Date(reservation.DateDebut).toLocaleDateString("fr-FR")} au{" "}
                    {new Date(reservation.DateFin).toLocaleDateString("fr-FR")}
                  </p>

                  {reservation.Notes && (
                    <p className="text-sm italic mt-2">
                      "{reservation.Notes}"
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-extrabold text-primary">
                    {Number(reservation.PrixFinal || 0).toLocaleString("fr-FR")} DZD
                  </p>

                  <StatutBadge statut={reservation.statut?.Statut || reservation.Statut} />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t-2 border-outline-variant pt-4">
                <button
                  onClick={() => handleUpdateReservationStatus(reservation.IdAnnonce, reservation.IdProfil, reservation.Id, 4)}
                  className="px-4 py-2 bg-primary text-white border-2 border-black rounded-lg font-bold"
                >
                  Valider
                </button>

                <button
                  onClick={() => handleUpdateReservationStatus(reservation.IdAnnonce, reservation.IdProfil, reservation.Id, 5)}
                  className="px-4 py-2 bg-error text-white border-2 border-black rounded-lg font-bold"
                >
                  Refuser
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>

    <AnnonceFormModal
        isOpen={isAnnonceModalOpen}
        onClose={() => setIsAnnonceModalOpen(false)}
        mode="utilisateur"
        animals = {utilisateur?.Animals || []}
        IdUtilisateur={utilisateur?.Id}
      />
    </PageTransition>
  )
}

export default UserProfile
