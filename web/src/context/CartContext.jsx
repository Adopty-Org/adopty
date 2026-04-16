import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])

  const addToCart = (produit) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === produit.id)
      if (existing) {
        return prev.map(item =>
          item.id === produit.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...produit, qty: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return }
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, qty } : item))
  }

  const clearCart = () => setCartItems([])

  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + item.prix * item.qty, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
