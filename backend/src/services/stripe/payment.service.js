// services/payment.service.js

import stripe from '../../config/stripe.js';
import {db} from '../../config/db.js';
import { getOrCreateStripeCustomer } from '../../utils/stripe_customer.util.js';
//import { getSousCommandesOfCommandeControlleur } from '../../controlleurs/sous_commande.controlleur.js';

const PLATFORM_FEE_PERCENTAGE = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE) || 10;

const calculatePlatformFee = (amountInCents) => {
  return Math.round(amountInCents * (PLATFORM_FEE_PERCENTAGE / 100));
};

export const getSousCommandesOfCommande = async (commandeId) => {
  const [rows] = await db.query(
    'SELECT * FROM sous_commande WHERE IdCommande = ?',
    [commandeId]
  );
  return rows;
};

// Paiement pour commande produits
/*export const createProductPaymentIntent = async (commandeId, userId, totalAmount) => {
  const [users] = await db.query(
    'SELECT stripeCustomerId FROM utilisateur WHERE Id = ?',
    [userId]
  );
  
  if (!users[0]?.stripeCustomerId) {
    throw new Error('Utilisateur pas encore configuré pour Stripe');
  }

  const [existingRows] = await db.query(
    'SELECT stripe_payment_intent_id FROM paiement_commande WHERE IdCommande = ?',
    [commandeId]
  );

  if (existingRows[0]?.stripe_payment_intent_id) {
    return await stripe.paymentIntents.retrieve(existingRows[0].stripe_payment_intent_id);
  }
  
  const amountInCents = Math.round(totalAmount * 100);
  const platformFee = calculatePlatformFee(amountInCents);
  const idempotencyKey = `product_order_${commandeId}_${userId}`;
  
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
  }, {
    idempotencyKey,
  });
  
  await db.query(
    `INSERT INTO paiement_commande 
     (IdCommande, Montant, Statut, stripe_payment_intent_id, applicationFeeAmount)
     VALUES (?, ?, 1, ?, ?)`,
    [commandeId, totalAmount, paymentIntent.id, platformFee / 100]
  );
  
  return paymentIntent;
};*/

/*import { getOrCreateStripeCustomer } from '../../utils/stripe_customer.util.js';
*/
// c'est un test d'implementation 
export const createProductPaymentIntent = async (commandeId, userId, totalAmount, userEmail, userName) => {
  // Garantir que l'utilisateur a un customer Stripe
  console.log("les entres de createProductPaymentIntent :  ",  commandeId, userId, totalAmount, userEmail, userName)
  const stripeCustomerId = await getOrCreateStripeCustomer(userId, userEmail, userName);
  
  const [existingRows] = await db.query(
    'SELECT stripe_payment_intent_id FROM paiement_commande WHERE IdCommande = ?',
    [commandeId]
  );

  if (existingRows[0]?.stripe_payment_intent_id) {
    return await stripe.paymentIntents.retrieve(existingRows[0].stripe_payment_intent_id);
  }

  const sousCommande = await getSousCommandesOfCommande(commandeId);

 console.log("refuge : ", sousCommande)

  const [refuge] = await db.query(
    'SELECT stripeAccountId FROM refuge WHERE Id = ?',
    [sousCommande[0]?.IdRefuge] // Tu dois adapter cette requête selon ta structure
  );

  console.log("refuge : ", refuge)
  
  const amountInCents = Math.round(totalAmount * 100);
  const platformFee = calculatePlatformFee(amountInCents);
  const idempotencyKey = `product_order_${commandeId}_${userId}`;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'eur',
    customer: stripeCustomerId, // ← maintenant garanti d'exister
    payment_method_types: ['card'],
    application_fee_amount: platformFee,
    transfer_data: {
      destination: refuge[0]?.stripeAccountId, // ← ID du compte refuge
    },
    transfer_group: `order_${commandeId}_${Date.now()}`,
    metadata: {
      commandeId: commandeId.toString(),
      type: 'product_order',
    },
  }, {
    idempotencyKey,
  });
  
  await db.query(
    `INSERT INTO paiement_commande 
     (IdCommande, Montant, Statut, stripe_payment_intent_id, applicationFeeAmount)
     VALUES (?, ?, 1, ?, ?)`,
    [commandeId, totalAmount, paymentIntent.id, platformFee / 100]
  );
  
  return paymentIntent;
};



