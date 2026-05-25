// CartContext.jsx
import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { produitApi } from '../lib/api'
import { useAddLignePanier, useClearPanier, useCreatePanier, useDeleteLignePanier, usePaniers, useUpdateLignePanier } from '../hooks/usePanier'
import { useUtilisateur } from '../hooks/useUtilisateur'
import { useUser } from '@clerk/clerk-react' 
/*
const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [cartItemsWithPhotos, setCartItemsWithPhotos] = useState([])
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false)

  const createPanier = useCreatePanier()
  const addLigne = useAddLignePanier()
  const updateLigne = useUpdateLignePanier()
  const deleteLigne = useDeleteLignePanier()
  const clearPanier = useClearPanier()

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
}*/

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const {user} = useUser()
  console.log("user dans CartProvider : ", user)
  const { utilisateur, isLoading: isLoadingUtilisateur, refetch } = useUtilisateur(user?.id) // ← Ajouter isLoading
  const { panierMips, isLoading: isLoadingPaniers } = usePaniers() // ← Récupérer isLoading
  
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false)
  const [cartItemsWithPhotos, setCartItemsWithPhotos] = useState([])

  const createPanier = useCreatePanier()
  const addLigne = useAddLignePanier()
  const updateLigne = useUpdateLignePanier()
  const deleteLigne = useDeleteLignePanier()
  const clearPanier = useClearPanier()
  const [updateKey, setUpdateKey] = useState(0)

  // Récupérer le panier de l'utilisateur depuis la BDD
  //const panier = utilisateur?.Id ? panierMips?.get(utilisateur.Id) : null
  //const lignes = panier?.Ligne_paniers ?? []

  console.log("l\'utilisateur : ", utilisateur)

  // ✅ STABILISER avec useMemo
  const panier = useMemo(() => {
    return utilisateur?.Panier
  }, [utilisateur?.Panier, panierMips, updateKey])

  // ✅ STABILISER les lignes
  const lignes = useMemo(() => {
    return panier?.Ligne_paniers ?? []
  }, [panier])

  // ✅ Attendre que TOUT soit chargé
  const isLoading = isLoadingUtilisateur || isLoadingPaniers

  console.log("panier : ", panier)

  // Ajouter au panier (BDD)
  const addToCart = async (produit) => {
    if (!utilisateur?.Id) {
      console.error("Utilisateur non connecté")
      return
    }console.log("Produit à ajouter : ", produit)

    try {
      let panierId = panier?.Id
      
      // Créer un panier si nécessaire
      if (!panierId) {
        const nouveauPanier = await createPanier.mutateAsync(utilisateur.Id)
        panierId = nouveauPanier.Id
      }
      
      // Vérifier si le produit est déjà dans le panier
      const ligneExistante = lignes.find(l => l.IdProduit === produit.Id)
      console.log("Ligne existante : ", ligneExistante)
      
      if (ligneExistante) {
        // Mettre à jour la quantité
        console.log("Ligne existante trouvée, mise à jour de la quantité", ligneExistante)
        await updateLigne.mutateAsync({
          Id: ligneExistante.Id,
          Quantite: ligneExistante.Quantite + 1
        })
      } else {
        // Ajouter nouvelle ligne
        await addLigne.mutateAsync({
          IdPanier: panierId,
          IdProduit: produit.Id,
          Quantite: 1
        })

        await refetch()
        setUpdateKey(prev => prev + 1) // ← Force recalcul

      }
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error)
    }
  }

  // Supprimer une ligne du panier (BDD)
  const removeFromCart = async (ligneId) => {
    try {
      await deleteLigne.mutateAsync(ligneId)

      await refetch()
      setUpdateKey(prev => prev + 1) // ← Force recalcul

    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  // Mettre à jour la quantité (BDD)
  const updateQty = async (ligneId, nouvelleQuantite) => {
    try {
      if (nouvelleQuantite < 1) {
        await deleteLigne.mutateAsync(ligneId)
      } else {
        await updateLigne.mutateAsync({
          Id: ligneId,
          Quantite: nouvelleQuantite
        })
      }

      await refetch()
      setUpdateKey(prev => prev + 1) // ← Force recalcul

    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
    }
  }

  // Vider le panier (BDD)
  const clearCart = async () => {
    console.log("📞 Appel de clearPanier.mutateAsync avec Id:", panier?.Id);
    if (!panier?.Id) {
      console.log("⚠️ Pas de panier.Id, abandon");
      return;
    }
    try {
      
      const result = await clearPanier.mutateAsync(panier.Id)
      console.log("✅ Résultat clearPanier:", result);

      console.log("🔄 Refetch en cours...");
      await refetch()

      console.log("🔄 UpdateKey incrémenté");
      setUpdateKey(prev => prev + 1) // ← Force recalcul

      console.log("🗑️ CartItemsWithPhotos vidé localement");
      setCartItemsWithPhotos([]);

      console.log("✅ CLEARCART TERMINE AVEC SUCCES");
    } catch (error) {
      console.error("Erreur lors du vidage du panier:", error)
    }
  }

  // Calculer les totaux à partir des lignes BDD + produits
  const totalItems = lignes.reduce((sum, ligne) => sum + ligne.Quantite, 0)
  // Pour totalPrice, il faut charger les infos des produits (prix)
  // Tu devras faire une requête pour récupérer les produits correspondants aux lignes

  // Charger les photos pour les lignes du panier
  useEffect(() => {
    if (isLoading) return
    const loadPhotosForLignes = async () => {
      if (lignes.length === 0) {
        setCartItemsWithPhotos([])
        return
      }

      setIsLoadingPhotos(true)
      
      try {
        // Pour chaque ligne, récupérer les infos du produit + photos
        const itemsWithDetails = await Promise.all(
          lignes.map(async (ligne) => {
            try {
              // Récupérer les détails du produit (dont le prix)
              const produit = await produitApi.getSpecific(ligne.IdProduit)
              const photos = await produitApi.getPhotos(ligne.IdProduit)
              return { 
                ...ligne, 
                produit: produit,
                photos: photos || [],
                Prix: produit?.Prix, // Ajouter le prix pour l'affichage
                Nom: produit?.Nom,
                Quantite: ligne.Quantite
              }
            } catch (error) {
              console.error(`Erreur chargement produit ${ligne.IdProduit}:`, error)
              return { ...ligne, photos: [], produit: null, Prix: 0 }
            }
          })
        )
        
        setCartItemsWithPhotos(itemsWithDetails)
        console.log("cartItemsWithPhotos a changé :", cartItemsWithPhotos)
      } catch (error) {
        console.error('Erreur chargement des détails:', error)
      } finally {
        setIsLoadingPhotos(false)
      }
    }

    loadPhotosForLignes()
  }, [lignes, isLoading]) // Recharger quand les lignes BDD changent

  const totalPrice = cartItemsWithPhotos.reduce((sum, item) => sum + (item.Prix * item.Quantite), 0)

  console.log("RENDER - cartItemsWithPhotos:", cartItemsWithPhotos)
  return (
    <CartContext.Provider value={{ 
      cartItems: cartItemsWithPhotos,
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