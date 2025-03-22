const express = require("express");
const path = require("path");
const app = express();

app.use(express.static("public")); // Met ton index.html dans /public

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/ping", (req, res) => {
    res.send("Pong! L'application est réveillée.");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur en ligne sur le port ${PORT}`));
