import { Router } from "express";
import * as stripeController from "../controlleurs/stripe.controlleur.js";
import * as connectService from "../services/stripe/connect.service.js";
import express from 'express';  // ← AJOUTE CETTE LIGNE

const router = Router();

router.use((req, res, next) => {
  console.log(`🔵 ${req.method} ${req.originalUrl}`);
  next();
});

// webhook (doit être avant express.json())
//router.post("/webhook", express.raw({ type: 'application/json' }), stripeController.webhook);

// customers
router.post("/customer", stripeController.createCustomer);
/*router.post("/customer", (req, res) => {
  console.log("🔵 La route /customer est atteinte !");
  res.json({ message: "Route atteinte" });
});*/

// connect
router.post("/connect/refuge/:refugeId", stripeController.createRefugeAccount);
router.post("/connect/prestataire/:userId", stripeController.createPrestataireAccount);
router.get("/connect/status/:accountId", stripeController.getAccountStatus);

// payments - single vendor
router.post("/payment/product", stripeController.payProduct);
router.post("/payment/service", stripeController.payService);

// ✅ NOUVEAU : payment multi-vendeurs
router.post("/payment/multi-vendor", stripeController.payMultiVendorOrder);

// ✅ NOUVEAU : vérifier le statut d'un payment intent
router.get("/payment/status/:paymentIntentId", stripeController.getPaymentStatus);

// ✅ NOUVEAU : récupérer les infos du compte connecté
router.get("/connect/account/:accountId", stripeController.getConnectedAccount);

router.get("/", (req,res) => {
  return res.status(200).json({message: "oui ca fonctionne"})
})

// routes/stripe.routes.js
router.post("/setup-refuge/:refugeId", async (req, res) => {
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
    console.error('❌ Setup refuge error:', error);
    res.status(500).json({ error: error.message });
  }
});

// routes/stripe.routes.js
router.post("/refresh/refuge/:refugeId", async (req, res) => {
  try {
    const { refugeId } = req.params;
    
    // Récupérer le stripeAccountId du refuge
    const [refuge] = await db.query(
      'SELECT stripeAccountId FROM refuge WHERE Id = ?',
      [refugeId]
    );
    
    if (!refuge[0]?.stripeAccountId) {
      throw new Error("Refuge n'a pas de compte Stripe");
    }
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Créer un nouveau compte link
    const accountLink = await stripe.accountLinks.create({
      account: refuge[0].stripeAccountId,
      refresh_url: `${frontendUrl}/onboarding/refresh`,
      return_url: `${frontendUrl}/refuge/${refugeId}/onboarding/success`,
      type: 'account_onboarding',
    });
    
    res.json({ onboardingUrl: accountLink.url });
    console.log(accountLink.url)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;