import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageTransition, FadeIn } from '../../components/Animations'
//import { getProduitById, getProduitPhotos, getProduitMateriaux, getRefugeById } from '../services/publicApi'
///import { mapProduit } from '../mappers/produitMapper'
//import { mapRefuge } from '../mappers/refugeMapper'
import { useCart } from '../../context/CartContext'
//import { useRequireAuthAction } from '../hooks/useRequireAuthAction'
import Badge from '../../components/ui/Badge'
import { useProduit } from '../../hooks/useProduit'
import { useRefuge } from '../../hooks/useRefuge'

const ProductDetail = () => {
  const { id } = useParams()
  const [produitData, setProduitData] = useState(null)
  const [photos, setPhotos] = useState([])
  const [materiaux, setMateriaux] = useState([])
  const [refugeData, setRefugeData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { addToCart } = useCart()
  //const { requireAuthAction } = useRequireAuthAction()

  const [hasLoaded, setHasLoaded] = useState(false) // ✅ Flag pour éviter les rechargements

  const {produit:Produit, ProduitsLoading} = useProduit(id)
  console.log("produit : ", Produit)
  const {refuge} = useRefuge(Produit?.IdRefuge)
  console.log("refuge : ", refuge)

  useEffect(() => { 
    const loadDetail = async () => {
        if(ProduitsLoading) return ;
      setIsLoading(true)
      try {
        //const prod = await getProduitById(id)
        //const mapped = mapProduit(prod)
        //setProduitData(mapped)
        
        setProduitData(Produit)

        // Charger les photos
        try {
          //const photoData = await getProduitPhotos(id)
          //setPhotos(Array.isArray(photoData) ? photoData : [])
          if (Produit?.photos?.length) {
            setPhotos(Produit?.photos)
          }
        } catch (e) {
          console.error("Erreur photos:", e)
          setPhotos([])
        }

        // Charger les matériaux
        try {
          //const matData = await getProduitMateriaux(id)
          //setMateriaux(Array.isArray(matData) ? matData : [])
          setMateriaux(Produit?.materiaux)
        } catch (e) {
          console.error("Erreur matériaux:", e)
          setMateriaux([])
        }

        // Charger le refuge
        if (/*mapped.idRefuge*/Produit?.IdRefuge) {
          try {
            //const refuge = await getRefugeById(mapped.idRefuge)
            //setRefugeData(mapRefuge(refuge))
            setRefugeData(refuge)
            setHasLoaded(true)
          } catch (e) {
            console.error("Erreur refuge:", e)
          }
        }
      } catch (error) {
        console.error("Erreur chargement produit:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if(!hasLoaded){
        loadDetail()
    }
    
  }, [id, ProduitsLoading, Produit, refuge])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!produitData) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-primary">Produit introuvable</h2>
        <Link to="/shop" className="mt-4 inline-block text-secondary underline font-bold">Retour à la boutique</Link>
      </div>
    )
  }

  const produit = produitData
  const handleAddToCart = () => /*requireAuthAction(() =>*/ addToCart(produit)/*)*/

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link to="/boutique" className="inline-flex items-center gap-2 mb-8 text-primary font-bold group">
          <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
          <span className="font-['Plus_Jakarta_Sans'] uppercase tracking-wider text-sm">Retour à la boutique</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16 items-start">
          {/* Gallery */}
          <FadeIn className="lg:col-span-6 space-y-4">
            <div className="relative overflow-hidden rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(21,66,18,1)] aspect-square bg-white">
              <img 
                alt={produit.nom} 
                className="w-full h-full object-contain p-4" 
                src={photos.length > 0 ? photos[0].Url : produit?.photo} 
              />
            </div>
            
            {photos.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {photos.slice(1, 5).map((photo, i) => (
                  <div key={i} className="aspect-square rounded-xl border-2 border-black overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <img alt={`${produit?.Nom} ${i}`} src={photo?.Url} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </FadeIn>

          {/* Product Info */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <FadeIn delay={0.1} className="bg-surface-container-lowest p-8 rounded-2xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 block">{produit.categorie}</span>
              <h1 className="text-4xl md:text-5xl font-['Plus_Jakarta_Sans'] font-extrabold text-primary mb-4 leading-tight">{produit.nom}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-['Plus_Jakarta_Sans'] font-extrabold text-primary">
                  {produit?.Prix.toFixed(2)}€
                </span>
              </div>

              <div className="p-4 bg-surface-container rounded-xl border-2 border-black/10 mb-8">
                <p className="text-on-surface-variant leading-relaxed">
                  {produit?.description}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary-fixed-dim rounded-xl border-2 border-black">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">inventory_2</span>
                    <span className="font-bold">Stock disponible</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-bold text-sm ${produit?.Stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {produit?.Stock > 0 ? `${produit?.Stock} unités` : 'Rupture de stock'}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={produit?.Stock === 0}
                  className="w-full bg-primary text-white py-5 px-8 border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-4 group font-['Plus_Jakarta_Sans'] font-extrabold text-xl uppercase active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter au panier
                  <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">add_shopping_cart</span>
                </button>
              </div>
            </FadeIn>

            {/* Eco/Materials Badge */}
            <FadeIn delay={0.2} className="flex flex-wrap gap-3">
              {materiaux.map(m => (
                <span key={m?.Id} className="bg-secondary-fixed text-on-secondary-container px-5 py-2.5 rounded-full border-2 border-black flex items-center gap-2 font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="material-symbols-outlined text-lg">eco</span> {m?.Nom}
                </span>
              ))}
              {produit?.badge && (
                <span className="bg-tertiary-fixed text-on-tertiary-container px-5 py-2.5 rounded-full border-2 border-black flex items-center gap-2 font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
                  <span className="material-symbols-outlined text-lg">star</span> {produit?.badge}
                </span>
              )}
            </FadeIn>
          </div>
        </div>

        {/* Refuge Info Section */}
        <FadeIn delay={0.3} className="mt-12">
          <h2 className="text-3xl font-['Plus_Jakarta_Sans'] font-extrabold text-primary mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl">storefront</span> Vendu par le refuge
          </h2>
          
          <div className="bg-white rounded-3xl border-4 border-black overflow-hidden shadow-[12px_12px_0px_0px_rgba(21,66,18,1)] flex flex-col md:flex-row">
            <div className="md:w-1/3 bg-secondary p-8 flex flex-col justify-center text-white">
              <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mb-2">Partenaire Adopty</p>
              <h3 className="text-3xl font-extrabold mb-4">{refugeData?.nom || "Refuge Partenaire"}</h3>
              <p className="text-sm opacity-90 leading-relaxed mb-6">
                En achetant ce produit, vous soutenez directement les actions de ce refuge. 100% des bénéfices sont reversés aux soins des animaux.
              </p>
              <Link 
                to={refugeData ? `/refugeProfile/${refugeData?.Id}` : "/realrefuge"} 
                className="inline-flex items-center gap-2 font-bold hover:underline"
              >{console.log("refugeData : ", refugeData)}
                Voir le profil du refuge <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            
            <div className="md:w-2/3 p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center border-2 border-black">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase">Localisation</p>
                    <p className="font-bold">{refugeData?.ville || "Ville non renseignée"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center border-2 border-black">
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase">Livraison</p>
                    <p className="font-bold">Point relais ou à domicile</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-black/20 rounded-2xl p-6 bg-surface-container-lowest">
                <span className="material-symbols-outlined text-5xl text-secondary mb-2">volunteer_activism</span>
                <p className="text-center font-bold text-sm">Geste Solidaire</p>
                <p className="text-center text-xs text-on-surface-variant mt-1">Merci pour votre soutien !</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  )
}

export default ProductDetail