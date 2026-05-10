import stripe from '../config/stripe.js';
import { db } from '../config/db.js'; // ← Ajouter cette ligne

import * as connectService from '../services/stripe/connect.service.js';
import * as paymentService from '../services/stripe/payment.service.js';
import { handleWebhook } from '../services/stripe/webhook.service.js';

// ===== WEBHOOK =====
export const webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await handleWebhook(event);

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    res.status(400).send(err.message);
  }
};

export async function createCustomer(req, res) {
  try {
    //return res.status(200).json({message: "oui ca fonctionne"})
    const { userId, email, name } = req.body;
    console.log("l\'utilisateur :  ", userId, email, name)

    // Vérifier si l'utilisateur existe
    const [rows] = await db.query(
      'SELECT Id FROM utilisateur WHERE Id = ?',
      [userId]
    );
    
    if (!rows[0]) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Créer le customer Stripe
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { userId: userId.toString() },
    });

    // Sauvegarder dans la base
    const [result] = await db.query(
      'UPDATE utilisateur SET stripeCustomerId = ? WHERE Id = ?',
      [customer.id, userId]
    );
    
    if (result.affectedRows !== 1) {
      // Rollback: supprimer le customer Stripe
      await stripe.customers.del(customer.id);
      return res.status(500).json({ error: 'Impossible de lier le client Stripe' });
    }

    console.log("la fonction a rendu une moitie d\'une reponce .")

    res.json({
      success: true,
      customerId: customer.id
    });
    //console.log("les reponces :  ", res)

  } catch (error) {
    console.error('❌ Create customer error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== CONNECT REFUGE =====
export const createRefugeAccount = async (req, res) => {
  try {
    const { refugeId } = req.params;
    const { email, name } = req.body;

    const account = await connectService.createConnectAccountForRefuge(
      refugeId,
      email,
      name
    );

    const link = await connectService.createAccountLink(
      account.id,
      `refuge/${refugeId}`
    );

    res.json({
      success: true,
      accountId: account.id,
      onboardingUrl: link.url
    });

  } catch (error) {
    console.error('❌ Create refuge account error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== CONNECT PRESTATAIRE =====
export const createPrestataireAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, name } = req.body;

    const account = await connectService.createConnectAccountForPrestataire(
      userId,
      email,
      name
    );

    const link = await connectService.createAccountLink(
      account.id,
      `prestataire`
    );

    res.json({
      success: true,
      accountId: account.id,
      onboardingUrl: link.url
    });

  } catch (error) {
    console.error('❌ Create prestataire account error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== STATUS =====
export const getAccountStatus = async (req, res) => {
  try {
    const { accountId } = req.params;

    const status = await connectService.getAccountStatus(accountId);

    res.json(status);

  } catch (error) {
    console.error('❌ Get account status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== PAYMENT PRODUIT (version améliorée avec email et name) =====
export const payProduct = async (req, res) => {
  try {
    const { commandeId, userId, totalAmount } = req.body;
    console.log("le req.body :  ", req.body)
    
    // Récupérer les infos de l'utilisateur depuis la DB
    const [users] = await db.query(
      'SELECT AddresseEmail AS email, Nom AS nom FROM utilisateur WHERE Id = ?',
      [userId]
    );
    
    if (!users[0]) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const userEmail = users[0].email;
    const userName = users[0].nom;

    const paymentIntent = await paymentService.createProductPaymentIntent(
      commandeId,
      userId,
      totalAmount,
      userEmail,  // ← Ajouté
      userName    // ← Ajouté
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Pay product error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== PAYMENT SERVICE (version améliorée avec email et name) =====
export const payService = async (req, res) => {
  try {
    const { reservationId, userId, amount } = req.body; // profilId n'est plus nécessaire
    
    // Récupérer les infos de l'utilisateur
    const [users] = await db.query(
      'SELECT AddresseEmail AS email, Nom AS nom FROM utilisateur WHERE Id = ?',
      [userId]
    );
    
    if (!users[0]) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const userEmail = users[0].email;
    const userName = users[0].nom;

    const paymentIntent = await paymentService.createServicePaymentIntent(
      reservationId,
      userId,
      amount,
      userEmail,  // ← Ajouté si ta fonction le supporte
      userName    // ← Ajouté si ta fonction le supporte
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Pay service error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== NOUVEAU : PAYMENT MULTI-VENDEURS =====
export const payMultiVendorOrder = async (req, res) => {
  try {
    const { commandeId, userId, subOrders } = req.body;
    
    // subOrders = [{ refugeId, Total_prix }, ...]
    
    // Récupérer les infos de l'utilisateur
    const [users] = await db.query(
      'SELECT AddresseEmail AS email, Nom AS nom FROM utilisateur WHERE Id = ?',
      [userId]
    );
    
    if (!users[0]) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const userEmail = users[0].email;
    const userName = users[0].nom;

    // Utiliser la fonction multi-vendeurs
    const paymentIntent = await paymentService.createOrderWithSubOrders(
      commandeId,
      userId,
      subOrders,
      userEmail,
      userName
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Multi-vendor payment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== NOUVEAU : VÉRIFIER STATUT D'UN PAYMENT INTENT =====
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      clientSecret: paymentIntent.client_secret,
      metadata: paymentIntent.metadata
    });
  } catch (error) {
    console.error('❌ Get payment status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== NOUVEAU : RÉCUPÉRER UN COMPTE CONNECT =====
export const getConnectedAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const account = await stripe.accounts.retrieve(accountId);
    
    res.json({
      id: account.id,
      email: account.email,
      business_type: account.business_type,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      status: account.charges_enabled && account.payouts_enabled ? 'verified' : 'pending'
    });
  } catch (error) {
    console.error('❌ Get connected account error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== NOUVEAU : REFRESH ONBOARDING LINK =====
export const refreshOnboardingLink = async (req, res) => {
  try {
    const { accountId, type } = req.params; // type = 'refuge' ou 'prestataire'
    const { refugeId, userId } = req.body;
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    let returnPath;
    if (type === 'refuge') {
      returnPath = `/refuge/${refugeId}/onboarding/success`;
    } else {
      returnPath = `/prestataire/onboarding/success`;
    }
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${frontendUrl}/onboarding/refresh`,
      return_url: `${frontendUrl}${returnPath}`,
      type: 'account_onboarding',
    });
    
    res.json({
      success: true,
      onboardingUrl: accountLink.url
    });
  } catch (error) {
    console.error('❌ Refresh onboarding link error:', error);
    res.status(500).json({ error: error.message });
  }
};