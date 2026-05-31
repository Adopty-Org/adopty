import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { PageTransition, FadeIn } from '../../components/Animations'
import Modal from '../../components/ui/Modal'
import AdoptionForm from '../../components/forms/AdoptionForm'
import { animalApi, especeApi, raceApi } from '../../lib/api'
import { useQuery } from '@tanstack/react-query'
import { useAnimals,useAnimal } from '../../hooks/useAnimal'
import Carousel from '../../components/ui/Carousel'
import { useRefuge } from '../../hooks/useRefuge'
import { useUtilisateurs } from '../../hooks/useUtilisateur'
//import { animaux } from '../data/mockData'

const Profil = () => {
  const { id } = useParams()
  console.log("L'id :   ", id)
  const [adoptionOpen, setAdoptionOpen] = useState(false)
  const [favoris, setFavoris] = useState(false)
  const {utilisateurMap, isLoading: utilisateurLoading} = useUtilisateurs()

  const {animal, isLoading: AnimalLoading, isError, error}= useAnimal(id)
  const {refuge, isLoading: RefugeLoading} = useRefuge(animal?.possessions[0]?.IdRefuge, utilisateurMap)

  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);

  const openCarousel = (startIndex) => {
    setCarouselStartIndex(startIndex);
    setShowCarousel(true);
  };
  
  const { data: photos = [] } = useQuery({
    queryKey: ["photos", id],
    queryFn: () => animalApi.getPhotos(id),
    enabled: !!id // évite bug au début
  })

  console.log("L'animal :   ", animal)
  console.log("Le refuge :   ", refuge)
  if (AnimalLoading || !animal || RefugeLoading || utilisateurLoading) {
    return <PageTransition><div className="p-12 text-center">Chargement…</div></PageTransition>
  }

  const openAdoptionModal = () => setAdoptionOpen(true)


  // Find animal by id or fallback to Barnabé
  //const animal = animaux.find(a => a.id === id) || animaux[0]

  if ((!refuge && !RefugeLoading) || animal?.possessions[0]?.IdRefuge === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-surface-container-lowest border-4 border-black rounded-3xl p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

          <div className="w-24 h-24 mx-auto mb-6 bg-error-container border-4 border-black rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-error text-5xl">
              pets
            </span>
          </div>

          <h2 className="font-['Chewy'] text-4xl text-primary mb-3">
            Animal indisponible
          </h2>

          <p className="text-on-surface-variant font-bold leading-relaxed mb-6">
            Cet animal n'est actuellement rattaché à aucun refuge.
            Il ne peut donc pas être proposé à l'adoption pour le moment.
          </p>

          <div className="bg-secondary-fixed border-2 border-black rounded-xl p-4 mb-6">
            <p className="text-sm font-bold text-on-surface">
              L'animal est probablement en cours de transfert,
              d'archivage ou son dossier est incomplet.
            </p>
          </div>

          <Link
            to="/refanimal"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-xl"
          >
            <span className="material-symbols-outlined">
              arrow_back
            </span>
            Retour aux animaux
          </Link>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link to="/refanimal" className="inline-flex items-center gap-2 mb-8 text-primary font-bold group">
          <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
          <span className="font-['Plus_Jakarta_Sans'] uppercase tracking-wider text-sm">Retour à la recherche</span>
        </Link>

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
          {/* Gallery */}
          <FadeIn className="lg:col-span-7 grid grid-cols-2 gap-4">
            {/*<div className="col-span-2 relative overflow-hidden rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(148,73,37,1)] aspect-16/10">
              {<img alt={animal?.Nom} className="w-full h-full object-cover" src={photos[0]?.Url} />}
              <div className="absolute bottom-4 left-4 bg-primary text-white px-4 py-2 font-['Plus_Jakarta_Sans'] font-bold rounded-lg border-2 border-black">
                ALBUM DE {animal?.Nom?.toUpperCase()}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border-4 border-black aspect-square bg-primary-fixed flex items-center justify-center">
              {<img alt={`${animal?.Nom} portrait`} className="w-full h-full object-cover" src={photos[0]?.Url} style={{ filter: 'saturate(0.7) contrast(1.1)' }} />}
            </div>
            <div className="relative overflow-hidden rounded-xl border-4 border-black aspect-square bg-secondary-container flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white z-10">
                <span className="material-symbols-outlined text-4xl mb-1">add_a_photo</span>
                <span className="font-['Plus_Jakarta_Sans'] font-bold">+12 PHOTOS</span>
              </div>
              {/*<img alt="More photos" className="w-full h-full object-cover group-hover:scale-105 transition-transform" src={animal.photo} />* /}
            </div>*/}
            <FadeIn className="lg:col-span-7 grid grid-cols-2 gap-4">
              {/* Première photo (grande, prend 2 colonnes) */}
              {animal?.photos?.length >= 1 && (
                <div 
                  className="col-span-2 relative overflow-hidden rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(148,73,37,1)] aspect-16/10 group cursor-pointer"
                  onClick={() => openCarousel(0)}
                >
                  <img 
                    alt={animal?.Nom} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    src={animal?.photos[0]?.Url} 
                  />
                  <div className="absolute bottom-4 left-4 bg-primary text-white px-4 py-2 font-['Plus_Jakarta_Sans'] font-bold rounded-lg border-2 border-black">
                    ALBUM DE {animal?.Nom?.toUpperCase()}
                  </div>
                </div>
              )}

              {/* Deuxième photo (petite carrée) */}
              {animal?.photos?.length >= 2 && (
                <div 
                  className="relative overflow-hidden rounded-xl border-4 border-black aspect-square bg-primary-fixed flex items-center justify-center group cursor-pointer"
                  onClick={() => openCarousel(1)}
                >
                  <img 
                    alt={`${animal?.Nom} portrait`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    src={animal?.photos[1]?.Url} 
                    style={{ filter: 'saturate(0.7) contrast(1.1)' }} 
                  />
                </div>
              )}

              {/* Troisième case dynamique */}
              {animal?.photos?.length === 2 && (
                // EXACTEMENT 2 photos → bouton "+0 PHOTO"
                <div 
                  className="relative overflow-hidden rounded-xl border-4 border-black aspect-square bg-secondary-container flex items-center justify-center group cursor-pointer"
                  onClick={() => openCarousel(0)}
                >
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white z-10 transition-all group-hover:bg-black/50">
                    <span className="material-symbols-outlined text-4xl mb-1">add_a_photo</span>
                    <span className="font-['Plus_Jakarta_Sans'] font-bold">
                      +{animal?.photos.length - 2} PHOTO
                    </span>
                  </div>
                  <img 
                    alt="More photos" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    src={animal?.photos[1]?.Url} 
                  />
                </div>
              )}

              {animal?.photos?.length >= 3 && (
                // 3 photos ou plus → afficher la 3ème photo
                <div 
                  className="relative overflow-hidden rounded-xl border-4 border-black aspect-square bg-secondary-container flex items-center justify-center group cursor-pointer"
                  onClick={() => openCarousel(2)}
                >
                  <img 
                    alt={`${animal?.Nom} photo 3`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    src={animal?.photos[2]?.Url} 
                  />
                </div>
              )}

              {animal?.photos?.length === 1 && (
                // EXACTEMENT 1 photo → placeholder
                <div className="relative overflow-hidden rounded-xl border-4 border-black aspect-square bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 font-['Plus_Jakarta_Sans']">Aucune photo</span>
                </div>
              )}

              {/* Bouton supplémentaire pour 4+ photos (4ème case) */}
              {animal?.photos?.length > 3 && (
                <div 
                  className="relative overflow-hidden rounded-xl border-4 border-black aspect-square bg-secondary-container flex items-center justify-center group cursor-pointer"
                  onClick={() => openCarousel(0)}
                >
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white z-10 transition-all group-hover:bg-black/50">
                    <span className="material-symbols-outlined text-4xl mb-1">add_a_photo</span>
                    <span className="font-['Plus_Jakarta_Sans'] font-bold">
                      +{animal?.photos.length - 3} PHOTO{animal?.photos.length - 3 > 1 ? 'S' : ''}
                    </span>
                  </div>
                  <img 
                    alt="More photos" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    src={animal?.photos[3]?.Url || animal?.photos[0]?.Url} 
                  />
                </div>
              )}
            </FadeIn>

            {/* Composant Carousel (à implémenter) */}
            {showCarousel && (
              <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
                <div className="relative max-w-4xl w-full mx-4">
                  <button 
                    onClick={() => setShowCarousel(false)}
                    className="absolute -top-12 right-0 text-white text-2xl"
                  >
                    ✕
                  </button>
                  {/* Ton carousel ici */}
                  {/* Carousel Modal - à placer après tout le contenu */}
                  {showCarousel && (
                    <Carousel 
                      photos={animal.photos}
                      initialIndex={carouselStartIndex}
                      onClose={() => setShowCarousel(false)}
                    />
                  )}
                </div>
              </div>
            )}
          </FadeIn>

          {/* Profile Info Card */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <FadeIn delay={0.1} className="bg-surface-container-high p-8 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(21,66,18,1)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="bg-secondary text-white px-3 py-1 rounded-full text-xs font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-widest mb-2 inline-block">{animal.Id}</span>
                  <h1 className="text-5xl font-['Chewy'] text-primary mb-1">{animal.Nom}</h1>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-secondary text-lg">
                    {animal?.Race?.Nom}
                    {animal?.Race?.Espece?.Nom && <span className="text-on-surface-variant font-normal"> · {animal?.Race?.Espece?.Nom}</span>}
                    <span className="mx-2">•</span>{animal?.Age}
                  </p>
                </div>
                <button
                  onClick={() => setFavoris(v => !v)}
                  className="w-12 h-12 bg-white rounded-full border-2 border-black hover:bg-red-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-red-500 text-2xl" style={{ fontVariationSettings: favoris ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 py-5 border-y-2 border-black/10 my-5">
                {[
                  { icon: 'straighten', label: 'Taille', value: animal?.TailleDisplay ?? animal?.Taille },
                  { icon: 'scale', label: 'Poids', value: animal?.Poids },
                  { icon: 'health_and_safety', label: 'Santé', value: animal?.EtatSantee
                    ? (animal?.EtatSantee === 'Excellent' ? '😄 Excellent' : animal?.EtatSantee === 'Bon' ? '🙂 Bon' : '😟 Mauvais')
                    : animal?.Santee },
                  { icon: 'location_on', label: 'Lieu', value: /*animal?.Lieu*/ refuge?.Addresse || 'Inconnu' },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg text-lg">{icon}</span>
                    <div>
                      <span className="text-xs uppercase font-bold text-on-surface-variant block">{label}</span>
                      <span className="font-bold text-sm">{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <button
                  onClick={openAdoptionModal}
                  className="w-full bg-[#154212] text-white py-4 px-8 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3 group font-['Plus_Jakarta_Sans'] font-extrabold text-lg uppercase"
                >
                  Demander une rencontre
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">pets</span>
                </button>
                <p className="text-center text-sm text-on-surface-variant italic">
                  {animal?.Nom} attend sa famille depuis <strong>{animal?.JoursRefuge} jours</strong>.
                </p>
              </div>
            </FadeIn>

            {/* Traits */}
            <FadeIn delay={0.2} className="flex flex-wrap gap-2">
              {animal?.Caractere?.map(c => (
                <span key={c} className="bg-secondary-fixed text-on-secondary-container px-4 py-2 rounded-full border-2 border-black flex items-center gap-1.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="material-symbols-outlined text-sm">pets</span> {c}
                </span>
              ))}
            </FadeIn>
          </div>
        </div>

        {/* Detail Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            <FadeIn>
              <h2 className="text-3xl font-['Chewy'] text-primary mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl">description</span> L'histoire de {animal.Nom}
              </h2>
              <div className="bg-surface-container-lowest p-7 rounded-xl border-l-8 border-secondary leading-relaxed text-base shadow-sm">
                {animal.Description && animal.Description.trim()
                  ? animal.Description
                  : <span className="text-on-surface-variant italic">Aucune histoire renseignée pour le moment. Contactez le refuge pour en savoir plus sur {animal.Nom}.</span>
                }
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-3xl font-['Chewy'] text-primary mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl">star</span> Besoins &amp; Vie quotidienne
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-tertiary-fixed text-on-tertiary-fixed p-5 rounded-xl border-2 border-black">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined">directions_run</span>
                    <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm uppercase">Activité physique</h3>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {animal?.Energie === 'Haut'
                      ? `${animal?.Nom} est très actif — plusieurs sorties par jour et de l'exercice intense sont nécessaires.`
                      : animal?.Energie === 'Bas'
                      ? `${animal?.Nom} est calme. Des promenades douces quotidiennes suffisent.`
                      : `${animal?.Nom} a besoin de sorties régulières et de stimulation physique quotidienne.`
                    }
                  </p>
                </div>
                <div className="bg-primary-fixed text-on-primary-fixed-variant p-5 rounded-xl border-2 border-black">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined">psychology</span>
                    <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm uppercase">Stimulation mentale</h3>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {(animal?.Caractere?.some(c => ['Curieux', 'Joueur', 'Sportif'].includes(c)))
                      ? `${animal?.Nom} est ${animal?.Caractere?.filter(c => ['Curieux', 'Joueur', 'Sportif'].includes(c)).join(', ').toLowerCase()} — des jouets d'occupation et jeux variés sont essentiels.`
                      : `Des interactions régulières et quelques jouets suffiront à stimuler ${animal?.Nom}.`
                    }
                  </p>
                </div>
                <div className="bg-secondary-fixed text-on-secondary-fixed p-5 rounded-xl border-2 border-black">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined">pets</span>
                    <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm uppercase">Autres animaux</h3>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {(animal?.SociableAnimaux === 'oui' || animal?.SociableAnimaux === true)
                      ? `${animal?.Nom} est sociable avec les autres animaux. Une introduction progressive est recommandée.`
                      : `${animal?.Nom} préfère être le seul animal du foyer.`
                    }
                  </p>
                </div>
                <div className="bg-surface-container-highest text-on-surface p-5 rounded-xl border-2 border-black">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined">home</span>
                    <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm uppercase">Type de foyer</h3>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {animal?.Habitat} recommandé.{(animal?.SociableEnfant === 'oui' || animal?.SociableEnfant === true) ? ` Compatible avec les enfants.` : ''}
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-3xl font-['Chewy'] text-primary mb-5 flex items-center gap-2 mt-10">
                <span className="material-symbols-outlined text-3xl">location_on</span> Où rencontrer {animal.Nom} ?
              </h2>
              <div className="relative rounded-2xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(21,66,18,1)] bg-white group">
                {/* Dark top strip */}
                <div className="bg-[#154212] px-6 py-4 flex items-center justify-between">
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">
                    {refuge ? refuge.ville + ' · ' + refuge.codePostal : 'Refuge'}
                  </p>
                  {refuge && (
                    <Link
                      to={`/refuges?refuge=${refuge.Id}`}
                      className="text-xs font-bold text-secondary-fixed hover:text-white underline underline-offset-2 transition-colors"
                    >
                      Voir tous les refuges →
                    </Link>
                  )}
                </div>

                {/* Location card body */}
                <div className="p-6 flex items-start gap-5">
                  <div className="bg-red-50 p-4 rounded-xl border-2 border-black flex-shrink-0">
                    <span className="material-symbols-outlined text-red-600 text-3xl block">location_on</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[#1a1c18] text-lg leading-tight">
                      {refuge ? refuge.Nom : animal.lieu}
                    </h4>
                    {refuge && (
                      <>
                        <p className="text-sm text-gray-500 font-medium mt-0.5">{refuge.Addresse}</p>
                        <div className="flex flex-wrap gap-4 mt-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">phone</span>
                            {refuge.Telephone}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* CTA button */}
                {refuge && (
                  <div className="px-6 pb-6">
                    <Link
                      to={`/refuges?refuge=${refuge?.Id}`}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#154212] text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-xl"
                    >
                      <span className="material-symbols-outlined text-lg">apartment</span>
                      Visiter le profil du refuge
                    </Link>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <FadeIn>
              <div className="bg-[#154212] text-white p-7 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(254,158,114,1)]">
                <h3 className="text-2xl font-['Chewy'] mb-5">Adopter {animal.Nom}</h3>
                <ul className="space-y-4">
                  {['Remplissez le formulaire en ligne.', 'Contact téléphonique avec nos bénévoles.', 'Rencontre physique au refuge.'].map((step, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center font-extrabold">{i + 1}</span>
                      <p className="text-sm pt-1">{step}</p>
                    </li>
                  ))}
                </ul>
                <button onClick={openAdoptionModal} className="mt-6 w-full py-3 bg-secondary text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                  Commencer →
                </button>
              </div>
            </FadeIn>



            <FadeIn delay={0.2}>
              <Link to="/boutique" className="block bg-white p-5 rounded-xl border-4 border-black text-center group hover:bg-secondary-fixed transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <span className="material-symbols-outlined text-tertiary text-4xl mb-2 block group-hover:scale-110 transition-transform">volunteer_activism</span>
                <h4 className="font-['Plus_Jakarta_Sans'] font-extrabold uppercase text-sm tracking-tight">Soutenir le refuge</h4>
                <p className="text-xs text-on-surface-variant mt-1">Achetez en boutique — 90% reversés au refuge</p>
              </Link>
            </FadeIn>
          </aside>
        </div>
      </div>

      {/* Modal adoption */}                                                      {/**/}
      <Modal isOpen={adoptionOpen} onClose={() => setAdoptionOpen(false)} title={`Adopter ${animal?.Nom}`} size="md">
        {<AdoptionForm animal={animal} onClose={() => setAdoptionOpen(false)} />}
      </Modal>
    </PageTransition>
  )
}

export default Profil
