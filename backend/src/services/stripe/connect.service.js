import stripe from '../../config/stripe.js';
import {db} from '../../config/db.js';

// Pour les refuges
export const createConnectAccountForRefuge = async (refugeId, email, name) => {
  const account = await stripe.accounts.create({
    type: 'express',
    email: email,
    business_type: 'non_profit',
    business_profile: {
      name: name,
      url: 'https://adopty.com',
    },
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    metadata: { refugeId: refugeId.toString() },
  });

  await db.query(
    `UPDATE refuge SET stripeAccountId = ?, stripeAccountStatus = 'pending' WHERE Id = ?`,
    [account.id, refugeId]
  );

  return account;
};

// Pour les prestataires
export const createConnectAccountForPrestataire = async (userId, email, name) => {
  const account = await stripe.accounts.create({
    type: 'express',
    email: email,
    business_type: 'individual',
    business_profile: {
      name: name,
      url: 'https://adopty.com',
    },
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    metadata: { userId: userId.toString() },
  });

  await db.query(
    `UPDATE utilisateur SET stripeAccountId = ?, stripeAccountStatus = 'pending' WHERE Id = ?`,
    [account.id, userId]
  );

  return account;
};

// Lien d'onboarding
export const createAccountLink = async (accountId, returnPath) => {
    console.log('Création du lien d\'onboarding pour le compte:', accountId);
  const { FRONTEND_URL } = process.env;
  console.log('URL de rafraîchissement pour l\'onboarding:', `${FRONTEND_URL}/onboarding/refresh`);
  console.log('URL de retour pour l\'onboarding:', `${FRONTEND_URL}/${returnPath}/onboarding/success`);
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${FRONTEND_URL}/onboarding/refresh`,
    return_url: `${FRONTEND_URL}/${returnPath}/onboarding/success`,
    type: 'account_onboarding',
  });

  return accountLink;
};

// Vérifier statut compte
export const getAccountStatus = async (accountId) => {
  const account = await stripe.accounts.retrieve(accountId);
  
  return {
    status: account.charges_enabled && account.payouts_enabled ? 'verified' : 'pending',
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  };
};