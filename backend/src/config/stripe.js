import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia', // Dernière version stable
  appInfo: {
    name: 'Adopty',
    version: '1.0.0',
  },
});

export default stripe;