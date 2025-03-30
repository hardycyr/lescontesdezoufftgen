// -------------------
// 🧠 Fonctions utilitaires
// -------------------
function getPanier() {
  return JSON.parse(localStorage.getItem("panier") || "[]");
}

function savePanier(panier) {
  localStorage.setItem("panier", JSON.stringify(panier));
}

function updatePanierCompteur() {
  const compteur = document.getElementById("panier-compteur");
  if (!compteur) return;

  const panier = getPanier();
  const totalArticles = panier.reduce((sum, item) => sum + item.quantity, 0);

  compteur.textContent = totalArticles > 0 ? `(${totalArticles})` : "";
  compteur.style.display = "inline";
}

// -------------------
// ➕ Ajout depuis page accueil / boutique
// -------------------
function initialiserBoutonsAjouter() {
  const boutons = document.querySelectorAll(".btn-panier");
  if (!boutons.length) return;

  boutons.forEach(bouton => {
    bouton.addEventListener("click", (e) => {
      e.preventDefault();

      const id = bouton.dataset.id;
      const name = bouton.dataset.nom;
      const price = parseInt(bouton.dataset.prix, 10);

      const panier = getPanier();
      const existant = panier.find(item => item.id === id);

      if (existant) {
        existant.quantity += 1;
      } else {
        panier.push({ id, name, price, quantity: 1 });
      }

      savePanier(panier);
      updatePanierCompteur();
      setTimeout(() => {
        window.location.href = "/boutique/panier.html";
      }, 1000);
      //window.location.href = "/boutique/panier.html";
      //alert(`✅ "${name}" ajouté au panier.`);
    });
  });
}

// -------------------
// 🛒 Affichage panier
// -------------------
function afficherPanier() {
  const tbody = document.getElementById("liste-panier");
  const totalElt = document.getElementById("total-produits");
  const boutonPayer = document.getElementById("payer");

  if (!tbody || !totalElt || !boutonPayer) return;

  const panier = getPanier();
  let totalGeneral = 0;

  if (panier.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">Votre panier est vide.</td></tr>`;
    boutonPayer.style.display = "none";
    return;
  }

  panier.forEach((item, index) => {
    const ligne = document.createElement("tr");
    const total = item.price * item.quantity;
    totalGeneral += total;

    ligne.innerHTML = `
      <td>${item.name}</td>
      <td>${(item.price / 100).toFixed(2)} €</td>
      <td><input type="number" min="1" value="${item.quantity}" onchange="changerQuantite(${index}, this.value)" /></td>
      <td>${(total / 100).toFixed(2)} €</td>
      <td><button class="btn-supprimer" onclick="supprimerArticle(${index})">❌</button></td>
    `;
    tbody.appendChild(ligne);
  });

  totalElt.textContent = (totalGeneral / 100).toFixed(2);
}

// -------------------
// 🧾 Frais de port & total
// -------------------
function mettreAJourFraisEtTotal() {
  const panier = getPanier();
  const pays = document.getElementById("pays")?.value;
  if (!pays) return;

  const totalProduitsSpan = document.getElementById("total-produits");
  const fraisPortSpan = document.getElementById("frais-port");
  const totalGeneralSpan = document.getElementById("total-general");
  const paysLabel = document.getElementById("pays-label");

  let totalProduits = 0;
  let totalQuantite = 0;

  panier.forEach(item => {
    totalProduits += item.price * item.quantity;
    totalQuantite += item.quantity;
  });

  const frais = calculerFraisDePort(pays, totalQuantite);
  const total = totalProduits + frais;


  if (totalProduitsSpan) totalProduitsSpan.textContent = (totalProduits / 100).toFixed(2);
  if (fraisPortSpan)     fraisPortSpan.textContent = (frais / 100).toFixed(2);
  if (totalGeneralSpan)  totalGeneralSpan.textContent = (total / 100).toFixed(2);
  if (paysLabel)         paysLabel.textContent = pays;
  totalProduitsSpan.textContent = (totalProduits / 100).toFixed(2);
  fraisPortSpan.textContent = (frais / 100).toFixed(2);
  totalGeneralSpan.textContent = (total / 100).toFixed(2);
  paysLabel.textContent = pays;
}

function calculerFraisDePort(pays, quantite) {
  if (pays === "FR") return quantite <= 1 ? 900 : 1200;
  if (pays === "UE") return quantite <= 1 ? 500 : 1000;
  return quantite <= 1 ? 600 : 1200;
}

// -------------------
// 🔄 Fonctions liées aux quantités
// -------------------
function changerQuantite(index, qte) {
  const panier = getPanier();
  const quantite = parseInt(qte, 10);

  if (isNaN(quantite) || quantite <= 0) {
    panier.splice(index, 1);
  } else {
    panier[index].quantity = quantite;
  }

  savePanier(panier);
  location.reload();
}

function supprimerArticle(index) {
  const panier = getPanier();
  panier.splice(index, 1);
  savePanier(panier);
  location.reload();
}

// -------------------
// 💳 Paiement Stripe
// -------------------
function initialiserPaiement() {
  const bouton = document.getElementById("payer");
  const selectPays = document.getElementById("pays");
  if (!bouton || !selectPays) return;

  bouton.addEventListener("click", async () => {
    const panier = getPanier();
    const pays = selectPays.value;

    const response = await fetch("https://lescontesdezoufftgen.onrender.com/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: panier, country: pays })
    });

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Erreur lors de la redirection vers Stripe.");
    }
  });
}

// -------------------
// 🧹 Vider le panier
// -------------------
function initialiserViderPanier() {
  const bouton = document.getElementById("vider-panier");
  if (!bouton) return;

  bouton.addEventListener("click", () => {
    if (confirm("Vider le panier ?")) {
      localStorage.removeItem("panier");
      updatePanierCompteur();
      location.reload();
    }
  });
}

// -------------------
// 🚀 Initialisation globale
// -------------------
document.addEventListener("DOMContentLoaded", () => {
  updatePanierCompteur();
  initialiserBoutonsAjouter();
  afficherPanier();
  initialiserPaiement();
  initialiserViderPanier();
  mettreAJourFraisEtTotal();

  const paysSelect = document.getElementById("pays");
  if (paysSelect) {
    paysSelect.addEventListener("change", mettreAJourFraisEtTotal);
  }
});
