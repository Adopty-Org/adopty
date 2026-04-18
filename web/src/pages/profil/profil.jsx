import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { PageTransition, FadeIn } from '../../components/Animations'
import Modal from '../../components/ui/Modal'
import AdoptionForm from '../../components/forms/AdoptionForm'
import { animalApi, especeApi, raceApi } from '../../lib/api'
import { useQuery } from '@tanstack/react-query'
//import { animaux } from '../data/mockData'

const Profil = () => {
  const { id } = useParams()
  console.log("L'id :   ", id)
  const [adoptionOpen, setAdoptionOpen] = useState(false)
  const [favoris, setFavoris] = useState(false)

  const {data:AnimalData, isLoading:AnimalLoading} = useQuery({
    queryKey: ["animaux"],
    queryFn: () => animalApi.getSpecific(id),
    enabled: !!id
  })

  const {data:RacesData, isLoading:RacesLoading} = useQuery({
    queryKey: ["races"],
    queryFn: raceApi.getAll,
  })

  const {data:EspecesData, isLoading:EspecesLoading} = useQuery({
    queryKey: ["especes"],
    queryFn: especeApi.getAll,
  }) 

  const animalRaw = AnimalData
  const races = RacesData ?? []
  const especes = EspecesData ?? []

  const raceMap = new Map(races.map(r => [r.Id, r]))
  const especeMap = new Map(especes.map(e => [e.Id, e]))

  const getTailleLabel = (cm) => {
    if (cm <= 30) return 'Petit'
    if (cm <= 60) return 'Moyen'
    return 'Grand'
  }

  

  const animal = animalRaw
    ? (() => {
        const race = raceMap.get(animalRaw.Race)
        const espece = race ? especeMap.get(race.Espece) : undefined

        return {
          ...animalRaw,
          TailleLabel: getTailleLabel(animalRaw.Taille),
          Race: race
            ? {
                Id: race.Id,
                Nom: race.Nom,
                Espece: espece
                  ? {
                      Id: espece.Id,
                      Nom: espece.Nom
                    }
                  : null
              }
            : null
        }
      })()
    : null

  
  const { data: photos = [] } = useQuery({
    queryKey: ["photos", id],
    queryFn: () => animalApi.getPhotos(id),
    enabled: !!id // évite bug au début
  })

  console.log("L'animal :   ", animal)


  // Find animal by id or fallback to Barnabé
  //const animal = animaux.find(a => a.id === id) || animaux[0]

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link to="/animaux" className="inline-flex items-center gap-2 mb-8 text-primary font-bold group">
          <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
          <span className="font-['Plus_Jakarta_Sans'] uppercase tracking-wider text-sm">Retour à la recherche</span>
        </Link>

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
          {/* Gallery */}
          <FadeIn className="lg:col-span-7 grid grid-cols-2 gap-4">
            <div className="col-span-2 relative overflow-hidden rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(148,73,37,1)] aspect-16/10">
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
              {/*<img alt="More photos" className="w-full h-full object-cover group-hover:scale-105 transition-transform" src={animal.photo} />*/}
            </div>
          </FadeIn>

          {/* Profile Info Card */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <FadeIn delay={0.1} className="bg-surface-container-high p-8 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(21,66,18,1)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="bg-secondary text-white px-3 py-1 rounded-full text-xs font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-widest mb-2 inline-block">{animal.Id}</span>
                  {<h1 className="text-5xl font-['Chewy'] text-primary mb-1">{animal?.Nom}</h1>}
                  {<p className="font-['Plus_Jakarta_Sans'] font-bold text-secondary text-lg">{animal?.Race?.Nom} • {animal?.Age}</p>}
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
                  { icon: 'straighten', label: 'Taille', value: `${animal.Taille} (${animal.Poids}Kg)` },
                  { icon: 'health_and_safety', label: 'Santé', value: animal.EtatSantee },
                  //{ icon: 'location_on', label: 'Lieu', value: animal.lieu },
                  //{ icon: 'home_work', label: 'Habitat idéal', value: animal.habitat },
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
                  onClick={() => setAdoptionOpen(true)}
                  className="w-full bg-[#154212] text-white py-4 px-8 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all flex items-center justify-center gap-3 group font-['Plus_Jakarta_Sans'] font-extrabold text-lg uppercase"
                >
                  Demander une rencontre
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">pets</span>
                </button>
                <p className="text-center text-sm text-on-surface-variant italic">
                  {animal.Nom} attend sa famille depuis <strong>{/*animal.joursRefuge*/} jours</strong>.
                </p>
              </div>
            </FadeIn>

            {/* Traits */}
            <FadeIn delay={0.2} className="flex flex-wrap gap-2">
              {/*animal.caractere.map(c => (
                <span key={c} className="bg-secondary-fixed text-on-secondary-container px-4 py-2 rounded-full border-2 border-black flex items-center gap-1.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="material-symbols-outlined text-sm">pets</span> {c}
                </span>
              ))*/}
            </FadeIn>
          </div>
        </div>

        {/* Detail Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            <FadeIn>
              <h2 className="text-3xl font-['Chewy'] text-primary mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl">description</span> L'histoire de {animal?.Nom}
              </h2>
              <div className="bg-surface-container-lowest p-7 rounded-xl border-l-8 border-secondary leading-relaxed text-base shadow-sm">
                {animal?.Description}
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-3xl font-['Chewy'] text-primary mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl">star</span> Besoins & Vie quotidienne
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { icon: 'directions_run', bg: 'bg-tertiary-fixed text-on-tertiary-fixed', title: 'Activité physique', text: `${animal.Nom} a besoin de sorties régulières et de stimulation physique quotidienne.` },
                  { icon: 'psychology', bg: 'bg-primary-fixed text-on-primary-fixed-variant', title: 'Stimulation mentale', text: 'Jouets d\'occupation et d\'interaction pour canaliser son énergie.' },
                  { icon: 'pets', bg: 'bg-secondary-fixed text-on-secondary-fixed', title: 'Autres animaux', text: 'Sociable. Une rencontre avec vos animaux actuels sera organisée au refuge.' },
                  //{ icon: 'home', bg: 'bg-surface-container-highest text-on-surface', title: 'Type de foyer', text: `${animal.habitat} recommandé.` },
                ].map(({ icon, bg, title, text }) => (
                  <div key={title} className={`${bg} p-5 rounded-xl border-2 border-black`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined">{icon}</span>
                      <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm uppercase">{title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <FadeIn>
              <div className="bg-[#154212] text-white p-7 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(254,158,114,1)]">
                <h3 className="text-2xl font-['Chewy'] mb-5">Adopter {animal?.Nom}</h3>
                <ul className="space-y-4">
                  {['Remplissez le formulaire en ligne.', 'Contact téléphonique avec nos bénévoles.', 'Rencontre physique au refuge.'].map((step, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="shrink-0 w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center font-extrabold">{i + 1}</span>
                      <p className="text-sm pt-1">{step}</p>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setAdoptionOpen(true)} className="mt-6 w-full py-3 bg-secondary text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all">
                  Commencer →
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="bg-surface-container-low p-6 rounded-xl border-2 border-black relative overflow-hidden">
                <span className="material-symbols-outlined absolute -top-2 -right-2 text-8xl text-black/5 rotate-12">format_quote</span>
                <p className="italic text-on-surface-variant relative z-10 text-sm leading-relaxed">"{animal?.Nom} est le rayon de soleil du refuge. Il accueille chaque visiteur avec un enthousiasme débordant mais toujours respectueux."</p>
                <p className="mt-3 font-bold text-primary text-sm">— Sarah, Soigneuse</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Link to="/boutique" className="block bg-white p-5 rounded-xl border-4 border-black text-center group hover:bg-secondary-fixed transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <span className="material-symbols-outlined text-tertiary text-4xl mb-2 block group-hover:scale-110 transition-transform">volunteer_activism</span>
                <h4 className="font-['Plus_Jakarta_Sans'] font-extrabold uppercase text-sm tracking-tight">Soutenir le refuge</h4>
                <p className="text-xs text-on-surface-variant mt-1">Achetez en boutique — 10% reversés au refuge</p>
              </Link>
            </FadeIn>
          </aside>
        </div>
      </div>

      {/* Modal adoption */}                                                      {/**/}
      <Modal isOpen={adoptionOpen} onClose={() => setAdoptionOpen(false)} title={`Adopter ${animal?.Nom}`} size="md">
        {/*<AdoptionForm animal={animal} onClose={() => setAdoptionOpen(false)} />*/}
      </Modal>
    </PageTransition>
  )
}

export default Profil
