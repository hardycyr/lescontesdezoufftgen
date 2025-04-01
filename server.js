import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // facultatif
app.use(cors());
app.use(express.static("public")); // Met ton index.html dans /public

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
        user: "lescontesdezoufftgen@gmail.com", 
        pass: "autp bsid ntls irsr" 
    }
});

app.post("/create-checkout-session", async (req, res) => {
    console.log("📦 Body reçu :", req.body);

    const { cart, country } = req.body;

    if (!cart || !Array.isArray(cart)) {
        console.error("❌ Cart invalide :", cart);
        return res.status(400).json({ error: "Panier manquant ou invalide" });
      }

    try {
        const line_items = cart.map(item => ({
          price_data: {
            currency: "eur",
            product_data: {
              name: item.name
            },
            unit_amount: item.price
          },
          quantity: Math.min(item.quantity, 5)
        }));

        // 🧮 Calculer total d'articles
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    
        let shippingCost = 0;

        if (country === "FR") {
          shippingCost = totalQuantity <= 1 ? 900 : 1200; // 9€ ou 12€
        } else if (["UE"].includes(country)) {
          shippingCost = totalQuantity <= 1 ? 500 : 1000; // 5€ ou 10€
        } else {
            shippingCost = totalQuantity <= 1 ? 600 : 1200; // 6€ ou 12€ pour le reste du monde
        }

        // ➕ Ajouter les frais de port comme un article
        line_items.push({
            price_data: {
            currency: "eur",
            product_data: { name: `Frais de port (${country})` },
            unit_amount: shippingCost
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items,
          mode: "payment",  
          customer_creation: "always", // ← ✅ ajoute ceci
          shipping_address_collection: {
            allowed_countries: ["AC", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ",
  "CA", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CV", "CW", "CY", "CZ",
  "DE", "DJ", "DK", "DM", "DO", "DZ",
  "EC", "EE", "EG", "EH", "ER", "ES", "ET",
  "FI", "FJ", "FK", "FO", "FR",
  "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY",
  "HK", "HN", "HR", "HT", "HU",
  "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IS", "IT",
  "JE", "JM", "JO", "JP",
  "KE", "KG", "KH", "KI", "KM", "KN", "KR", "KW", "KY", "KZ",
  "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY",
  "MA", "MC", "MD", "ME", "MF", "MG", "MK", "ML", "MM", "MN", "MO", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ",
  "NA", "NC", "NE", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ",
  "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PY",
  "QA", "RE", "RO", "RS", "RU", "RW",
  "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SZ",
  "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ",
  "UA", "UG", "US", "UY", "UZ",
  "VA", "VC", "VE", "VG", "VN", "VU",
  "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW"]
          },
          success_url: "https://lescontesdezoufftgen.onrender.com/success.html",
          cancel_url: "https://lescontesdezoufftgen.onrender.com/cancel.html"
        });

        res.json({ url: session.url });
  } catch (error) {
    console.error("Erreur Stripe :", error.message);
    res.status(500).json({ error: "Échec de la création de la session." });
  }
});


app.post("/contact.html", async (req, res) => {
  console.log("📨 Requête contact reçue :", req.body);
  const { name, email, message, recaptcha } = req.body;

  if (!name || !email || !message || !recaptcha) {
    console.log("⛔ Champs manquants :", { name, email, message, recaptcha });
    return res.status(400).json({ success: false, message: "Champs manquants." });
  }

  // 🔍 Vérifie le captcha auprès de Google
  const captchaVerification = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${RECAPTCHA_SECRET_KEY}&response=${recaptcha}`
  });

  const captchaResult = await captchaVerification.json();

  if (!captchaResult.success) {
    return res.status(400).json({ success: false, message: "Échec de la vérification reCAPTCHA." });
  }

  // ✅ Si tout est bon, envoyer le mail
  const mailOptions = {
    from: email,
    to: "helene.ag@hotmail.com",
    subject: "Nouveau message depuis le site lescontesdezoufftgen.fr !",
    text: `Nom: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Votre message a bien été envoyé !" });
  } catch (error) {
    console.error("Erreur d'envoi :", error);
    res.status(500).json({ success: false, message: "Erreur lors de l'envoi du message." });
  }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/ping", (req, res) => {
    res.send("Pong! L'application est réveillée.");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur en ligne sur le port ${PORT}`));

async function envoyerEmailConfirmation(clientEmail, cart, country, total) {
  const itemsList = cart.map(item => `- ${item.name} x ${item.quantity}`).join("<br>");

  const mailOptions = {
    from: `"Les Contes de Zoufftgen" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: "Merci pour votre commande !",
    html: `
      <h2>🎉 Merci pour votre achat !</h2>
      <p>Voici le récapitulatif de votre commande :</p>
      <p>${itemsList}</p>
      <p><strong>Pays de livraison :</strong> ${country}</p>
      <p><strong>Total :</strong> ${(total / 100).toFixed(2)} €</p>
      <br>
      <p>Nous vous contacterons rapidement pour l'expédition !</p>
    `
  };

  await transporter.sendMail(mailOptions);
}
