document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const responseMessage = document.getElementById('responseMessage');

  if (!form) {
    console.error('Formulaire de contact introuvable (#contactForm)');
    return;
  }

  // 👉 URL de ton backend Render + bonne route
  const CONTACT_API_URL = 'https://lescontesdezoufftgen.onrender.com/contact.html';

  form.addEventListener('submit', async (event) => {
    // On intercepte pour gérer l'affichage, mais on garde action/method comme secours
    event.preventDefault();

    responseMessage.style.display = 'none';
    responseMessage.textContent = '';

    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();

    if (!name || !email || !message) {
      responseMessage.textContent = 'Merci de remplir tous les champs.';
      responseMessage.style.display = 'block';
      responseMessage.style.color = 'red';
      return;
    }

    // reCAPTCHA v2
    let recaptchaToken = null;
    try {
      if (typeof grecaptcha !== 'undefined') {
        recaptchaToken = grecaptcha.getResponse();
        if (!recaptchaToken) {
          responseMessage.textContent = 'Merci de cocher la case « Je ne suis pas un robot ».';
          responseMessage.style.display = 'block';
          responseMessage.style.color = 'red';
          return;
        }
      } else {
        console.warn('grecaptcha non disponible');
      }
    } catch (e) {
      console.warn('Erreur lors de la récupération du token reCAPTCHA :', e);
    }

    // Payload attendu par ton serveur : name, email, message, recaptcha
    const payload = {
      name,
      email,
      message,
      recaptcha: recaptchaToken,
    };

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Réponse non OK : ' + response.status);
      }

      responseMessage.textContent = data.message || 'Merci ! Votre message a bien été envoyé.';
      responseMessage.style.display = 'block';
      responseMessage.style.color = 'green';

      form.reset();
      try {
        if (typeof grecaptcha !== 'undefined') {
          grecaptcha.reset();
        }
      } catch (e) {}
    } catch (error) {
      console.error('Erreur lors de l’envoi du formulaire :', error);

      // ⬇️ En cas d’erreur JS/fetch, on tente un submit classique en fallback
      try {
        form.submit();
      } catch {
        responseMessage.textContent =
          'Désolé, une erreur est survenue. Vous pouvez aussi m’écrire directement à helene.ag@hotmail.com.';
        responseMessage.style.display = 'block';
        responseMessage.style.color = 'red';
      }
    }
  });
});
