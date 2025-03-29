import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

// Initialisation de Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Création de la session Checkout
app.post('/create-checkout-session', async (req, res) => {
  const { cart, country } = req.body;

  if (!cart || !Array.isArray(cart)) {
    return res.status(400).json({ error: 'Panier invalide' });
  }

  try {
    // Création des éléments du panier (produits)
    const line_items = cart.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name
        },
        unit_amount: item.price,
      },
      quantity: Math.min(item.quantity, 2) // Limite la quantité à 2 pour chaque article
    }));

    // Calcul des frais de port en fonction du pays
    let shippingCost = 0;
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (country === 'FR') {
      shippingCost = totalQuantity <= 1 ? 400 : 600;
    } else if (['BE', 'CH'].includes(country)) {
      shippingCost = totalQuantity <= 1 ? 700 : 1000;
    } else {
      shippingCost = 1500; // Autres pays
    }

    // Ajouter les frais de port comme un article supplémentaire
    line_items.push({
      price_data: {
        currency: 'eur',
        product_data: { name: `Frais de port (${country})` },
        unit_amount: shippingCost,
      },
      quantity: 1
    });

    // Création de la session Checkout Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://lescontesdezoufftgen.onrender.com/success.html',
      cancel_url: 'https://lescontesdezoufftgen.onrender.com/cancel.html',
      // Stripe affiche automatiquement un champ e-mail si celui-ci n'est pas défini
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("Erreur Stripe:", err.message);
    res.status(500).json({ error: "Erreur serveur Stripe" });
  }
});

// Lancement du serveur sur le port défini
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});
