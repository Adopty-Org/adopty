import React, { useState } from 'react'
import { FadeIn, PageTransition } from '../../components/Animations.jsx'
import ProductCard from '../../components/ui/ProductCard.jsx'
import { useQuery } from '@tanstack/react-query'
import { produitApi } from '../../lib/api.js'

const CATEGORIES = ['Tous', 'Alimentation Bio', 'Jouets Écolo', 'Accessoires', 'Hygiène']

function ShopPage() {
  const [categorie, setCategorie] = useState('Tous')
  const [tri, setTri] = useState('nouveautes')

  const { data:ProduitsData, IsLoading:ProduitsLoading} = useQuery({
    queryKey:['produits'],
    queryFn: produitApi.getAll
  })

  console.log("ProduitsData :", ProduitsData)

  const produits = ProduitsData ?? []

  console.log("Les produits :   ", produits)

  const filtered = produits
    .filter(p => categorie === 'Tous')// || p.categorie === categorie)
    .sort((a, b) => {
      if (tri === 'prix-asc') return a.Prix - b.Prix
      if (tri === 'prix-desc') return b.Prix - a.Prix
      return 0
    })

  /*const filtered = produits
    .filter(p => categorie === 'Tous' || p.categorie === categorie)
    .sort((a, b) => {
      if (tri === 'prix-asc') return a.prix - b.prix
      if (tri === 'prix-desc') return b.prix - a.prix
      return 0
    })*/


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
              <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary text-lg mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined">filter_list</span> Filtres
              </h3>
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
                <div>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-xs uppercase tracking-wider text-secondary mb-2 block">Matériaux</span>
                  {['Corde de Chanvre', 'Caoutchouc Naturel', 'Coton Organique'].map(m => (
                    <label key={m} className="flex items-center gap-3 cursor-pointer py-1.5 group">
                      <input type="checkbox" className="w-4 h-4 border-2 border-black rounded text-primary" />
                      <span className="text-sm font-label group-hover:text-primary transition-colors">{m}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-xs uppercase tracking-wider text-secondary mb-2 block">Prix</span>
                  <input type="range" className="w-full accent-primary" />
                  <div className="flex justify-between text-xs font-bold mt-1 text-on-surface-variant"><span>0€</span><span>100€+</span></div>
                </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {filtered.map((p, i) => (
                  <ProductCard key={p.Id} produit={p} delay={i * 0.07} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  )
}

export default ShopPage