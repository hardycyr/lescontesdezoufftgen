// Lightbox pour les images des blocs univers/universe.
// Au clic sur une image de .universe-bloc, ouvre une fenetre modale
// avec l'image en taille reelle. Ferme par bouton, clic exterieur ou Escape.

(function () {
  function injectStyles() {
    if (document.getElementById('image-modal-styles')) return;
    const css = `
      .image-modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.88);
        z-index: 9999;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        cursor: zoom-out;
      }
      .image-modal.open { display: flex; }
      .image-modal-img {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        display: block;
        border-radius: 4px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        cursor: default;
      }
      .image-modal-close {
        position: absolute;
        top: 1rem;
        right: 1.5rem;
        background: transparent;
        border: none;
        color: white;
        font-size: 2.5rem;
        line-height: 1;
        cursor: pointer;
        padding: 0;
        width: 2.5rem;
        height: 2.5rem;
      }
      .image-modal-close:hover { color: #C9A35A; }
    `;
    const style = document.createElement('style');
    style.id = 'image-modal-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function init() {
    const imgs = document.querySelectorAll('.universe-bloc img');
    if (imgs.length === 0) return;

    injectStyles();

    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML =
      '<button type="button" class="image-modal-close" aria-label="Fermer">&times;</button>' +
      '<img class="image-modal-img" src="" alt="" />';
    document.body.appendChild(modal);

    const modalImg = modal.querySelector('.image-modal-img');
    const closeBtn = modal.querySelector('.image-modal-close');

    function open(img) {
      modalImg.src = img.currentSrc || img.src;
      modalImg.alt = img.alt || '';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(function () { modalImg.src = ''; }, 200);
    }

    imgs.forEach(function (img) {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function () { open(img); });
    });

    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
