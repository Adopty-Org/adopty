import React, { useState } from 'react'
import { FadeIn, PageTransition } from '../../components/Animations'
import ServiceCard from '../../components/ui/ServiceCard'
import Modal from '../../components/ui/Modal'
import ReservationForm from '../../components/forms/ReservationForm'
import { usePrestataires } from '../../hooks/usePrestataire'
import { useTypeServices } from '../../hooks/useType_service'
import Pagination from '../../components/ui/Pagination'
import { useEffect } from 'react'
import { useMemo } from 'react'

const ITEMS_PER_PAGE = 6

const SORTS = [
  { value: 'note-desc', label: 'Meilleures notes',  icon: 'star' },
  { value: 'prix-asc',  label: 'Prix croissant',    icon: 'arrow_upward' },
  { value: 'prix-desc', label: 'Prix décroissant',  icon: 'arrow_downward' },
  { value: 'nom-asc',   label: 'Nom A → Z',         icon: 'sort_by_alpha' },
]

const StarFilter = ({ minNote, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} onClick={() => onChange(minNote === n ? 0 : n)} title={`${n} étoile${n > 1 ? 's' : ''} min.`}>
        <span className={`material-symbols-outlined text-2xl transition-colors ${n <= minNote ? 'text-amber-400' : 'text-outline-variant hover:text-amber-300'}`}>
          star
        </span>
      </button>
    ))}
    {minNote > 0 && (
      <button onClick={() => onChange(0)} className="ml-1 text-xs text-secondary font-bold hover:underline self-center">Reset</button>
    )}
  </div>
)

function ServicesPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedPrestataire, setSelectedPrestataire] = useState(null)

  const { prestataires } = usePrestataires()
  const { typeServicesWithAll, typesLoading } = useTypeServices();
  const [currentPage, setCurrentPage] = useState(1)

  const [search,              setSearch]              = useState('')
  const [minNote,             setMinNote]             = useState(0)
  const [prixMax,             setPrixMax]             = useState('')
  const [sortBy,              setSortBy]              = useState('note-desc')

  useEffect(() => { setSearch(''); setMinNote(0); setPrixMax('') }, [activeTab])

  const filtered = useMemo(() => {
    let r = prestataires.filter(p => p?.typeService?.Id === activeTab || activeTab === 'all')
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(p =>
        p?.utilisateur?.Nom?.toLowerCase().includes(q) ||
        p?.ZoneIntervention?.toLowerCase().includes(q) ||
        p?.Bio?.toLowerCase().includes(q)
      )
    }
    if (minNote > 0) r = r.filter(p => Number(p.NoteMoyenne || 0) >= minNote)
    if (prixMax !== '') r = r.filter(p => Number(p.TarifHoraire || 0) <= Number(prixMax))
    r.sort((a, b) => {
      if (sortBy === 'note-desc') return Number(b.NoteMoyenne || 0) - Number(a.NoteMoyenne || 0)
      if (sortBy === 'prix-asc')  return Number(a.TarifHoraire || 0) - Number(b.TarifHoraire || 0)
      if (sortBy === 'prix-desc') return Number(b.TarifHoraire || 0) - Number(a.TarifHoraire || 0)
      return (a?.utilisateur?.Nom || '').localeCompare(b?.utilisateur?.Nom || '')
    })
    return r
  }, [prestataires, activeTab, search, minNote, prixMax, sortBy])

  // Mapping des icônes par service
  const getIconForTab = (tabNom) => {
    const iconMap = {
      'Baby-sitting': 'home',
      'Promenade': 'directions_walk',
      'Tous': 'apps'
    }
    return iconMap[tabNom] || 'star'
  }

  console.log("Prestataires : ", prestataires);
  //const filtered = prestataires.filter(p => p?.typeService?.Id === activeTab || activeTab === 'all')
  //const handleReserve = (p) => requireAuthAction(() => setSelectedPrestataire(p))
  const activeFilterCount = [search.trim(), minNote > 0, prixMax !== ''].filter(Boolean).length
  const resetFilters = () => { setSearch(''); setMinNote(0); setPrixMax('') }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <PageTransition>
      {/* Hero */}
      <section className="bg-primary py-16 px-6 border-b-4 border-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-6 right-12 text-9xl font-['Chewy'] text-white rotate-12">🐾</div>
          <div className="absolute bottom-4 left-8 text-7xl font-['Chewy'] text-white -rotate-6">🐕</div>
        </div>
        <div className="max-w-7xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-6">
              <span className="material-symbols-outlined text-sm">pets</span>
              <span className="font-bold text-sm uppercase tracking-widest">Nos Services</span>
            </div>
            <h1 className="font-['Chewy'] text-5xl md:text-7xl text-white mb-4 leading-tight">
              Des services de<br />
              <span className="text-[#fe9e72]">confiance</span>
            </h1>
            <p className="text-white/80 max-w-xl text-lg font-body">
              Des prestataires certifiés et passionnés prennent soin de votre compagnon quand vous en avez besoin.
            </p>
          </FadeIn>

          {/* Stats rapides */}
          <FadeIn delay={0.2} className="flex flex-wrap gap-6 mt-10">
            {[
              { icon: 'verified_user', label: 'Prestataires certifiés', value: prestataires.length.toString() }, // temporairement le nombre de prestataires comme nombre de certifiés  
              { icon: 'star', label: 'Note moyenne', value: prestataires.length > 0 ? prestataires.reduce((acc, p) => acc + Number(p.NoteMoyenne || 0), 0) / prestataires.length : 'N/A' },
              { icon: 'event_available', label: 'Réservations réussies', value: '1,240+' },
              { icon: 'event_available', label: 'Services disponibles', value: typeServicesWithAll.length.toString() },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-3 bg-white/10 border-2 border-white/30 px-5 py-3 rounded-xl">
                <span className="material-symbols-outlined text-[#fe9e72] text-2xl">{stat.icon}</span>
                <div>
                  <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-white text-xl">{stat.value}</p>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <FadeIn className="flex gap-3 mb-10 flex-wrap">
          {typesLoading ? (
            // Skeleton loading
            [1, 2, 3].map(i => (
              <div key={i} className="h-14 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
            ))
          ) : (
            typeServicesWithAll?.map(tab => (
              <button
                key={tab?.Id}
                onClick={() => setActiveTab(tab?.Id)}
                className={`flex items-center gap-2 px-7 py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-lg border-4 border-black transition-all whitespace-nowrap
                  ${activeTab === tab?.Id
                    ? 'bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-surface-container-lowest text-primary hover:bg-surface-container hover:translate-x-2px hover:translate-y-2px shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none'
                  }`}
              >
                <span className="material-symbols-outlined">
                  {getIconForTab(tab?.Type)}
                </span>
                {tab?.Type}
              </button>
            ))
          )}
        </FadeIn>

        {/* Barre de filtres */}
        <FadeIn className="bg-surface-container-lowest border-2 border-black rounded-2xl p-4 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-wrap gap-4 items-end">

            {/* Recherche */}
            <div className="flex-1 min-w-[180px]">
              <label className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-1.5 block">Rechercher</label>
              <div className="relative">
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Nom, ville..."
                  className="w-full border-2 border-black px-4 py-2.5 pr-9 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary rounded-xl bg-white"
                />
                {search ? (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5">
                    <span className="material-symbols-outlined text-primary text-lg">close</span>
                  </button>
                ) : (
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-primary/50 text-lg">search</span>
                )}
              </div>
            </div>

            {/* Note min */}
            <div>
              <label className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-1.5 block">Note min.</label>
              <StarFilter minNote={minNote} onChange={setMinNote} />
            </div>

            {/* Prix max */}
            <div className="min-w-[130px]">
              <label className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-1.5 block">Prix max (DZD/h)</label>
              <input
                type="number" min="0" placeholder="Ex: 5000" value={prixMax} onChange={e => setPrixMax(e.target.value)}
                className="w-full border-2 border-black px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary rounded-xl bg-white"
              />
            </div>

            {/* Tri */}
            <div>
              <label className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-1.5 block">Trier par</label>
              <div className="flex flex-wrap gap-1.5">
                {SORTS.map(s => (
                  <button key={s.value} onClick={() => setSortBy(s.value)}
                    className={`flex items-center gap-1 px-3 py-2 text-xs font-bold border-2 border-black rounded-xl transition-all
                      ${sortBy === s.value ? 'bg-secondary text-white shadow-none translate-x-[1px] translate-y-[1px]' : 'bg-white text-on-surface hover:bg-secondary/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}>
                    <span className="material-symbols-outlined text-[15px]">{s.icon}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            {activeFilterCount > 0 && (
              <button onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 border-2 border-black rounded-xl text-xs font-bold bg-white hover:bg-error-container transition-colors">
                <span className="material-symbols-outlined text-[15px]">filter_list_off</span>
                Reset ({activeFilterCount})
              </button>
            )}
          </div>
        </FadeIn>

        {/* Grid prestataires */}
        {paginatedProducts.length === 0 ? (
          <FadeIn className="text-center py-24 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">search_off</span>
            <p className="font-bold text-xl">Aucun prestataire disponible pour ce service.</p>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedProducts.map((p, i) => (
              <ServiceCard key={p.Id} prestataire={p} delay={i * 0.1} onReserver={setSelectedPrestataire} />
            ))}
          </div>
        )}

        <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />

        {/* Devenir prestataire */}
        <FadeIn delay={0.3} className="mt-20 bg-[#ffdbcd] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-5xl mb-4 block">🐾</span>
              <h2 className="font-['Chewy'] text-4xl text-primary mb-4">Devenez Prestataire Adopty !</h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                Vous aimez les animaux et souhaitez partager votre passion tout en générant des revenus ? Rejoignez notre réseau de prestataires certifiés et bienveillants.
              </p>
              <ul className="space-y-2 mb-6">
                {['Horaires flexibles', 'Rémunération attractive', 'Formation offerte', 'Assurance incluse'].map(item => (
                  <li key={item} className="flex items-center gap-2 font-bold text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Votre prénom" className="bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" />
                <input type="text" placeholder="Votre nom" className="bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" />
              </div>
              <input type="email" placeholder="Votre email" className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" />
              <select className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
                <option>Service proposé</option>
                <option>Baby-sitting</option>
                <option>Promenade</option>
                <option>Les deux</option>
              </select>
              <button className="w-full py-4 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all">
                Rejoindre le réseau →
              </button>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Modal réservation */}
      <Modal
        isOpen={!!selectedPrestataire}
        onClose={() => setSelectedPrestataire(null)}
        title={`Réserver — ${selectedPrestataire?.nom || ''}`}
        size="md"
      >
        <ReservationForm prestataire={selectedPrestataire} onClose={() => setSelectedPrestataire(null)} />
      </Modal>
    </PageTransition>
  )
}

export default ServicesPage