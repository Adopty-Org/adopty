import stripe from '../../config/stripe.js';
import {db} from '../../config/db.js';

const PLATFORM_FEE_PERCENTAGE = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE) || 10;

const calculatePlatformFee = (amountInCents) => {
  return Math.round(amountInCents * (PLATFORM_FEE_PERCENTAGE / 100));
};

// Paiement pour commande produits
export const createProductPaymentIntent = async (commandeId, userId, totalAmount) => {
  const [users] = await db.query(
    'SELECT stripeCustomerId FROM utilisateur WHERE Id = ?',
    [userId]
  );
  
  if (!users[0]?.stripeCustomerId) {
    throw new Error('Utilisateur pas encore configuré pour Stripe');
  }
  
  const amountInCents = Math.round(totalAmount * 100);
  const platformFee = calculatePlatformFee(amountInCents);
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'eur',
    customer: users[0].stripeCustomerId,
    payment_method_types: ['card'],
    application_fee_amount: platformFee,
    transfer_group: `order_${commandeId}_${Date.now()}`,
    metadata: {
      commandeId: commandeId.toString(),
      type: 'product_order',
    },
  });
  
  await db.query(
    `INSERT INTO paiement_commande 
     (IdCommande, Montant, Statut, stripe_payment_intent_id, applicationFeeAmount)
     VALUES (?, ?, 1, ?, ?)`,
    [commandeId, totalAmount, paymentIntent.id, platformFee / 100]
  );
  
  return paymentIntent;
};

// Paiement pour réservation service
/*export const createServicePaymentIntent = async (reservationId, userId, profilId, amount) => {
  const [users] = await db.query(
    'SELECT stripeCustomerId FROM utilisateur WHERE Id = ?',
    [userId]
  );
  
  const [profils] = await db.query(
    `SELECT u.stripeAccountId 
     FROM profil_prestataire p 
     JOIN utilisateur u ON p.IdUtilisateur = u.Id 
     WHERE p.Id = ?`,
    [profilId]
  );
  
  if (!users[0]?.stripeCustomerId) {
    throw new Error('Utilisateur pas encore configuré pour Stripe');
  }
  
  if (!profils[0]?.stripeAccountId) {
    throw new Error('Prestataire pas encore configuré pour recevoir des paiements');
  }
  
  const amountInCents = Math.round(amount * 100);
  const platformFee = calculatePlatformFee(amountInCents);
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'eur',
    customer: users[0].stripeCustomerId,
    payment_method_types: ['card'],
    transfer_data: {
      destination: profils[0].stripeAccountId,
    },
    application_fee_amount: platformFee,
    transfer_group: `booking_${reservationId}_${Date.now()}`,
    metadata: {
      reservationId: reservationId.toString(),
      profilId: profilId.toString(),
      type: 'service_booking',
    },
  });
  
  await db.query(
    `INSERT INTO paiement_service 
     (IdReservation, IdProfil, Montant, Statut, stripe_payment_intent_id, 
      connectedAccountId, applicationFeeAmount)
     VALUES (?, ?, ?, 1, ?, ?, ?)`,
    [reservationId, profilId, amount, paymentIntent.id, profils[0].stripeAccountId, platformFee / 100]
  );
  
  return paymentIntent;
};*/


// Paiement pour réservation service (STRIPE CONNECT)
export const createServicePaymentIntent = async (reservationId, userId, amount) => {
  try {
    console.log('Création du PaymentIntent pour la réservation:', reservationId, 'et l\'utilisateur:', userId);
    // 1. Récupérer le customer Stripe
    const [users] = await db.query(
      'SELECT stripeCustomerId FROM utilisateur WHERE Id = ?',
      [userId]
    );

    if (!users[0]?.stripeCustomerId) {
      throw new Error('Utilisateur pas encore configuré pour Stripe');
    }
    console.log("reservationId:", reservationId);

    // 2. Récupérer le profil depuis la réservation
    const [res] = await db.query(
      'SELECT IdProfil FROM reservation WHERE Id = ?',
      [reservationId]
    );

    if (!res || res.length === 0) {
      throw new Error(`Réservation ${reservationId} introuvable`);
    }else{
      console.log("IdProfil:", res[0].IdProfil);
    }

    if (!res[0].IdProfil) {
      throw new Error('Réservation invalide ou profil manquant');
    }else{
      console.log("Profil trouvé pour la réservation:", res[0].IdProfil);
    }

    if (!res[0]?.IdProfil) {
      throw new Error('Réservation invalide ou profil manquant');
    }

    // 3. Récupérer le compte Stripe du prestataire
    const [profil] = await db.query(
      `SELECT u.stripeAccountId 
       FROM profil_prestataire p 
       JOIN utilisateur u ON p.IdUtilisateur = u.Id 
       WHERE p.Id = ?`,
      [res[0].IdProfil]
    );

    if (!profil[0]?.stripeAccountId) {
      throw new Error('Prestataire pas encore configuré pour recevoir des paiements');
    }

    // 4. Calcul montant
    const amountInCents = Math.round(amount * 100);
    const platformFee = calculatePlatformFee(amountInCents);

    // 5. Stripe PaymentIntent (Connect)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      customer: users[0].stripeCustomerId,
      payment_method_types: ['card'],

      // envoi au prestataire
      transfer_data: {
        destination: profil[0].stripeAccountId,
      },

      // commission plateforme
      application_fee_amount: platformFee,

      transfer_group: `booking_${reservationId}_${Date.now()}`,

      metadata: {
        reservationId: reservationId.toString(),
        type: 'service_booking',
      },
    });

    // 6. Save DB (propre)
    await db.query(
      `INSERT INTO paiement_service 
       (IdReservation, Montant, Statut, stripe_payment_intent_id)
       VALUES (?, ?, 1, ?)`,
      [reservationId, amount, paymentIntent.id]
    );

    // 7. Return client secret
    return paymentIntent;

  } catch (error) {
    console.error('❌ Erreur paiement service:', error);
    throw error;
  }
};