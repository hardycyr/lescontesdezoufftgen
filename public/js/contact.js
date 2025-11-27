document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const responseMessage = document.getElementById('responseMessage');

  if (!form) {
    console.error('Formulaire de contact introuvable (#contactForm)');
    return;
  }

  // ⚠️ À adapter si ton backend a une autre URL
  const CONTACT_API_URL = '/api/contact';

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // on bloque l’envoi classique HTML

    responseMessage.style.display = 'none';
    responseMessage.textContent = '';

    // 1) Vérifier les champs obligatoires rapidement
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();

    if (!name || !email || !message) {
      responseMessage.textContent = 'Merci de remplir tous les champs.';
      responseMessage.style.display = 'block';
      responseMessage.style.color = 'red';
      return;
    }

    // 2) Vérifier le reCAPTCHA (v2)
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

    // 3) Préparer les données à envoyer au backend Node
    const payload = {
      name,
      email,
      message,
      recaptchaToken, // ton backend le vérifiera côté serveur
    };

    // 4) Appel à l’API Node
    try {
      const response = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Réponse non OK : ' + response.status);
      }

      // Optionnel : lire la réponse JSON ou texte
      // const data = await response.json();

      responseMessage.textContent = 'Merci ! Votre message a bien été envoyé.';
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
      responseMessage.textContent =
        'Désolé, une erreur est survenue. Vous pouvez aussi m’écrire directement à votre adresse e-mail.';
      responseMessage.style.display = 'block';
      responseMessage.style.color = 'red';
    }
  });
});
