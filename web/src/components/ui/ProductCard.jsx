import { FadeIn } from '../Animations'
import { useCart } from '../../context/CartContext'
import Badge from './Badge'

const ProductCard = ({ produit, delay = 0 }) => {
  const { addToCart } = useCart()

  return (
    <FadeIn delay={delay} className="group bg-surface-container-lowest border-[3px] border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(21,66,18,1)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(21,66,18,1)] transition-all duration-200 flex flex-col">
      <div className="relative h-56 overflow-hidden border-b-[3px] border-black">
        <img
          alt={produit.nom}
          src={produit.photo}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {produit.reduction && (
          <Badge variant="promo" className="absolute top-3 right-3">{produit.reduction}</Badge>
        )}
        {produit.badge && (
          <Badge variant="eco" className="absolute top-3 left-3">{produit.badge}</Badge>
        )}
      </div>
      <div className="p-5 flex flex-col grow">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">{produit.categorie}</span>
        <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl mb-2 text-primary">{produit.nom}</h3>
        <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 grow">{produit.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-primary">{produit.prix.toFixed(2)}€</span>
            {produit.prixOriginal && (
              <span className="text-sm text-on-surface-variant line-through ml-2">{produit.prixOriginal.toFixed(2)}€</span>
            )}
          </div>
          <button
            onClick={() => addToCart(produit)}
            className="bg-primary text-white p-2.5 border-2 border-black rounded-full hover:bg-secondary transition-colors active:scale-90 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            title="Ajouter au panier"
          >
            <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </FadeIn>
  )
}

export default ProductCard
