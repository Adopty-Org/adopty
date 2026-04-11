import stripe from '../config/stripe.js';

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

export const createCustomer = async (req, res) => {
  try {
    const { userId, email, name } = req.body;

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { userId: userId.toString() },
    });

    const { db } = await import('../config/db.js');

    await db.query(
      'UPDATE utilisateur SET stripeCustomerId = ? WHERE Id = ?',
      [customer.id, userId]
    );

    res.json({
      success: true,
      customerId: customer.id
    });

  } catch (error) {
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
    res.status(500).json({ error: error.message });
  }
};


// ===== PAYMENT PRODUIT =====
export const payProduct = async (req, res) => {
  try {
    const { commandeId, userId, totalAmount } = req.body;

    const paymentIntent =
      await paymentService.createProductPaymentIntent(
        commandeId,
        userId,
        totalAmount
      );

    res.json({
        clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ===== PAYMENT SERVICE =====
export const payService = async (req, res) => {
  try {
    const { reservationId, userId, profilId, amount } = req.body;

    const paymentIntent =
      await paymentService.createServicePaymentIntent(
        reservationId,
        userId,
        //profilId,
        amount
      );

    res.json({
        clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};