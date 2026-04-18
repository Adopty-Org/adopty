import { useState } from 'react'
import { PageTransition, FadeIn } from '../../components/Animations'
//import { racesInfo } from '../data/mockData'
import BreedDetailModal from '../../components/ui/BreedDetailModal'
import { especeApi, raceApi } from '../../lib/api'
import { useQuery } from '@tanstack/react-query'

const Encyclopedie = () => {
  const [search, setSearch] = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState('Tous')
  const [selectedBreed, setSelectedBreed] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {data:RacesData, isLoading:RacesLoading} = useQuery({
    queryKey: ["races"],
    queryFn: raceApi.getAll,
  })

  const {data:EspecesData, isLoading:EspecesLoading} = useQuery({
    queryKey: ["especes"],
    queryFn: especeApi.getAll,
  }) 


  const races = RacesData ?? []
  const especes = EspecesData ?? []

  const especeMap = new Map(especes.map(e => [e.Id, e]))

  const racesWithEspece = races.map(r => ({
    ...r,
    EspeceObj: especeMap.get(r.Espece)
  }))

  console.log(racesWithEspece)

  const filterRaces = racesWithEspece.filter(r => {
    const matchesSearch = r?.Nom?.toLowerCase()?.includes(search?.toLowerCase())
    const matchesSpecies = selectedSpecies === 'Tous' || r?.EspeceObj?.Nom === selectedSpecies
    return matchesSearch && matchesSpecies
  })

  const openModal = (breed) => {
    setSelectedBreed(breed)
    setIsModalOpen(true)
  }

  const SPECIES = ['Tous', 'Chien', 'Chat', 'Lapin']

  console.log(races)

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-12 ">
        {/* Header Section */}
        <FadeIn className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="bg-secondary text-white px-4 py-1 rounded-full border-2 border-black font-black text-xs uppercase tracking-widest mb-4 inline-block shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Encyclopédie Adopty</span>
              <h1 className="font-'Chewy' text-5xl md:text-8xl text-primary leading-none mb-6">Découvrez les Races</h1>
              <p className="font-'Plus_Jakarta_Sans' text-xl text-on-surface-variant">Apprenez-en plus sur les besoins, le caractère et l'histoire de chaque espèce pour une adoption réussie.</p>
            </div>
            
            {/* Search Bar */}
            <div className="w-full md:w-80">
              <div className="relative group">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Chercher une race..."
                  className="w-full bg-white border-4 border-black p-4 pr-12 rounded-2xl font-bold focus:outline-none focus:ring-0 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary text-3xl">search</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Species Filters */}
        <FadeIn delay={0.1} className="flex flex-wrap gap-4 mb-12">
          {['Tous', ...especes.map(e => e.Nom)].map((nom, i) => (
            <button
              key={i}
              onClick={() => setSelectedSpecies(nom)}
              className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest border-4 border-black transition-all
                ${selectedSpecies === nom 
                  ? 'bg-primary text-white shadow-none translate-x-1 translate-y-1' 
                  : 'bg-white hover:bg-primary/10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}
            >
              {nom}
            </button>
          ))}
        </FadeIn>

        {/* Breed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filterRaces.length > 0 ? (
            filterRaces.map((breed, i) => (
              <FadeIn key={breed.Id} delay={i * 0.05}>
                <div 
                  onClick={() => openModal(breed)}
                  className="group bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer h-full flex flex-col"
                >
                  <div className="h-60 overflow-hidden relative border-b-4 border-black">
                    {/*<img src={breed.photo} alt={breed.Nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />*/}
                    <div className="absolute top-4 left-4">
                       <span className="bg-white text-primary px-3 py-1 border-2 border-black font-black text-[10px] uppercase tracking-tighter rounded-lg">{breed?.EspeceObj?.Nom}</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-'Chewy' text-3xl text-primary mb-2 group-hover:text-secondary transition-colors">{breed.Nom}</h3>
                    <p className="text-sm font-bold text-on-surface-variant line-clamp-2 mb-4 opacity-70 italic">{breed.Description}</p>
                    
                    {/*<div className="mt-auto pt-4 flex flex-wrap gap-2">
                       {breed.traits?.slice(0, 2).map(t => (
                         <span key={t} className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-surface-container border border-black/10 rounded-full">{t}</span>
                       ))}
                    </div>*/}
                  </div>
                  <div className="bg-primary text-white p-4 font-black uppercase text-center text-xs tracking-widest group-hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                    En savoir plus <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </div>
                </div>
              </FadeIn>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="font-'Chewy' text-4xl text-on-surface-variant/30">Aucun résultat trouvé...</p>
            </div>
          )}
        </div>

        {/* Breed Modal */}
        <BreedDetailModal 
          breed={selectedBreed} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    </PageTransition>
  )
}

export default Encyclopedie
