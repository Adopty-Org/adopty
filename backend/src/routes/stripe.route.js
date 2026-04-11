/*import express from 'express';
import stripe from '../config/stripe.js';
import { handleWebhook } from '../services/stripe/webhook.service.js';
import { db } from '../config/db.js';

const router = express.Router();

// ========== WEBHOOK ==========
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
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
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// ========== CUSTOMERS ==========
router.post('/customer', async (req, res) => {
  try {
    const { userId, email, name } = req.body;
    
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: { userId: userId.toString() },
    });
    
    await db.query(
      'UPDATE utilisateur SET stripeCustomerId = ? WHERE Id = ?',
      [customer.id, userId]
    );
    
    res.json({ success: true, customerId: customer.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== COMPTES CONNECT - REFUGE ==========
router.post('/connect/refuge/:refugeId', async (req, res) => {
  try {
    const { refugeId } = req.params;
    const { email, name } = req.body;
    
    console.log(`🏠 Création compte refuge ${refugeId} pour ${email}`);
    
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
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${frontendUrl}/refuge/${refugeId}/onboarding/refresh`,
      return_url: `${frontendUrl}/refuge/${refugeId}/onboarding/success`,
      type: 'account_onboarding',
    });
    
    res.json({ 
      success: true, 
      accountId: account.id,
      onboardingUrl: accountLink.url 
    });
  } catch (error) {
    console.error('❌ Erreur création compte refuge:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== COMPTES CONNECT - PRESTATAIRE ==========
router.post('/connect/prestataire/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, name } = req.body;
    
    console.log(`👤 Création compte prestataire ${userId} pour ${email}`);
    
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
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${frontendUrl}/prestataire/onboarding/refresh`,
      return_url: `${frontendUrl}/prestataire/onboarding/success`,
      type: 'account_onboarding',
    });
    
    res.json({ 
      success: true, 
      accountId: account.id,
      onboardingUrl: accountLink.url 
    });
  } catch (error) {
    console.error('❌ Erreur création compte prestataire:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== VÉRIFIER STATUT COMPTE ==========
router.get('/connect/status/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const account = await stripe.accounts.retrieve(accountId);
    
    res.json({
      status: account.charges_enabled && account.payouts_enabled ? 'verified' : 'pending',
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
// ========== PAIEMENTS ==========
router.post('/payment/product', async (req, res) => {
  try {
    const { commandeId, userId, totalAmount } = req.body;
    
    console.log(`💰 Paiement produit: commande=${commandeId}, user=${userId}, montant=${totalAmount}`);
    
    // ✅ BONNE SYNTAXE pour mysql2/promise
    const [rows] = await db.query(
      'SELECT stripeCustomerId FROM utilisateur WHERE Id = ?',
      [userId]
    );
    
    if (!rows || rows.length === 0 || !rows[0]?.stripeCustomerId) {
      throw new Error(`Utilisateur ${userId} pas encore configuré pour Stripe`);
    }
    
    const customerId = rows[0].stripeCustomerId;
    const amountInCents = Math.round(totalAmount * 100);
    const platformFee = Math.round(amountInCents * 0.10); // 10% commission
    
    console.log(`💳 Création payment intent: customer=${customerId}, amount=${amountInCents}c`);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      customer: customerId,
      payment_method_types: ['card'],
      //application_fee_amount: platformFee,
      transfer_group: `order_${commandeId}_${Date.now()}`,
      metadata: {
        commandeId: commandeId.toString(),
        type: 'product_order',
      },
    });
    
    const [result] = await db.query(
      `INSERT INTO paiement_commande 
       (IdCommande, Montant, Statut, stripe_payment_intent_id, applicationFeeAmount)
       VALUES (?, ?, 1, ?, ?)`,
      [commandeId, totalAmount, paymentIntent.id, platformFee / 100]
    );
    
    console.log(`✅ Payment intent créé: ${paymentIntent.id}`);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('❌ Erreur paiement produit:', error);
    res.status(500).json({ error: error.message });
  }
});*
import { createCommande } from '../database/commande.db.js';  // ← Ajoute cet import

router.post('/payment/product', async (req, res) => {
  try {
    const { commandeId, userId, totalAmount } = req.body;
    
    console.log(`💰 Paiement produit: commandeId proposé=${commandeId}, user=${userId}, montant=${totalAmount}`);
    
    // 1. Récupérer le customer Stripe
    const [rows] = await db.query(
      'SELECT stripeCustomerId FROM utilisateur WHERE Id = ?',
      [userId]
    );
    
    if (!rows || rows.length === 0 || !rows[0]?.stripeCustomerId) {
      throw new Error(`Utilisateur ${userId} pas encore configuré pour Stripe`);
    }
    
    // 2. Créer la commande (l'ID est généré automatiquement)
    const newCommandeId = await createCommande({
      IdUtilisateur: userId,
      Statut: 1  // Statut "en attente" par exemple
    });
    
    console.log(`📦 Nouvelle commande créée avec ID: ${newCommandeId}`);
    
    const customerId = rows[0].stripeCustomerId;
    const amountInCents = Math.round(totalAmount * 100);
    
    // 3. Créer le PaymentIntent Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      customer: customerId,
      payment_method_types: ['card'],
      metadata: {
        commandeId: newCommandeId.toString(),
        type: 'product_order',
      },
    });
    
    // 4. Sauvegarder dans paiement_commande
    await db.query(
      `INSERT INTO paiement_commande 
       (IdCommande, Montant, Statut, stripe_payment_intent_id)
       VALUES (?, ?, 1, ?)`,
      [newCommandeId, totalAmount, paymentIntent.id]
    );
    
    console.log(`✅ Payment intent créé: ${paymentIntent.id}`);
    res.json({ 
      clientSecret: paymentIntent.client_secret,
      commandeId: newCommandeId 
    });
  } catch (error) {
    console.error('❌ Erreur paiement produit:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/payment/service', async (req, res) => {
  try {
    const { reservationId, userId, profilId, amount } = req.body;
    
    // ✅ BONNE SYNTAXE
    const [userRows] = await db.query(
      'SELECT stripeCustomerId FROM utilisateur WHERE Id = ?',
      [userId]
    );
    
    const [profilRows] = await db.query(
      `SELECT u.stripeAccountId 
       FROM profil_prestataire p 
       JOIN utilisateur u ON p.IdUtilisateur = u.Id 
       WHERE p.Id = ?`,
      [profilId]
    );
    
    if (!userRows || userRows.length === 0 || !userRows[0]?.stripeCustomerId) {
      throw new Error(`Utilisateur ${userId} pas encore configuré pour Stripe`);
    }
    
    if (!profilRows || profilRows.length === 0 || !profilRows[0]?.stripeAccountId) {
      throw new Error(`Prestataire profil ${profilId} pas encore configuré pour recevoir des paiements`);
    }
    
    const customerId = userRows[0].stripeCustomerId;
    const destinationId = profilRows[0].stripeAccountId;
    const amountInCents = Math.round(amount * 100);
    const platformFee = Math.round(amountInCents * 0.10);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      customer: customerId,
      payment_method_types: ['card'],
      transfer_data: {
        destination: destinationId,
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
      [reservationId, profilId, amount, paymentIntent.id, destinationId, platformFee / 100]
    );
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('❌ Erreur paiement service:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ROUTE TEST ==========
router.get('/test', (req, res) => {
  res.json({ message: 'Stripe routes are working!' });
});

export default router;*/

import { Router } from "express";
import * as stripeController from "../controlleurs/stripe.controlleur.js";

const router = Router();

// webhook
router.post("/webhook", stripeController.webhook);

// customers
router.post("/customer", stripeController.createCustomer);

// connect
router.post("/connect/refuge/:refugeId", stripeController.createRefugeAccount);
router.post("/connect/prestataire/:userId", stripeController.createPrestataireAccount);
router.get("/connect/status/:accountId", stripeController.getAccountStatus);

// payments
router.post("/payment/product", stripeController.payProduct);
router.post("/payment/service", stripeController.payService);

export default router; 