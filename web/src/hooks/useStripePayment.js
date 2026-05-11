// hooks/useStripePayment.js
import { useState } from 'react';
import { sousCommandeApi, commandeApi, stripeApi } from '../lib/api.js';
import { useCart } from '../context/CartContext';
// ❌ SUPPRIME loadStripe et stripePromise - c'est le composant qui doit s'en occuper

export const useStripePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { cartItems, totalPrice, clearCart } = useCart();

  const groupItemsByRefuge = (items) => {
    const groups = new Map();
    
    items.forEach(item => {
      const refugeId = item.IdRefuge;
      if (!groups.has(refugeId)) {
        groups.set(refugeId, {
          refugeId,
          items: [],
          totalPrix: 0,
          refugeNom: item.RefugeNom || `Refuge ${refugeId}`
        });
      }
      const group = groups.get(refugeId);
      group.items.push(item);
      group.totalPrix += item.Prix * item.Quantite;
    });
    
    return Array.from(groups.values());
  };

  const createOrderWithSubOrders = async (userId, refugeGroups, userEmail, userAddress) => {
    try {
      const commande = await commandeApi.create({
        IdUtilisateur: userId,
        Statut: 1
      });
      
      console.log("✅ Commande principale créée:", commande.id);
      
      const subOrders = [];
      for (const group of refugeGroups) {
        const sousCommande = await sousCommandeApi.create({
          IdCommande: commande.id,
          IdRefuge: group.refugeId,
          Statut: 1,
          Total_prix: group.totalPrix,
          platformFee: 10
        });
        
        subOrders.push({
          id: sousCommande.Id,
          refugeId: group.refugeId,
          totalPrix: group.totalPrix,
          items: group.items
        });
        
        console.log(`✅ Sous-commande créée pour refuge ${group.refugeId}:`, sousCommande.Id);
      }
      
      return { commande, subOrders };
      
    } catch (error) {
      console.error("❌ Erreur création commande:", error);
      throw new Error("Impossible de créer la commande");
    }
  };

  // ⚠️ Cette fonction retourne MAINTENANT uniquement le clientSecret
  // La confirmation du paiement est faite par le composant Stripe Elements
  const createPaymentIntent = async (userId, userEmail, userName, formData) => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log("📝 Création du payment intent pour:", userId);
      
      // 1. Vérifier/créer le customer Stripe
      await stripeApi.createCustomer({
        userId,
        email: userEmail,
        name: userName
      });

      // 2. Organiser les articles par refuge
      const refugeGroups = groupItemsByRefuge(cartItems);
      
      if (refugeGroups.length === 0) {
        throw new Error("Votre panier est vide");
      }
      
      // 3. Créer l'adresse de livraison formatée
      const userAddress = `${formData.address}, ${formData.city} ${formData.postalCode}`;
      
      // 4. Créer la commande principale et les sous-commandes
      const { commande, subOrders } = await createOrderWithSubOrders(
        userId,
        refugeGroups,
        userEmail,
        userAddress
      );
      
      // 5. Créer le PaymentIntent (pas de confirmation ici !)
      let paymentResponse;
      
      if (refugeGroups.length === 1) {
        paymentResponse = await stripeApi.payProduct({
          commandeId: commande.id,
          userId: userId,
          totalAmount: totalPrice
        });
      } else {
        const subOrdersForPayment = subOrders.map(sub => ({
          refugeId: sub.refugeId,
          Total_prix: sub.totalPrix
        }));
        
        paymentResponse = await stripeApi.payMultiVendor({
          commandeId: commande.id,
          userId: userId,
          subOrders: subOrdersForPayment
        });
      }
      
      // ✅ Retourner les infos nécessaires pour la confirmation
      return {
        success: true,
        clientSecret: paymentResponse.clientSecret,
        commandeId: commande.id,
        subOrders: subOrders
      };

    } catch (err) {
      console.error('Payment creation error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour finaliser la commande après paiement réussi
  const finalizeOrder = async (commandeId, subOrders) => {
    try {
      await commandeApi.update({
        id: commandeId,
        formData: { Statut: 2 }
      });
      
      for (const sub of subOrders) {
        await sousCommandeApi.update({
          id: sub.id,
          formData: { Statut: 2 }
        });
      }
      
      setIsSuccess(true);
      clearCart();
      
      return { success: true };
    } catch (err) {
      console.error('Error finalizing order:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    createPaymentIntent,  // ← Renommé et plus clair
    finalizeOrder,
    isProcessing,
    isSuccess,
    error,
    totalPrice,
    cartItems
  };
};