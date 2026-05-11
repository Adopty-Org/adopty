/*import { useState } from 'react'
import { Link } from 'react-router'
import { useCart } from '../../context/CartContext'
import { PageTransition } from '../../components/Animations'
//import { useRequireAuthAction } from '../../hooks/useRequireAuthAction'

const Paiement = () => {
  const { cartItems, totalPrice, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  //const { requireAuthAction } = useRequireAuthAction()
  console.log("les cartItems :   ", cartItems)

  const handleSubmit = (e) => {
    e.preventDefault()
    /*requireAuthAction(() => {
      setIsProcessing(true)

      // Simuler un paiement
      setTimeout(() => {
        setIsProcessing(false)
        setIsSuccess(true)
        clearCart()
      }, 2000)
    })* /
  }

  if (isSuccess) {
    return (
      <PageTransition>
        <div className="min-h-[80vh] flex items-center justify-center px-6">
          <div className="bg-white border-4 border-black p-12 rounded-2xl shadow-[12px_12px_0px_0px_rgba(21,66,18,1)] max-w-lg w-full text-center">
            <span className="material-symbols-outlined text-8xl text-secondary mb-6 block animate-bounce">check_circle</span>
            <h1 className="font-['Chewy'] text-5xl text-primary mb-4">Merci !</h1>
            <p className="font-['Plus_Jakarta_Sans'] text-lg text-on-surface-variant mb-10">
              Votre commande a été validée avec succès. Vous recevrez un email de confirmation d'ici quelques instants.
            </p>
            <Link to="/boutique" className="inline-block bg-primary text-white font-bold py-4 px-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
              RETOURNER À LA BOUTIQUE
            </Link>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="font-['Chewy'] text-5xl md:text-7xl text-primary mb-4">Paiement</h1>
          <p className="text-xl text-on-surface-variant flex items-center gap-2">
            <Link to="/boutique" className="text-secondary hover:underline">Boutique</Link>
            <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
            <span>Finaliser la commande</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Formulaire de paiement * /}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Étape 1: Coordonnées * /}
              <section className="bg-surface-container p-8 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="font-['Chewy'] text-3xl text-primary mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-xl">1</span>
                  Vos Coordonnées
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-bold text-sm uppercase tracking-wider">Prénom</label>
                    <input required type="text" className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" placeholder="Jean" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-sm uppercase tracking-wider">Nom</label>
                    <input required type="text" className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" placeholder="Dupont" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-bold text-sm uppercase tracking-wider">Email</label>
                    <input required type="email" className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" placeholder="jean.dupont@email.com" />
                  </div>
                </div>
              </section>

              {/* Étape 2: Livraison * /}
              <section className="bg-surface-container p-8 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="font-['Chewy'] text-3xl text-primary mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-xl">2</span>
                  Livraison
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-bold text-sm uppercase tracking-wider">Adresse</label>
                    <input required type="text" className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" placeholder="123 rue de la patte" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-bold text-sm uppercase tracking-wider">Ville</label>
                      <input required type="text" className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" placeholder="Alger" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold text-sm uppercase tracking-wider">Code Postal</label>
                      <input required type="text" className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" placeholder="16000" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Étape 3: Paiement * /}
              <section className="bg-surface-container p-8 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="font-['Chewy'] text-3xl text-primary mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-xl">3</span>
                  Paiement
                </h2>
                <div className="space-y-6">
                  <div className="bg-primary/5 border-2 border-black p-4 rounded-xl flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">credit_card</span>
                      <span className="font-bold">Carte Bancaire / CIB</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-8 h-5 bg-black rounded opacity-20"></span>
                      <span className="w-8 h-5 bg-black rounded opacity-20"></span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-sm uppercase tracking-wider">Numéro de carte</label>
                    <input required type="text" className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-bold text-sm uppercase tracking-wider">Date d'expiration</label>
                      <input required type="text" className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold text-sm uppercase tracking-wider">CVC</label>
                      <input required type="text" className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" placeholder="123" />
                    </div>
                  </div>
                </div>
              </section>

              <button 
                type="submit"
                disabled={isProcessing || cartItems.length === 0}
                className="w-full bg-secondary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-2xl py-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 uppercase rounded-2xl"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin material-symbols-outlined">sync</span>
                    Traitement...
                  </>
                ) : (
                  <>
                    Confirmer le paiement ({totalPrice.toFixed(2)}€)
                    <span className="material-symbols-outlined">security</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Récapitulatif de commande * /}
          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-primary text-white p-8 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="font-['Chewy'] text-3xl mb-6">Récapitulatif</h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map(item => (
                  <div key={item?.Id} className="flex gap-4 items-center bg-white/10 p-4 border border-white/20 rounded-xl">
                    <img src={item.photos[0]?.Url} alt={item?.Nom} className="w-16 h-16 object-cover rounded-lg border-2 border-white/30" />
                    <div className="flex-1">
                      <p className="font-bold text-sm">{item?.Nom}</p>
                      <p className="text-xs text-white/60">Qté: {item?.Quantite}</p>
                    </div>
                    <p className="font-bold">{(item?.Prix * item?.Quantite).toFixed(2)}€</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t-2 border-white/20 space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="opacity-70">Sous-total</span>
                  <span className="font-bold">{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="opacity-70">Livraison</span>
                  <span className="font-bold">Gratuite</span>
                </div>
                <div className="flex justify-between text-4xl font-['Chewy'] pt-4 text-secondary">
                  <span>TOTAL</span>
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 bg-surface-container border-2 border-black rounded-xl">
                <span className="material-symbols-outlined text-secondary">verified_user</span>
                <p className="text-sm font-bold">Paiement 100% sécurisé</p>
              </div>
              <div className="flex items-center gap-3 p-4 bg-surface-container border-2 border-black rounded-xl">
                <span className="material-symbols-outlined text-secondary">eco</span>
                <p className="text-sm font-bold">Soutient directement notre refuge</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default Paiement */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUser } from '@clerk/clerk-react';
