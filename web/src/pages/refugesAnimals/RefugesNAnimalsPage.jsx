import { PageTransition, FadeIn } from '../../components/Animations'
import { useQuery } from '@tanstack/react-query'
import { animalApi, refugeApi } from '../../lib/api'
import AnimalCard from '../../components/ui/AnimalCard'
import { useFilters } from '../../hooks/useFilters'
import Pagination from '../../components/ui/Pagination'
import { useState } from 'react'
import { useCaracteres } from '../../hooks/useCaractere'

/*const*/ //let  ESPECES = ['Tous']//, 'Chien', 'Chat', 'Lapin']
const TAILLES = ['Petit', 'Moyen', 'Grand']
const CARACTERES = ['Joueur', 'Calme', 'Sociable', 'Sportif', 'Affectueux']
const TRAITS = [
  { id: 'Enfants', label: 'Ami des enfants', icon: 'child_care' },
  { id: 'Appartement', label: 'Vie en appartement', icon: 'apartment' },
  { id: 'Sportif', label: 'Besoin d\'exercice', icon: 'fitness_center' },
  { id: 'Calme', label: 'Tempérament calme', icon: 'bedtime' }
]
const ITEMS_PER_PAGE = 6

const RefugesNAnimals = () => {

  const [currentPage, setCurrentPage] = useState(1)
  const {CaracteresLoading,caracteres} = useCaracteres()

  const { 
    especes,
    espece, setEspece, 
    race, setRace, 
    availableRaces,
    taille, toggleTaille, 
    caractere, toggleCaractere, 
    selectedTraits, toggleTrait,
    search, setSearch, 
    reset, filteredAnimaux, 
    isLoading
  } = useFilters()

  const ESPECES = especes ?? ['Tous']
  const [showCaracteres, setShowCaracteres] = useState(false)
  //const activeFilterCount = [race !== 'Tous', search.trim(), prixMin !== '', prixMax !== '', stockOnly].filter(Boolean).length
  const activeFilterCount =
    (espece !== 'Tous' ? 1 : 0) +
    (race !== 'Tous' ? 1 : 0) +
    (search.trim() !== '' ? 1 : 0) +
    taille.length +
    caractere.length +
    selectedTraits.length

  // 🛡️ GARDE-FOU N°2 : Affichage conditionnel
  if (isLoading) {
    return <div className="flex justify-center p-12">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  }

  // 🛡️ GARDE-FOU N°3 : Sécurité absolue
  /*if (!filteredAnimaux.length) {
    return <div className="text-center p-12 text-gray-500">Aucun animal disponible</div>
  }*/

  const totalPages = Math.ceil(filteredAnimaux.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredAnimaux.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <FadeIn className="flex flex-col gap-3 mb-12">
          <h1 className="font-['Chewy'] text-5xl md:text-7xl text-primary leading-tight">Nos compagnons à l'adoption</h1>
          <p className="text-xl text-on-surface-variant max-w-2xl font-body">Trouvez l'âme sœur parmi nos protégés. Chaque animal a une histoire unique qui n'attend que vous.</p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-28">
            <FadeIn className="bg-white p-6 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(21,66,18,1)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-secondary">tune</span> Filtres
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 bg-secondary text-white text-[11px] font-extrabold rounded-full flex items-center justify-center border border-black">
                      {activeFilterCount}
                    </span>
                  )}
                </h2>
                {activeFilterCount > 0 && (
                  <button onClick={reset} className="text-xs font-bold text-secondary hover:underline uppercase tracking-wider">Reset</button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block font-bold text-xs uppercase tracking-widest mb-3 text-on-surface-variant">Rechercher</label>
                <div className="relative">
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Nom de l'animal..."
                    className="w-full border-2 border-black px-4 py-3 pr-10 text-sm focus:outline-none focus:bg-primary-fixed/10 transition-colors rounded-xl font-bold"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-3 text-primary">search</span>
                </div>
              </div>

              {/* Espèce */}
              <div className="mb-6">
                <label className="block font-bold text-xs uppercase tracking-widest mb-3 text-on-surface-variant">Espèce</label>
                <div className="flex flex-wrap gap-2">
                  {ESPECES.map(e => (
                    <button key={e} onClick={() => setEspece(e)}
                      className={`px-4 py-2 rounded-xl text-xs font-black border-2 border-black transition-all uppercase
                        ${espece === e ? 'bg-primary text-white shadow-none translate-x-2px translate-y-2px' : 'bg-white hover:bg-secondary-container shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Race (Dynamic) */}
              <div className="mb-6">
                <label className="block font-bold text-xs uppercase tracking-widest mb-3 text-on-surface-variant">Race</label>
                <select 
                  value={race} 
                  onChange={(e) => setRace(e.target.value)}
                  className="w-full border-2 border-black p-3 text-sm font-bold rounded-xl focus:outline-none bg-white appearance-none cursor-pointer"
                >
                  {availableRaces.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Traits (VRAIS FILTRES) */}
              <div className="mb-6">
                <label className="block font-bold text-xs uppercase tracking-widest mb-3 text-on-surface-variant">Adapté pour :</label>
                <div className="space-y-3">
                  {TRAITS.map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => toggleTrait(t.id)}
                      className={`w-full flex items-center gap-3 p-3 border-[2px] border-black transition-all rounded-lg font-['Plus_Jakarta_Sans']
                        ${selectedTraits.includes(t.id) 
                          ? 'bg-secondary text-white shadow-none translate-x-[2px] translate-y-[2px]' 
                          : 'bg-white text-primary hover:bg-primary/5 shadow-[3px_3px_0px_0px_rgba(21,66,18,1)]'}`}
                    >
                      <span className="material-symbols-outlined text-lg">{t.icon}</span>
                      <span className="text-sm font-bold">{t.label}</span>
                      {selectedTraits.includes(t.id) && <span className="material-symbols-outlined ml-auto text-sm">check</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">

                <label className="block font-bold text-xs uppercase tracking-widest mb-3 text-on-surface-variant">
                  Caractères
                </label>

                {/* Trigger */}
                <button
                  onClick={() => setShowCaracteres(prev => !prev)}
                  className="
                    w-full flex items-center justify-between
                    p-3 bg-white border-2 border-black rounded-xl
                    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                    hover:bg-secondary-container
                    transition-all
                    font-bold
                  "
                >
                  <span>
                    {caractere.length > 0
                      ? `${caractere.length} sélectionné(s)`
                      : 'Choisir des caractères'}
                  </span>

                  <span
                    className={`material-symbols-outlined transition-transform ${
                      showCaracteres ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {/* Dropdown */}
                {showCaracteres && (
                  <div
                    className="
                      mt-3 bg-white border-2 border-black rounded-xl
                      p-2 max-h-64 overflow-y-auto
                      shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                    "
                  >
                    {caracteres.map(c => (
                      <button
                        key={c.Id}
                        onClick={() => toggleCaractere(c.Id)}
                        className={`
                          w-full flex items-center gap-3
                          p-3 rounded-lg text-left transition-all

                          ${
                            caractere.includes(c.Id)
                              ? 'bg-secondary text-white'
                              : 'hover:bg-primary/5'
                          }
                        `}
                      >
                        <div
                          className={`
                            w-5 h-5 border-2 border-current rounded
                            flex items-center justify-center
                          `}
                        >
                          {caractere.includes(c.Id) && (
                            <span className="material-symbols-outlined text-sm">
                              check
                            </span>
                          )}
                        </div>

                        <span className="font-bold">
                          {c.Nom}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Badges sélectionnés */}
                {caractere.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">

                    {caracteres
                      .filter(c => caractere.includes(c.Id))
                      .map(c => (
                        <span
                          key={c.Id}
                          className="
                            flex items-center gap-1
                            px-3 py-1
                            bg-secondary
                            text-white
                            border-2 border-black
                            rounded-full
                            text-xs
                            font-black
                            shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                          "
                        >
                          {c.Nom}

                          <button
                            onClick={() => toggleCaractere(c.Id)}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Taille */}
              <div className="mb-6">
                <label className="block font-bold text-xs uppercase tracking-widest mb-3 text-on-surface-variant">Gabarit</label>
                <div className="grid grid-cols-1 gap-2">
                  {TAILLES.map(t => (
                    <label key={t} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-surface-container transition-colors">
                      <div className="relative flex items-center">
                        <input type="checkbox" checked={taille.includes(t)} onChange={() => toggleTaille(t)}
                          className="peer appearance-none w-6 h-6 border-2 border-black rounded-md checked:bg-primary transition-all cursor-pointer" />
                        <span className="material-symbols-outlined absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none w-full text-center text-sm">check</span>
                      </div>
                      <span className="text-sm font-bold group-hover:text-primary transition-colors">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </FadeIn>
          </aside>

          {/* Grid Content */}
          <div className="lg:col-span-9">
            {filteredAnimaux.length === 0 ? (
              <FadeIn className="bg-white border-4 border-black rounded-3xl p-16 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]">
                <span className="material-symbols-outlined text-8xl text-secondary mb-6 block animate-pulse">search_off</span>
                <p className="font-['Chewy'] text-4xl text-primary mb-4">Oups ! Aucun compagnon trouvé</p>
                <p className="text-on-surface-variant text-lg mb-10 max-w-md mx-auto">Nous n'avons pas encore d'animal correspondant à tous ces critères. Essayez d'élargir votre recherche.</p>
                <button onClick={reset} className="px-10 py-5 bg-primary text-white font-black text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-2xl uppercase tracking-widest">
                  Réinitialiser
                </button>
              </FadeIn>
            ) : (
              <>
                <FadeIn className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
                  <div className="bg-secondary-container text-on-secondary-container px-6 py-3 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                      <span className="text-2xl">{filteredAnimaux.length}</span> Résultat{filteredAnimaux.length > 1 ? 's' : ''} disponible{filteredAnimaux.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="text-on-surface-variant text-sm font-bold bg-surface-container px-4 py-2 rounded-full border border-black/10">
                    Utilisez les filtres à gauche pour affiner votre recherche
                  </p>
                </FadeIn>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                  {paginatedProducts.map((animal, i) => (
                    <AnimalCard key={animal.Id} animal={animal} delay={i * 0.05} />
                  ))}
                </div>

                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default RefugesNAnimals
