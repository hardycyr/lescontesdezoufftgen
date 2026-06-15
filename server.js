import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
// URLs decommissionnees : on retourne un statut HTTP 410 (Gone) au lieu
// du 404 par defaut. Google desindexe plus vite avec un 410 (signifie
// "supprime definitivement") qu'avec un 404 (qu'il considere parfois
// comme temporaire). A declarer AVANT express.static pour intercepter
// la requete avant qu'elle ne tombe dans le 404 statique.
const goneUrls = [
  "/support.html",
  "/support-en.html",
  "/meslivres.html",
  "/monhistoire.html",
  "/mystory.html",
  "/presse.html",
  "/press.html",
  "/lectures.html",
  "/lectures-en.html",
];
goneUrls.forEach((url) => {
  app.get(url, (req, res) => {
    res.status(410).type("text/plain").send("410 Gone — cette page a été supprimée.");
  });
});

// Redirections 301 (permanentes) : anciennes URLs renommees -> nouvelle URL.
// A declarer AVANT express.static. Un 301 transmet le referencement
// (link equity) de l'ancienne page vers la nouvelle et evite les liens casses.
const redirects301 = {
  "/narrative-objects.html": "/story-objects.html",
};
Object.entries(redirects301).forEach(([from, to]) => {
  app.get(from, (req, res) => res.redirect(301, to));
});

app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

const brevoApiKey = process.env.BREVO_API_KEY;

const brevoEmailApi = new TransactionalEmailsApi();
// le SDK stocke la clé ici :
brevoEmailApi.authentications.apiKey.apiKey = brevoApiKey;

// expéditeur principal (doit exister/être validé dans Brevo)
const BREVO_SENDER_EMAIL =
  process.env.BREVO_SENDER_EMAIL || "contact@lescontesdezoufftgen.fr";
const BREVO_SENDER_NAME =
  process.env.BREVO_SENDER_NAME || "Les contes de Zoufftgen";

// ====================== STRIPE ======================

app.post("/create-checkout-session", async (req, res) => {
  console.log("📦 Body reçu :", req.body);

  const { cart, country, note_personnelle } = req.body;

  console.log("Note personnelle reçue:", note_personnelle);

  if (!cart || !Array.isArray(cart)) {
    console.error("❌ Cart invalide :", cart);
    return res.status(400).json({ error: "Panier manquant ou invalide" });
  }

  try {
    const line_items = cart.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price,
      },
      quantity: Math.min(item.quantity, 5),
    }));

    const totalQuantity = cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    let shippingCost = 0;

    if (country === "FR") {
      shippingCost = totalQuantity <= 1 ? 650 : 1000;
    } else if (["LU"].includes(country)) {
      shippingCost = totalQuantity <= 1 ? 400 : 700;
    } else if (["UE"].includes(country)) {
      shippingCost = totalQuantity <= 1 ? 700 : 1300;
    } else {
      shippingCost = totalQuantity <= 1 ? 900 : 4000;
    }

    line_items.push({
      price_data: {
        currency: "eur",
        product_data: { name: `Frais de port (${country})` },
        unit_amount: shippingCost,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_creation: "always",
      shipping_address_collection: {
        allowed_countries: [
          "AC","AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AT","AU","AW","AX","AZ",
          "BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS","BT","BV","BW","BY","BZ",
          "CA","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CV","CW","CY","CZ",
          "DE","DJ","DK","DM","DO","DZ",
          "EC","EE","EG","EH","ER","ES","ET",
          "FI","FJ","FK","FO","FR",
          "GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY",
          "HK","HN","HR","HT","HU",
          "ID","IE","IL","IM","IN","IO","IQ","IS","IT",
          "JE","JM","JO","JP",
          "KE","KG","KH","KI","KM","KN","KR","KW","KY","KZ",
          "LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY",
          "MA","MC","MD","ME","MF","MG","MK","ML","MM","MN","MO","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ",
          "NA","NC","NE","NG","NI","NL","NO","NP","NR","NU","NZ",
          "OM","PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PY",
          "QA","RE","RO","RS","RU","RW",
          "SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SZ",
          "TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ",
          "UA","UG","US","UY","UZ",
          "VA","VC","VE","VG","VN","VU",
          "WF","WS","XK","YE","YT","ZA","ZM","ZW"
        ],
      },
      success_url: "https://www.lescontesdezoufftgen.com/success.html",
      cancel_url: "https://www.lescontesdezoufftgen.com/cancel.html",
      metadata: {
        note_personnelle: note_personnelle || "Aucune note",
        cart_items_count: cart.length,
      },
    });

    console.log("✅ Session Stripe créée :", session);

    res.json({ url: session.url });
  } catch (error) {
    console.error("Erreur Stripe :", error.message);
    res.status(500).json({ error: "Échec de la création de la session." });
  }
});

