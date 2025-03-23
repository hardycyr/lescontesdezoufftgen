const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const cors = require("cors");
const nodemailer = require("nodemailer");
const app = express();

const transporter = nodemailer.createTransport({
    service: "gmail", // Utilise Gmail, Outlook ou autre
    auth: {
        user: "lescontesdezoufftgen@gmail.com", // Remplace par ton adresse email
        pass: "7cpxapb7+" // Remplace par ton mot de passe ou App Password
    }
});

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

    const mailOptions = {
        from: email,
        to: "cyrille.hardy@gmail.com", // Remplace par ton adresse
        subject: "Nouveau message depuis le site lescontesdezoufftgen.fr !",
        text: `Nom: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "Email envoyé avec succès !" });
    } catch (error) {
        console.error("Erreur d'envoi :", error);
        res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
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
