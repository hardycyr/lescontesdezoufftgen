document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
  
    form.addEventListener("submit", async function(event) {
      event.preventDefault(); // 🔒 Stoppe le submit HTML classique
  
      const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value,
        recaptcha: grecaptcha.getResponse()
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
          form.reset();
          grecaptcha.reset();
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
  });

const submitBtn = form.querySelector("button");
submitBtn.disabled = true;
setTimeout(() => submitBtn.disabled = false, 3000);
