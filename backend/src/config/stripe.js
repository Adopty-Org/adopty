import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required environment variable: STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia', // Dernière version stable
  appInfo: {
    name: 'Adopty',
    version: '1.0.0',
  },
});

const generateLink = async () => {
  try {
    const accountId = 'acct_1TVEFqLsY3beREJV';
    const frontendUrl = 'http://localhost:5173';
    
    console.log('🔗 Génération du lien d\'onboarding...');
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${frontendUrl}/onboarding/refresh`,
      return_url: `${frontendUrl}/refuge/1/onboarding/success`,
      type: 'account_onboarding',
    });
    
    console.log('\n✅ Lien généré !\n');
    console.log('=' .repeat(80));
    console.log(accountLink.url);
    console.log('=' .repeat(80));
    console.log('\n📋 Copie cette URL et colle-la dans ton navigateur\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.message.includes('No such account')) {
      console.log('\n⚠️ Le compte Stripe n\'existe pas ou a été supprimé.');
      console.log('Il faut recréer un compte avec /setup-refuge/1');
    }
  }
};

generateLink();

export default stripe;