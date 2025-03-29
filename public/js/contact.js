document.getElementById("contactForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Empêcher le rechargement de la page

    const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value
    };

    const responseMessage = document.getElementById("responseMessage");

    try {
        const response = await fetch("https://lescontesdezoufftgen.onrender.com", { // Change l’URL si nécessaire
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (data.success) {
            responseMessage.style.color = "green";
            responseMessage.textContent = data.message;
        } else {
            responseMessage.style.color = "red";
            responseMessage.textContent = "Erreur lors de l'envoi du message.";
        }
    } catch (error) {
        responseMessage.style.color = "red";
        responseMessage.textContent = "Erreur de connexion avec le serveur.";
    }

    responseMessage.style.display = "block"; // Afficher le message
});