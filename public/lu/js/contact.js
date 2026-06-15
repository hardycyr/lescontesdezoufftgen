document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const responseMessage = document.getElementById('responseMessage');

  if (!form) {
    console.error('Kontaktformulaire net fonnt (#contactForm)');
    return;
  }

  // Mir benotzen d'URL aus dem action-Attribut vum <form>
  const CONTACT_API_URL =
    form.action || 'https://lescontesdezoufftgen.onrender.com/contact.html';

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // mir blockéieren den normalen HTML-Versand

    responseMessage.style.display = 'none';
    responseMessage.textContent = '';

    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();

    if (!name || !email || !message) {
      responseMessage.textContent = 'Wann ech glift fëllt all Felder aus.';
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
          responseMessage.textContent =
            'Wann ech glift kräizt d’Këscht « Ech sinn keen Roboter » un.';
          responseMessage.style.display = 'block';
          responseMessage.style.color = 'red';
          return;
        }
      } else {
        console.warn('grecaptcha net disponibel');
      }
    } catch (e) {
      console.warn('Feeler beim Lueden vum reCAPTCHA-Token:', e);
    }

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
        throw new Error(data?.message || 'Äntwert net OK: ' + response.status);
      }

      responseMessage.textContent =
        data.message || 'Merci! Är Noricht gouf gutt verschéckt.';
      responseMessage.style.display = 'block';
      responseMessage.style.color = 'green';

      form.reset();
      try {
        if (typeof grecaptcha !== 'undefined') {
          grecaptcha.reset();
        }
      } catch (e) {}
    } catch (error) {
      console.error('Feeler beim Verschécken vum Formulaire:', error);
      responseMessage.textContent =
        error?.message ||
        'Pardon, et ass e Feeler opgetrueden. Dir kënnt mir och direkt op helene.ag@hotmail.com schreiwen.';
      responseMessage.style.display = 'block';
      responseMessage.style.color = 'red';
    }
  });
});
