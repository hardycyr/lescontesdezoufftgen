document.getElementById("contactForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Empêche le rechargement

    const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value,
        recaptcha: grecaptcha.getResponse() // 🔥 très important
    };

    const responseMessage = document.getElementById("responseMessage");

    try {
        const response = await fetch("https://lescontesdezoufftgen.onrender.com", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            responseMessage.style.color = "green";
            responseMessage.textContent = data.message;
            grecaptcha.reset(); // 🔁 Réinitialise le CAPTCHA
            this.reset(); // 🔁 Vide les champs du formulaire
        } else {
            responseMessage.style.color = "red";
            responseMessage.textContent = data.message;
        }
    } catch (error) {
        responseMessage.style.color = "red";
        responseMessage.textContent = "Erreur de connexion avec le serveur.";
    }

    responseMessage.style.display = "block";
});