// ====================== CONTACT ======================

app.post("/contact.html", async (req, res) => {
  console.log("📨 Requête contact reçue :", req.body);

  const { name, email, message } = req.body;
  const recaptcha = req.body.recaptcha || req.body["g-recaptcha-response"];

  if (!name || !email || !message || !recaptcha) {
    console.log("⛔ Champs manquants :", { name, email, message, recaptcha });
    return res
      .status(400)
      .json({ success: false, message: "Champs manquants." });
  }

  // 🔍 Vérifie le captcha auprès de Google
  try {
    const captchaVerification = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${RECAPTCHA_SECRET_KEY}&response=${recaptcha}`,
      }
    );

    const captchaResult = await captchaVerification.json();
    console.log("✅ Réponse reCAPTCHA :", captchaResult);

    if (!captchaResult.success) {
      console.log("⛔ Échec reCAPTCHA :", captchaResult["error-codes"]);
      return res.status(400).json({
        success: false,
        message: "Échec de la vérification reCAPTCHA.",
      });
    }
  } catch (err) {
    console.error("Erreur lors de l'appel reCAPTCHA :", err);
    return res.status(500).json({
      success: false,
      message:
        "Erreur lors de la vérification reCAPTCHA. Veuillez réessayer plus tard.",
    });
  }

  // ✅ Construction du mail Brevo
  try {
    const sendSmtpEmail = new SendSmtpEmail();

    // L’expéditeur doit être une adresse validée dans Brevo
    sendSmtpEmail.sender = {
      name: "Les Contes de Zoufftgen",
      email: "contact@lescontesdezoufftgen.com", 
    };

    // Destinataire : ton adresse perso
    sendSmtpEmail.to = [
      {
        email: "helene.ag@hotmail.com",
        name: "Hélène Hardy",
      },
      {
        email: "cyrille.hardy@gmail.com",
        name: "Cyrille Hardy",
      },
      {
        email: "lescontesdezoufftgen@gmail.com",
        name: "Les Contes de Zoufftgen",
      }
    ];

    sendSmtpEmail.replyTo = {
      email,
      name,
    };

    sendSmtpEmail.subject = "Nouveau message depuis le site lescontesdezoufftgen.com";
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h2>Nouveau message depuis le formulaire de contact</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Message :</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        </body>
      </html>
    `;

    const brevoResponse = await brevoEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log("✅ E-mail envoyé avec succès via Brevo :", brevoResponse);

    return res.json({
      success: true,
      message: "Votre message a bien été envoyé !",
    });
  } catch (error) {
    console.error("Erreur d'envoi via Brevo :", error);
    return res.status(500).json({
      success: false,
      message:
        "Erreur lors de l'envoi du message. Vous pouvez aussi écrire directement à helene.ag@hotmail.com.",
    });
  }
});


// ====================== SERVEUR ======================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Serveur en ligne sur le port ${PORT}`)
);

// ====================== OPTIONNEL : confirmation commande ======================

async function envoyerEmailConfirmation(clientEmail, cart, country, total) {
  const itemsList = cart
    .map((item) => `- ${item.name} x ${item.quantity}`)
    .join("<br>");

  try {
    const resBrevo = await brevoEmailApi.sendTransacEmail({
      sender: {
        email: BREVO_SENDER_EMAIL,
        name: BREVO_SENDER_NAME,
      },
      to: [{ email: clientEmail }],
      subject: "Merci pour votre commande !",
      htmlContent: `
        <h2>🎉 Merci pour votre achat !</h2>
        <p>Voici le récapitulatif de votre commande :</p>
        <p>${itemsList}</p>
        <p><strong>Pays de livraison :</strong> ${country}</p>
        <p><strong>Total :</strong> ${(total / 100).toFixed(2)} €</p>
        <br>
        <p>Nous vous contacterons rapidement pour l'expédition !</p>
      `,
    });

    console.log(
      "✅ E-mail de confirmation envoyé :",
      resBrevo?.body?.messageId || resBrevo
    );
  } catch (error) {
    console.error(
      "Erreur d'envoi de l'e-mail de confirmation via Brevo :",
      error?.response?.body || error
    );
  }
}