/*const PLATFORM_FEE_PERCENTAGE = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE) || 10;

const calculatePlatformFee = (amountInCents) => {
  return Math.round(amountInCents * (PLATFORM_FEE_PERCENTAGE / 100));
};

*/export const createOrderWithSubOrders = async (
  commandeId,
  userId,
  subOrders, // [{ refugeId, totalPrix }]
  userEmail,
  userName
) => {
  // 1. Garantir que l'utilisateur a un customer Stripe
  const stripeCustomerId = await getOrCreateStripeCustomer(userId, userEmail, userName);
  
  // 2. Vérifier si le paiement existe déjà
  const [existingPayment] = await db.query(
    'SELECT stripe_payment_intent_id FROM paiement_commande WHERE IdCommande = ?',
    [commandeId]
  );
  
  if (existingPayment[0]?.stripe_payment_intent_id) {
    return await stripe.paymentIntents.retrieve(existingPayment[0].stripe_payment_intent_id);
  }
  
  // 3. Calculer le montant total
  const totalAmount = subOrders.reduce((sum, sub) => sum + parseFloat(sub.Total_prix), 0);
  const totalAmountInCents = Math.round(totalAmount * 100);
  const platformFee = calculatePlatformFee(totalAmountInCents);
  
  // 4. Récupérer les comptes Stripe des refuges
  const transfersData = [];
  for (const subOrder of subOrders) {
    const [refuges] = await db.query(
      'SELECT stripeAccountId FROM refuge WHERE Id = ?',
      [subOrder.refugeId]
    );
    
    if (!refuges[0]?.stripeAccountId) {
      throw new Error(`Le refuge ${subOrder.refugeId} n'est pas configuré pour recevoir des paiements`);
    }
    
    transfersData.push({
      destination: refuges[0].stripeAccountId,
      amount: Math.round(parseFloat(subOrder.Total_prix) * 100),
      refugeId: subOrder.refugeId,
      totalPrix: subOrder.Total_prix,
    });
  }
  
  // 5. Créer le PaymentIntent principal
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmountInCents,
    currency: 'eur',
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    application_fee_amount: platformFee,
    transfer_group: `order_${commandeId}_${Date.now()}`,
    metadata: {
      commandeId: commandeId.toString(),
      type: 'multi_vendor_order',
      subOrdersCount: subOrders.length.toString(),
    },
  });
  
  // 6. Sauvegarder dans paiement_commande
  await db.query(
    `INSERT INTO paiement_commande 
     (IdCommande, Montant, Statut, stripe_payment_intent_id, applicationFeeAmount)
     VALUES (?, ?, 1, ?, ?)`,
    [commandeId, totalAmount, paymentIntent.id, platformFee / 100]
  );
  
  // 7. Les transferts seront créés après la confirmation du paiement
  // Stocker les infos pour les transferts ultérieurs
  for (const transfer of transfersData) {
    await db.query(
      `UPDATE sous_commande 
       SET stripe_transfer_id = NULL, 
           platformFee = ?,
           stripe_transfer_status = 'pending'
       WHERE IdCommande = ? AND IdRefuge = ?`,
      [(transfer.amount * (PLATFORM_FEE_PERCENTAGE / 100)) / 100, commandeId, transfer.refugeId]
    );
  }
  
  return paymentIntent;
};




