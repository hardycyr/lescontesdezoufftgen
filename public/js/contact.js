document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const responseMessage = document.getElementById("responseMessage");
  const submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async function(event) {
    event.preventDefault();
    submitBtn.disabled = true;
    const recaptcha = grecaptcha.getResponse();

    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value,
      recaptcha: recaptcha
    };

    if (!formData.recaptcha) {
      responseMessage.style.color = "red";
      responseMessage.textContent = "Veuillez valider le reCAPTCHA.";
      responseMessage.style.display = "block";
      submitBtn.disabled = false;
      return;
    }

    try {
      const response = await fetch("/contact.html", {
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
    setTimeout(() => submitBtn.disabled = false, 3000);
  });
});
