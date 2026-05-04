// CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { produitApi } from '../lib/api'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [cartItemsWithPhotos, setCartItemsWithPhotos] = useState([])
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false)

  const addToCart = (produit) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.Id === produit.Id)
      if (existing) {
        return prev.map(item =>
          item.Id === produit.Id ? { ...item, Quantite: item.Quantite + 1 } : item
        )
      }
      return [...prev, { ...produit, Quantite: 1 }]
    })
  }

  const removeFromCart = (Id) => {
    setCartItems(prev => prev.filter(item => item.Id !== Id))
  }

  const updateQty = (Id, Quantite) => {
    if (Quantite < 1) { removeFromCart(Id); return }
    setCartItems(prev => prev.map(item => item.Id === Id ? { ...item, Quantite } : item))
  }

  const clearCart = () => setCartItems([])

  const totalItems = cartItems.reduce((sum, item) => sum + item.Quantite, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + item.Prix * item.Quantite, 0)

  // Charger les photos pour tous les items du panier
  useEffect(() => {
    const loadPhotos = async () => {
      if (cartItems.length === 0) {
        setCartItemsWithPhotos([])
        return
      }

      setIsLoadingPhotos(true)
      
      try {
        // Charger les photos pour chaque item en parallèle
        const itemsWithPhotos = await Promise.all(
          cartItems.map(async (item) => {
            try {
              const photos = await produitApi.getPhotos(item.Id)
              return { ...item, photos: photos || [] }
            } catch (error) {
              console.error(`Erreur chargement photos pour ${item.Id}:`, error)
              return { ...item, photos: [] }
            }
          })
        )
        
        setCartItemsWithPhotos(itemsWithPhotos)
      } catch (error) {
        console.error('Erreur chargement des photos:', error)
      } finally {
        setIsLoadingPhotos(false)
      }
    }

    loadPhotos()
  }, [cartItems]) // Recharger quand le panier change

  return (
    <CartContext.Provider value={{ 
      cartItems: cartItemsWithPhotos, // ← Retourner les items avec photos
      isLoadingPhotos,
      addToCart, 
      removeFromCart, 
      updateQty, 
      clearCart, 
      totalItems, 
      totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}