//------------------------------------------
// la fusion des deux !
//------------------------------------------
// services/payment.service.js (version unifiée)
export const createPaymentIntent = async ({
  commandeId,
  userId,
  items,  // peut être un montant unique OU un tableau de sous-commandes
  userEmail,
  userName
}) => {
  // 1. Garantir le customer Stripe
  const stripeCustomerId = await getOrCreateStripeCustomer(userId, userEmail, userName);
  
  // 2. Vérifier si paiement existe déjà
  const [existingPayment] = await db.query(
    'SELECT stripe_payment_intent_id FROM paiement_commande WHERE IdCommande = ?',
    [commandeId]
  );
  
  if (existingPayment[0]?.stripe_payment_intent_id) {
    return await stripe.paymentIntents.retrieve(existingPayment[0].stripe_payment_intent_id);
  }
  
  // 3. Déterminer le mode (single ou multi-vendeur)
  const isMultiVendor = Array.isArray(items) && items.length > 0 && 'refugeId' in items[0];
  
  let totalAmount, transfersData, paymentIntentConfig;
  
  if (isMultiVendor) {
    // Mode multi-vendeurs
    totalAmount = items.reduce((sum, item) => sum + parseFloat(item.Total_prix), 0);
    transfersData = [];
    
    for (const item of items) {
      const [refuges] = await db.query(
        'SELECT stripeAccountId FROM refuge WHERE Id = ?',
        [item.refugeId]
      );
      
      if (!refuges[0]?.stripeAccountId) {
        throw new Error(`Le refuge ${item.refugeId} n'est pas configuré`);
      }
      
      transfersData.push({
        destination: refuges[0].stripeAccountId,
        amount: Math.round(parseFloat(item.Total_prix) * 100),
        refugeId: item.refugeId,
      });
    }
    
    paymentIntentConfig = {
      metadata: {
        commandeId: commandeId.toString(),
        type: 'multi_vendor_order',
        subOrdersCount: items.length.toString(),
      },
    };
  } else {
    // Mode single vendeur
    const singleAmount = typeof items === 'number' ? items : items.totalAmount;
    totalAmount = singleAmount;
    paymentIntentConfig = {
      metadata: {
        commandeId: commandeId.toString(),
        type: 'single_vendor_order',
      },
    };
  }
  
  // 4. Calculer les frais
  const totalAmountInCents = Math.round(totalAmount * 100);
  const platformFee = calculatePlatformFee(totalAmountInCents);
  
  // 5. Créer le PaymentIntent
  const paymentIntentData = {
    amount: totalAmountInCents,
    currency: 'eur',
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    application_fee_amount: platformFee,
    transfer_group: `order_${commandeId}_${Date.now()}`,
    ...paymentIntentConfig,
  };
  
  // Ajouter les transfer_data seulement pour single vendor
  if (!isMultiVendor && transfersData?.[0]) {
    paymentIntentData.transfer_data = {
      destination: transfersData[0].destination,
    };
  }
  
  const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
  
  // 6. Sauvegarder en DB
  await db.query(
    `INSERT INTO paiement_commande 
     (IdCommande, Montant, Statut, stripe_payment_intent_id, applicationFeeAmount)
     VALUES (?, ?, 1, ?, ?)`,
    [commandeId, totalAmount, paymentIntent.id, platformFee / 100]
  );
  
  // 7. Pour multi-vendeurs, préparer les sous-commandes
  if (isMultiVendor && transfersData) {
    for (const transfer of transfersData) {
      await db.query(
        `UPDATE sous_commande 
         SET stripe_transfer_status = 'pending'
         WHERE IdCommande = ? AND IdRefuge = ?`,
        [commandeId, transfer.refugeId]
      );
    }
  }
  
  return paymentIntent;
};

//--------------------
// comment l'utiliser 
//--------------------
/*
// Cas 1: Un seul refuge
const payment = await createPaymentIntent({
  commandeId: 123,
  userId: 456,
  items: 150.00,  // simple montant
  userEmail: "user@example.com",
  userName: "John Doe"
});

// Cas 2: Plusieurs refuges
const payment = await createPaymentIntent({
  commandeId: 123,
  userId: 456,
  items: [
    { refugeId: 1, Total_prix: 150.00 },
    { refugeId: 2, Total_prix: 75.00 }
  ],
  userEmail: "user@example.com",
  userName: "John Doe"
}); 
*/



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

    const [existingRows] = await db.query(
      'SELECT stripe_payment_intent_id FROM paiement_service WHERE IdReservation = ?',
      [reservationId]
    );

    if (existingRows[0]?.stripe_payment_intent_id) {
      return await stripe.paymentIntents.retrieve(existingRows[0].stripe_payment_intent_id);
    }

    // 5. Stripe PaymentIntent (Connect)
    const idempotencyKey = `service_booking_${reservationId}_${userId}`;
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
    }, {
      idempotencyKey,
    });

    // 6. Save DB (propre)
    await db.query(
      `INSERT INTO paiement_service 
       (IdReservation, Montant, Statut, stripe_payment_intent_id, connectedAccountId, applicationFeeAmount)
       VALUES (?, ?, 1, ?, ?, ?)`,
      [reservationId, amount, paymentIntent.id, profil[0].stripeAccountId, platformFee / 100]
    );

    // 7. Return client secret
    return paymentIntent;

  } catch (error) {
    console.error('❌ Erreur paiement service:', error);
    throw error;
  }
};