// utils/stripeCustomer.js
import stripe from '../config/stripe.js';
import { db } from '../config/db.js';

export const getOrCreateStripeCustomer = async (userId, email, name) => {
  // 1. Vérifier si l'utilisateur a déjà un customerId
  const [users] = await db.query(
    'SELECT stripeCustomerId, AddresseEmail AS email, Nom FROM utilisateur WHERE Id = ?',
    [userId]
  );
  
  if (!users[0]) {
    throw new Error(`Utilisateur ${userId} introuvable`);
  }
  
  // 2. Si déjà existant, le retourner
  if (users[0].stripeCustomerId) {
    return users[0].stripeCustomerId;
  }
  
  // 3. Créer un nouveau customer Stripe
  const customer = await stripe.customers.create({
    email: email || users[0].email,
    name: name || users[0].nom,
    metadata: {
      userId: userId.toString(),
    },
  });
  
  // 4. Sauvegarder dans la base de données
  await db.query(
    'UPDATE utilisateur SET stripeCustomerId = ? WHERE Id = ?',
    [customer.id, userId]
  );
  
  return customer.id;
};