import { useStripePayment } from '../../hooks/useStripePayment';
import { PageTransition } from '../../components/Animations';
import { useUtilisateur } from '../../hooks/useUtilisateur';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const Paiement = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  const { createPaymentIntent, finalizeOrder, isProcessing, isSuccess, error, totalPrice, cartItems } = useStripePayment();
  const { utilisateur, isLoading: isUtilisateurLoading } = useUtilisateur(user?.id);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      alert("Le système de paiement n'est pas encore prêt, réessayez.");
      return;
    }
    
    // ✅ Vérifie que CardElement existe
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      alert("Formulaire de carte non chargé. Rafraîchissez la page.");
      return;
    }
    
    if (!user) {
      navigate('/auth', { state: { redirect: '/paiement' } });
      return;
    }

    if (!utilisateur?.Id) {
      console.error("❌ Pas d'utilisateur BDD");
      return;
    }
    
    if (cartItems.length === 0) {
      alert("Votre panier est vide");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("1️⃣ Création du payment intent...");
      const result = await createPaymentIntent(
        utilisateur.Id,
        formData.email || user.primaryEmailAddress?.emailAddress,
        `${formData.firstName} ${formData.lastName}`,
        formData
      );

      console.log("2️⃣ Résultat createPaymentIntent:", result);

      if (!result.success) {
        console.error("❌ Erreur createPaymentIntent:", result.error);
        alert(`Erreur: ${result.error}`);
        setIsSubmitting(false);
        return;
      }

      console.log("3️⃣ Confirmation du paiement Stripe...");
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        result.clientSecret,
        {
          payment_method: {
            card: cardElement, // ✅ Utilise la variable vérifiée
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email || user.primaryEmailAddress?.emailAddress,
              address: {
                line1: formData.address,
                city: formData.city,
                postal_code: formData.postalCode,
              },
            },
          },
        }
      );

      if (stripeError) {
        console.error("❌ Erreur Stripe:", stripeError);
        alert(`Erreur de paiement: ${stripeError.message}`);
        setIsSubmitting(false);
        return;
      }

      console.log("4️⃣ Paiement réussi, finalisation de la commande...");
      await finalizeOrder(result.commandeId, result.subOrders);
      
      console.log("5️⃣ Commande finalisée !");
      alert("Paiement réussi !");

    } catch (err) {
      console.error("❌ ERREUR DETAILLEE:", err);
      alert(`Erreur détaillée: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <PageTransition>
        <div className="min-h-[80vh] flex items-center justify-center px-6">
          <div className="bg-white border-4 border-black p-12 rounded-2xl shadow-[12px_12px_0px_0px_rgba(21,66,18,1)] max-w-lg w-full text-center">
            <span className="material-symbols-outlined text-8xl text-secondary mb-6 block animate-bounce">check_circle</span>
            <h1 className="font-['Chewy'] text-5xl text-primary mb-4">Merci !</h1>
            <p className="font-['Plus_Jakarta_Sans'] text-lg text-on-surface-variant mb-10">
              Votre commande a été validée avec succès. Vous recevrez un email de confirmation d'ici quelques instants.
            </p>
            <Link to="/boutique" className="inline-block bg-primary text-white font-bold py-4 px-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
              RETOURNER À LA BOUTIQUE
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (isUtilisateurLoading) {
    return (
      <PageTransition>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Chargement de vos informations...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="font-['Chewy'] text-5xl md:text-7xl text-primary mb-4">Paiement</h1>
          <p className="text-xl text-on-surface-variant flex items-center gap-2">
            <Link to="/boutique" className="text-secondary hover:underline">Boutique</Link>
            <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
            <span>Finaliser la commande</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border-2 border-red-500 text-red-700 p-4 rounded-xl">
            <p className="font-bold">Erreur de paiement:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Étape 1: Coordonnées */}
              <section className="bg-surface-container p-8 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="font-['Chewy'] text-3xl text-primary mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-xl">1</span>
                  Vos Coordonnées
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-bold text-sm uppercase tracking-wider">Prénom</label>
                    <input 
                      required 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" 
                      placeholder="Jean" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-sm uppercase tracking-wider">Nom</label>
                    <input 
                      required 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" 
                      placeholder="Dupont" 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-bold text-sm uppercase tracking-wider">Email</label>
                    <input 
                      required 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email" 
                      className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" 
                      placeholder="jean.dupont@email.com" 
                      defaultValue={user?.primaryEmailAddress?.emailAddress}
                    />
                  </div>
                </div>
              </section>

              {/* Étape 2: Livraison */}
              <section className="bg-surface-container p-8 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="font-['Chewy'] text-3xl text-primary mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-xl">2</span>
                  Livraison
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-bold text-sm uppercase tracking-wider">Adresse</label>
                    <input 
                      required 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" 
                      placeholder="123 rue de la patte" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-bold text-sm uppercase tracking-wider">Ville</label>
                      <input 
                        required 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        type="text" 
                        className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" 
                        placeholder="Alger" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold text-sm uppercase tracking-wider">Code Postal</label>
                      <input 
                        required 
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        type="text" 
                        className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary outline-none rounded-lg" 
                        placeholder="16000" 
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ✅ Étape 3: Paiement avec CardElement Stripe */}
              <section className="bg-surface-container p-8 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="font-['Chewy'] text-3xl text-primary mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-xl">3</span>
                  Paiement
                </h2>
                <div className="space-y-6">
                  <div className="bg-primary/5 border-2 border-black p-4 rounded-xl flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">credit_card</span>
                      <span className="font-bold">Carte Bancaire / CIB</span>
                    </div>
                  </div>
                  
                  {/* ✅ CardElement sécurisé */}
                  <div className="space-y-2">
                    <label className="font-bold text-sm uppercase tracking-wider">Informations de carte</label>
                    <div className="border-2 border-black p-3 bg-white rounded-lg">
                      <CardElement 
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#000',
                              '::placeholder': {
                                color: '#aab7c4',
                              },
                            },
                          },
                          hidePostalCode: true,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Paiement sécurisé par Stripe</p>
                  </div>
                </div>
              </section>

              <button 
                type="submit"
                disabled={!stripe || !elements || isSubmitting || cartItems.length === 0}
                className="w-full bg-secondary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-2xl py-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 uppercase rounded-2xl"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin material-symbols-outlined">sync</span>
                    Traitement...
                  </>
                ) : (
                  <>
                    Confirmer le paiement ({totalPrice.toFixed(2)}€)
                    <span className="material-symbols-outlined">security</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Récapitulatif - inchangé */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-primary text-white p-8 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="font-['Chewy'] text-3xl mb-6">Récapitulatif</h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map(item => (
                  <div key={item?.Id} className="flex gap-4 items-center bg-white/10 p-4 border border-white/20 rounded-xl">
                    <img src={item.photos?.[0]?.Url} alt={item?.Nom} className="w-16 h-16 object-cover rounded-lg border-2 border-white/30" />
                    <div className="flex-1">
                      <p className="font-bold text-sm">{item?.Nom}</p>
                      <p className="text-xs text-white/60">Qté: {item?.Quantite}</p>
                    </div>
                    <p className="font-bold">{(item?.Prix * item?.Quantite).toFixed(2)}€</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t-2 border-white/20 space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="opacity-70">Sous-total</span>
                  <span className="font-bold">{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="opacity-70">Livraison</span>
                  <span className="font-bold">Gratuite</span>
                </div>
                <div className="flex justify-between text-4xl font-['Chewy'] pt-4 text-secondary">
                  <span>TOTAL</span>
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 bg-surface-container border-2 border-black rounded-xl">
                <span className="material-symbols-outlined text-secondary">verified_user</span>
                <p className="text-sm font-bold">Paiement 100% sécurisé</p>
              </div>
              <div className="flex items-center gap-3 p-4 bg-surface-container border-2 border-black rounded-xl">
                <span className="material-symbols-outlined text-secondary">eco</span>
                <p className="text-sm font-bold">Soutient directement notre refuge</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Paiement;