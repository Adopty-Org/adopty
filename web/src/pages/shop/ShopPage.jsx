import React, { useMemo, useState } from 'react'
import { FadeIn, PageTransition } from '../../components/Animations.jsx'
import ProductCard from '../../components/ui/ProductCard.jsx'
import { useQuery } from '@tanstack/react-query'
import { produitApi, utilisateurApi } from '../../lib/api.js'
import { useProduits } from '../../hooks/useProduit.js'
import Pagination from '../../components/ui/Pagination'
import { useUtilisateur } from '../../hooks/useUtilisateur.js'
import { useMateriaux } from '../../hooks/useMateriel.js'

const CATEGORIES = ['Tous', 'Alimentation Bio', 'Jouets Écolo', 'Accessoires', 'Hygiène']
const ITEMS_PER_PAGE = 6

function ShopPage() {
  const [categorie, setCategorie] = useState('Tous')
  const [tri, setTri] = useState('nouveautes')
  const { produits, isLoading: ProduitsLoading } = useProduits()
  const [currentPage, setCurrentPage] = useState(1)
  const [showMateriaux, setShowMateriaux] = useState(false)

  const { materiaux, materiauxMap } = useMateriaux()

  const [selectedMateriaux, setSelectedMateriaux] = useState([])
  const [search,      setSearch]      = useState('')
  const [prixMin, setPrixMin] = useState('')
  const [prixMax, setPrixMax] = useState('')
  const [stockOnly, setStockOnly] = useState(false)

  //const {utilisateur} = useUtilisateur("user_3Cl8Cijc2dCXvaEPWX4ZGa7s8f0")

  //console.log("l'utilisateur", utilisateur)


  const maxPrixData = useMemo(
    () => Math.ceil(Math.max(0, ...produits.map(p => Number(p.Prix) || 0))),
    [produits]
  )

  // 🛡️ GARDE-FOU N°1 : Valeur par défaut
  const produitsArray = produits ?? []  // 👈 Si undefined/null, devient []

  const filtered = useMemo(() => {
    return produitsArray
      .filter(p => categorie === 'Tous' || p.Categorie === categorie)

      .filter(p => {
        if (!search.trim()) return true

        const q = search.toLowerCase()

        return (
          p.Nom?.toLowerCase().includes(q) ||
          p.Categorie?.toLowerCase().includes(q)
        )
      })

      .filter(p => {
        if (selectedMateriaux.length === 0) return true

        return selectedMateriaux.every(id =>
          p.Materiaux?.some(m => m.Id === id)
        )
      })

      .filter(p => {
        const prix = Number(p.Prix)

        if (prixMin !== '' && prix < Number(prixMin)) return false
        if (prixMax !== '' && prix > Number(prixMax)) return false

        return true
      })

      .filter(p => {
        if (!stockOnly) return true
        return Number(p.Stock) > 0
      })

      .sort((a, b) => {
        if (tri === 'prix-asc') return Number(a.Prix) - Number(b.Prix)
        if (tri === 'prix-desc') return Number(b.Prix) - Number(a.Prix)

        return (a.Nom || '').localeCompare(b.Nom || '')
      })
  }, [
    produitsArray,
    categorie,
    search,
    selectedMateriaux,
    prixMin,
    prixMax,
    stockOnly,
    tri
  ])

  //console.log("Les produits :   ", produitsArray)

  // 🛡️ GARDE-FOU N°2 : Affichage conditionnel
  if (ProduitsLoading) {
    return <div className="flex justify-center p-12">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  }

  // 🛡️ GARDE-FOU N°3 : Sécurité absolue
  /*if (!produitsArray.length) {
    return <div className="text-center p-12 text-gray-500">Aucun produit disponible</div>
  }*/

  

  const activeFilterCount =
  (categorie !== 'Tous' ? 1 : 0) +
  (search.trim() ? 1 : 0) +
  (prixMin !== '' ? 1 : 0) +
  (prixMax !== '' ? 1 : 0) +
  (stockOnly ? 1 : 0) +
  selectedMateriaux.length
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  const reset = () => {
    setCategorie('Tous')
    setSearch('')
    setTri('nouveautes')
    setPrixMin('')
    setPrixMax('')
    setStockOnly(false)
    setSelectedMateriaux([])
    setShowMateriaux(false)
    setCurrentPage(1)
  }

  const toggleMateriau = (id) => {
    setSelectedMateriaux(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  return (
    <PageTransition>
      {/* Promo Banner */}
      <section className="w-full bg-secondary py-4 px-6 border-b-4 border-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-white text-xl md:text-2xl tracking-tight uppercase">Éveil Éco-Responsable : -20% sur les jouets en corde !</h2>
          </div>
          <button className="bg-[#bcf0ae] text-on-[#bcf0ae] border-[3px] border-black px-6 py-2 font-['Plus_Jakarta_Sans'] font-bold uppercase shadow-[4px_4px_0px_0px_rgba(35,80,30,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all active:scale-95 shrink-0">
            J'en profite
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
          {/* Sidebar */}
          <aside className="space-y-6">
            <FadeIn className="p-6 bg-surface-container-low border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between">
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary text-lg mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined">filter_list</span> Filtres
                  {activeFilterCount > 0 && (
                      <span className="w-5 h-5 bg-secondary text-white text-[11px] font-extrabold rounded-full flex items-center justify-center border border-black">
                        {activeFilterCount}
                      </span>
                    )}
                  </h3>
                  {activeFilterCount > 0 && (
                    <button onClick={reset} className="text-xs font-bold text-secondary hover:underline uppercase tracking-wider">Reset</button>
                  )}
                </div>
                {/* Recherche */}
                <div>
                  <span className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">Rechercher</span>
                  <div className="relative">
                    <input
                      value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom du produit..."
                      className="w-full border-2 border-black px-4 py-2.5 pr-9 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                    />
                    {search ? (
                      <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5">
                        <span className="material-symbols-outlined text-primary text-lg">close</span>
                      </button>
                    ) : (
                      <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-primary text-lg">search</span>
                    )}
                  </div>
                </div>
              <div className="space-y-5">
                <div>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-xs uppercase tracking-wider text-secondary mb-2 block">Catégories</span>
                  <div className="flex flex-col gap-1.5">
                    {CATEGORIES.map(c => (
                      <button key={c} onClick={() => setCategorie(c)}
                        className={`w-full text-left px-3 py-2 text-sm font-bold border-2 border-transparent rounded-lg transition-all
                          ${categorie === c ? 'bg-primary text-white border-black' : 'hover:bg-surface-container hover:border-black/20'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">

                  <label className="block font-bold text-xs uppercase tracking-widest mb-3 text-on-surface-variant">
                    Materiaux
                  </label>

                  {/* Trigger */}
                  <button
                    onClick={() => setShowMateriaux(prev => !prev)}
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
                      {selectedMateriaux.length > 0
                        ? `${selectedMateriaux.length} sélectionné(s)`
                        : 'Choisir des matériaux'}
                    </span>

                    <span
                      className={`material-symbols-outlined transition-transform ${
                        showMateriaux ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* Dropdown */}
                  {showMateriaux && (
                    <div
                      className="
                        mt-3 bg-white border-2 border-black rounded-xl
                        p-2 max-h-64 overflow-y-auto
                        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                      "
                    >
                      {materiaux.map(m => (
                        <button
                          key={m.Id}
                          onClick={() => toggleMateriau(m.Id)}
                          className={`
                            w-full flex items-center gap-3
                            p-3 rounded-lg text-left transition-all

                            ${
                              selectedMateriaux.includes(m.Id)
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
                            {selectedMateriaux.includes(m.Id) && (
                              <span className="material-symbols-outlined text-sm">
                                check
                              </span>
                            )}
                          </div>

                          <span className="font-bold">
                            {m.Nom}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Badges sélectionnés */}
                  {selectedMateriaux.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">

                      {materiaux
                        .filter(m => selectedMateriaux.includes(m.Id))
                        .map(m => (
                          <span
                            key={m.Id}
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
                            {m.Nom}

                            <button
                              onClick={() => toggleMateriau(m.Id)}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                </div>
                {/*<div>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-xs uppercase tracking-wider text-secondary mb-2 block">Matériaux</span>
                  {['Corde de Chanvre', 'Caoutchouc Naturel', 'Coton Organique'].map(m => (
                    <label key={m} className="flex items-center gap-3 cursor-pointer py-1.5 group">
                      <input type="checkbox" className="w-4 h-4 border-2 border-black rounded text-primary" />
                      <span className="text-sm font-label group-hover:text-primary transition-colors">{m}</span>
                    </label>
                  ))}
                </div>*/}
                {/* Prix */}
                <div>
                  <span className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
                    Prix (DZD){maxPrixData > 0 && <span className="font-normal normal-case ml-1">jusqu'à {maxPrixData.toLocaleString('fr-DZ')}</span>}
                  </span>
                  <div className="flex gap-2 items-center">
                    <input type="number" min="0" placeholder="Min" value={prixMin} onChange={e => setPrixMin(e.target.value)}
                      className="w-full border-2 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" />
                    <span className="text-on-surface-variant font-bold">—</span>
                    <input type="number" min="0" placeholder="Max" value={prixMax} onChange={e => setPrixMax(e.target.value)}
                      className="w-full border-2 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" />
                  </div>
                </div>

                {/* Stock */}
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 border-black hover:bg-surface-container transition-colors select-none">
                  <div className="relative flex-shrink-0">
                    <input type="checkbox" checked={stockOnly} onChange={e => setStockOnly(e.target.checked)}
                      className="peer appearance-none w-6 h-6 border-2 border-black rounded-md checked:bg-primary transition-all cursor-pointer" />
                    <span className="material-symbols-outlined absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none inset-0 flex items-center justify-center text-sm">check</span>
                  </div>
                  <span className="text-sm font-bold">En stock uniquement</span>
                </label>
              </div>
            </FadeIn>

            <FadeIn delay={0.1} className="bg-[#ffdad3] text-[#3e0500] p-5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="material-symbols-outlined text-tertiary mb-2 block">lightbulb</span>
              <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-base mb-2">Le saviez-vous ?</h4>
              <p className="text-sm opacity-90 leading-relaxed">Les jouets en corde naturelle aident à nettoyer les dents de votre compagnon tout en respectant l'environnement.</p>
            </FadeIn>
          </aside>

          {/* Products grid */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <FadeIn>
                <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl text-primary">Boutique Naturelle</h1>
                {<p className="text-on-surface-variant text-sm mt-1">{filtered.length} produit{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</p>}
              </FadeIn>
              <FadeIn>
                <select value={tri} onChange={e => setTri(e.target.value)}
                  className="bg-surface border-2 border-black font-bold py-2 px-4 rounded-lg text-sm focus:ring-primary focus:outline-none">
                  <option value="nouveautes">Trier par : Nouveautés</option>
                  <option value="prix-asc">Prix croissant</option>
                  <option value="prix-desc">Prix décroissant</option>
                </select>
              </FadeIn>
            </div>

            {filtered.length === 0 ? (
              <FadeIn className="text-center py-20 text-on-surface-variant">
                <span className="material-symbols-outlined text-6xl mb-3 block opacity-30">shopping_bag</span>
                <p className="font-bold text-lg">Aucun produit dans cette catégorie.</p>
              </FadeIn>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                  {paginatedProducts.map((p, i) => (
                      <ProductCard key={p?.Id} produit={p} delay={i * 0.07} />
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
          </section>
        </div>
      </div>
    </PageTransition>
  )
}

export default ShopPage