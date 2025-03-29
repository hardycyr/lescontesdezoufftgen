import fetch from "node-fetch";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
        user: "lescontesdezoufftgen@gmail.com", 
        pass: "autp bsid ntls irsr" 
    }
});

app.post("/create-checkout-session", async (req, res) => {
    console.log("Body reçu :", req.body);
    const { cart } = req.body;

    try {
        const line_items = cart.map(item => ({
          price_data: {
            currency: "eur",
            product_data: {
              name: item.name
            },
            unit_amount: item.price
          },
          quantity: item.quantity
        }));
    
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items,
          mode: "payment",
          shipping_address_collection: {
            allowed_countries: ["FR", "BE", "CH"]
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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // Met ton index.html dans /public

const SECRET_KEY = "6Lccxf0qAAAAAFv6yptMn6R4WqZq58b0XFI2XlwH"; // Remplace par ta clé secrète reCAPTCHA

app.post("/", async (req, res) => {
    const { name, email, message, recaptcha } = req.body;

    // Vérifier le reCAPTCHA avec Google
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${SECRET_KEY}&response=${recaptcha}`
    });

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
