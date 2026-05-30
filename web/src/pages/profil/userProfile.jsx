import { Link } from 'react-router'
import { useUser, useClerk, SignedIn, SignedOut } from '@clerk/clerk-react'
import { PageTransition, FadeIn } from '../../components/Animations'
import AnimalForm from '../../components/forms/AnimalForm'
//import { useUserAnimals } from '../../hooks/useUserAnimals'
import { animalApi, utilisateurApi } from '../../lib/api'
import { useUtilisateur } from '../../hooks/useUtilisateur'
import { useState } from 'react'

const UserProfile = () => {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [showAnimalModal, setShowAnimalModal] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState(null)
  
  const {utilisateur,refetch,isLoading: loading,isError: error} = useUtilisateur(user?.id)

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
      refetch() // Recharge la liste
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
    
    refetch()
    handleModalClose()
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
          <Link to="/auth" className="px-8 py-4 bg-primary text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all">
            Se connecter / S'inscrire
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
          {/* Header profil */}
          <FadeIn className="bg-primary border-4 border-black shadow-[8px_8px_0px_0px_rgba(148,73,37,1)] rounded-xl p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative shrink-0">
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
                <span className="material-symbols-outlined text-primary text-xs" style={{ fontSize: '12px' }}>verified</span>
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="font-['Chewy'] text-4xl text-white mb-1">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Mon Profil'}
              </h1>
              <p className="text-white/70 font-bold text-sm mb-3">{user?.primaryEmailAddress?.emailAddress}</p>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-secondary-container text-base">
                  {user?.unsafeMetadata?.role === 'refuge' ? 'home_work' :
                   user?.unsafeMetadata?.role === 'prestataire' ? 'handshake' : 'person'}
                </span>
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  {user?.unsafeMetadata?.role === 'refuge' ? 'Gestionnaire de Refuge' :
                   user?.unsafeMetadata?.role === 'prestataire' ? 'Prestataire' : 'Utilisateur'}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut(() => window.location.href = '/')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border-2 border-white/30 text-white font-bold text-sm hover:bg-white/20 transition-colors rounded-lg"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Déconnexion
            </button>
          </FadeIn>

          {/* Sections info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Infos personnelles */}
            <FadeIn delay={0.1} className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
              <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex items-center justify-between">
                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">person</span>
                  Informations personnelles
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Prénom', value: user?.firstName || '—' },
                  { label: 'Nom', value: user?.lastName || '—' },
                  { label: 'Email', value: user?.primaryEmailAddress?.emailAddress || '—' },
                  { label: 'Téléphone', value: user?.unsafeMetadata?.telephone || '—' },
                  { label: 'Adresse', value: user?.unsafeMetadata?.adresse || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-4 py-2 border-b border-outline-variant last:border-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
                    <span className="font-bold text-sm text-right">{value}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Activité */}
            <FadeIn delay={0.2} className="space-y-5">
              <div className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
                <div className="bg-surface-container border-b-4 border-black px-6 py-4">
                  <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">history</span>
                    Mon activité
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { icon: 'pets', label: 'Favoris', value: '0', to: '/animaux' },
                    { icon: 'shopping_basket', label: 'Commandes', value: '0', to: '/boutique' },
                    { icon: 'description', label: 'Demandes d\'adoption', value: '0', to: '/animaux' },
                    { icon: 'event', label: 'Réservations services', value: '0', to: '/services' },
                  ].map(item => (
                    <Link key={item.label} to={item.to} className="flex items-center justify-between p-3 hover:bg-surface-container rounded-lg transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-fixed rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                        </div>
                        <span className="font-bold text-sm">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-primary">{item.value}</span>
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform text-lg">chevron_right</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-secondary-fixed border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-5">
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-sm text-primary uppercase tracking-wider mb-4">Actions rapides</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/animaux" className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-black rounded-xl hover:bg-primary-fixed transition-colors text-center">
                    <span className="material-symbols-outlined text-primary text-2xl">pets</span>
                    <span className="text-xs font-bold">Voir les animaux</span>
                  </Link>
                  <Link to="/boutique" className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-black rounded-xl hover:bg-secondary-fixed transition-colors text-center">
                    <span className="material-symbols-outlined text-secondary text-2xl">shopping_bag</span>
                    <span className="text-xs font-bold">Boutique</span>
                  </Link>
                  <Link to="/services" className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-black rounded-xl hover:bg-primary-fixed transition-colors text-center">
                    <span className="material-symbols-outlined text-primary text-2xl">handshake</span>
                    <span className="text-xs font-bold">Services</span>
                  </Link>
                  <Link to="/signalement" className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-black rounded-xl hover:bg-error-container transition-colors text-center">
                    <span className="material-symbols-outlined text-error text-2xl">report</span>
                    <span className="text-xs font-bold">Signaler</span>
                  </Link>
                </div>
              </div>
            </FadeIn>
            {/* SECTION MES ANIMAUX */}
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
                {loading && (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                
                {error && (
                  <div className="p-4 bg-error-container text-on-error-container border-2 border-black rounded-lg font-bold text-sm">
                    Erreur: {error}
                  </div>
                )}
                
                {!loading && !error && utilisateur?.Animals?.length === 0 && (
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
                
                {!loading && !error && utilisateur?.Animals?.length > 0 && (
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
                            {animal.Race?.Nom} • {animal.Age} ans • {animal.Genre === 'Male' ? 'Mâle' : 'Femelle'}
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
    </PageTransition>
  )
}

export default UserProfile
/*

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser, useClerk, SignedIn, SignedOut } from '@clerk/clerk-react'
import { PageTransition, FadeIn } from '../../components/Animations'
import AnimalForm from '../../components/forms/AnimalForm'
//import { useUserAnimals } from '../../hooks/useUserAnimals'
import { animalApi, utilisateurApi } from '../../lib/api'
import { useUtilisateur } from '../../hooks/useUtilisateur'


const UserProfile = () => {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [showAnimalModal, setShowAnimalModal] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState(null)
  
  const {utilisateur,refetch,isLoading: loading,isError: error} = useUtilisateur(user?.id)

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
      refetch() // Recharge la liste
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
    
    refetch()
    handleModalClose()
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
          <Link to="/auth" className="px-8 py-4 bg-primary text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all">
            Se connecter / S'inscrire
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
          {/* Header profil * /}
          <FadeIn className="bg-primary border-4 border-black shadow-[8px_8px_0px_0px_rgba(148,73,37,1)] rounded-xl p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative shrink-0">
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
                <span className="material-symbols-outlined text-primary text-xs" style={{ fontSize: '12px' }}>verified</span>
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="font-['Chewy'] text-4xl text-white mb-1">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Mon Profil'}
              </h1>
              <p className="text-white/70 font-bold text-sm mb-3">{user?.primaryEmailAddress?.emailAddress}</p>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-secondary-container text-base">
                  {user?.unsafeMetadata?.role === 'refuge' ? 'home_work' :
                   user?.unsafeMetadata?.role === 'prestataire' ? 'handshake' : 'person'}
                </span>
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  {user?.unsafeMetadata?.role === 'refuge' ? 'Gestionnaire de Refuge' :
                   user?.unsafeMetadata?.role === 'prestataire' ? 'Prestataire' : 'Utilisateur'}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut().then(() => window.location.href = '/')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border-2 border-white/30 text-white font-bold text-sm hover:bg-white/20 transition-colors rounded-lg"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Déconnexion
            </button>
          </FadeIn>

          {/* Informations personnelles * /}
          <FadeIn delay={0.1} className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
            <div className="bg-surface-container border-b-4 border-black px-6 py-4">
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">person</span>
                Informations personnelles
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Prénom', value: user?.firstName || '—' },
                { label: 'Nom', value: user?.lastName || '—' },
                { label: 'Email', value: user?.primaryEmailAddress?.emailAddress || '—' },
                { label: 'Téléphone', value: user?.unsafeMetadata?.telephone || '—' },
                { label: 'Adresse', value: user?.unsafeMetadata?.adresse || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4 py-2 border-b border-outline-variant last:border-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
                  <span className="font-bold text-sm text-right">{value}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* SECTION MES ANIMAUX * /}
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
                {loading && (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                
                {error && (
                  <div className="p-4 bg-error-container text-on-error-container border-2 border-black rounded-lg font-bold text-sm">
                    Erreur: {error}
                  </div>
                )}
                
                {!loading && !error && utilisateur?.Animals?.length === 0 && (
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
                
                {!loading && !error && utilisateur?.Animals?.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {utilisateur?.Animals?.map((animal) => (
                      <div key={animal.id} className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {/* Image - à adapter selon ta structure AnimalCard * /}
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
                            {animal.Race?.Nom} • {animal.Age} ans • {animal.Genre === 'Male' ? 'Mâle' : 'Femelle'}
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
        </div>
      </SignedIn>

      {/* Modal pour AnimalForm * /}
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
    </PageTransition>
  )
}

export default UserProfile*/