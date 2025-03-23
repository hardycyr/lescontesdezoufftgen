const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const cors = require("cors");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
//app.use(bodyParser({ extended: true }));
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

    const data = await response.json();

    if (!data.success) {
        return res.status(400).json({ message: "CAPTCHA invalide." });
    }

    // Simuler l'envoi d'email (remplace par un vrai service)
    console.log(`📩 Message reçu de ${name} (${email}): ${message}`);

    res.json({ message: "Message envoyé avec succès !" });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/ping", (req, res) => {
    res.send("Pong! L'application est réveillée.");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur en ligne sur le port ${PORT}`));
