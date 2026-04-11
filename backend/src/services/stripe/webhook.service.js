import stripe from '../../config/stripe.js';
import {db} from '../../config/db.js';

export const handleWebhook = async (event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
      
    case 'account.updated':
      await handleAccountUpdated(event.data.object);
      break;
      
    case 'transfer.created':
      await handleTransferCreated(event.data.object);
      break;
      
    case 'transfer.failed':
      await handleTransferFailed(event.data.object);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

async function handlePaymentSuccess(paymentIntent) {
  const metadata = paymentIntent.metadata;
  
  if (metadata.type === 'product_order') {
    // Mettre à jour le statut de la commande
    await db.query(
      'UPDATE commande SET Statut = (SELECT Id FROM statut WHERE Statut = "payé") WHERE Id = ?',
      [metadata.commandeId]
    );
    
    // Mettre à jour le paiement
    await db.query(
      'UPDATE paiement_commande SET Statut = (SELECT Id FROM statut WHERE Statut = "payé") WHERE stripe_payment_intent_id = ?',
      [paymentIntent.id]
    );
    
  } else if (metadata.type === 'service_booking') {
    // Mettre à jour le statut de la réservation
    await db.query(
      'UPDATE reservation SET Statut = (SELECT Id FROM statut WHERE Statut = "confirmé") WHERE Id = ?',
      [metadata.reservationId]
    );
    
    // Mettre à jour le paiement
    await db.query(
      'UPDATE paiement_service SET Statut = (SELECT Id FROM statut WHERE Statut = "payé") WHERE stripe_payment_intent_id = ?',
      [paymentIntent.id]
    );
  }
  
  console.log(`✅ Paiement réussi: ${paymentIntent.id}`);
}

async function handlePaymentFailed(paymentIntent) {
  const metadata = paymentIntent.metadata;
  
  if (metadata.type === 'product_order') {
    await db.query(
      'UPDATE commande SET Statut = (SELECT Id FROM statut WHERE Statut = "échec paiement") WHERE Id = ?',
      [metadata.commandeId]
    );
  } else if (metadata.type === 'service_booking') {
    await db.query(
      'UPDATE reservation SET Statut = (SELECT Id FROM statut WHERE Statut = "échec paiement") WHERE Id = ?',
      [metadata.reservationId]
    );
  }
  
  console.log(`❌ Paiement échoué: ${paymentIntent.id}`);
}

async function handleAccountUpdated(account) {
  const isVerified = account.charges_enabled && account.payouts_enabled;
  const status = isVerified ? 'verified' : 'pending';
  
  // Chercher si c'est un refuge ou un utilisateur
  const [refuge] = await db.query(
    'SELECT Id FROM refuge WHERE stripeAccountId = ?',
    [account.id]
  );
  
  if (refuge.length > 0) {
    await db.query(
      'UPDATE refuge SET stripeAccountStatus = ? WHERE stripeAccountId = ?',
      [status, account.id]
    );
    console.log(`🏠 Refuge ${refuge[0].Id} compte: ${status}`);
  } else {
    await db.query(
      'UPDATE utilisateur SET stripeAccountStatus = ? WHERE stripeAccountId = ?',
      [status, account.id]
    );
    console.log(`👤 Prestataire compte: ${status}`);
  }
}

async function handleTransferCreated(transfer) {
  // Mettre à jour le stripe_transfer_id dans sous_commande
  // (à adapter selon ta logique)
  console.log(`🔄 Transfer créé: ${transfer.id}`);
}

async function handleTransferFailed(transfer) {
  console.log(`⚠️ Transfer échoué: ${transfer.id}`);
}