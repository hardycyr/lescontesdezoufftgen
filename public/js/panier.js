// -------------------
// 🌐 Langue de la page (FR par defaut, EN si <html lang="en">)
// -------------------
const EST_EN = (document.documentElement.lang || "").toLowerCase().startsWith("en");

const T = EST_EN
  ? {
      panierUrl: "/boutique/panier-en.html",
      vide: "Your cart is empty.",
      produit: "Product",
      prixUnitaire: "Unit price",
      quantite: "Quantity",
      total: "Total",
      actions: "Actions",
      confirmerVider: "Empty the cart?",
      erreurStripe: "Something went wrong while redirecting to Stripe. Please contact me via my contact page. Thank you.",
    }
  : {
      panierUrl: "/boutique/panier.html",
      vide: "Votre panier est vide.",
      produit: "Produit",
      prixUnitaire: "Prix unitaire",
      quantite: "Quantité",
      total: "Total",
      actions: "Actions",
      confirmerVider: "Vider le panier ?",
      erreurStripe: "Erreur lors de la redirection vers Stripe. Veuillez me contacter via ma page de contact. Merci.",
    };

// -------------------
// 🧠 Fonctions utilitaires
// -------------------
// Le francais ecrit 100,00 € : virgule decimale, et une espace
// INSECABLE avant le symbole — sinon l’euro peut se retrouver
// seul en debut de ligne.
function euros(centimes) {
  return (centimes / 100).toFixed(2).replace(".", ",");
}

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
  // .btn-panier : classe historique (pages produit avec gros bouton vert)
  // .btn-cart : nouvelle classe utilisee dans les .find-buttons pour
  //             eviter les conflits CSS avec le style .btn-panier global.
  const boutons = document.querySelectorAll(".btn-panier, .btn-cart");
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
        window.location.href = T.panierUrl;
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
    tbody.innerHTML = `<tr><td colspan="5">${T.vide}</td></tr>`;
    boutonPayer.style.display = "none";
    return;
  }

  panier.forEach((item, index) => {
    const ligne = document.createElement("tr");
    const total = item.price * item.quantity;
    totalGeneral += total;

    ligne.innerHTML = `
  <td data-label="${T.produit}">${item.name}</td>
  <td data-label="${T.prixUnitaire}">${euros(item.price)} €</td>
  <td data-label="${T.quantite}"><input type="number" min="1" value="${item.quantity}" onchange="changerQuantite(${index}, this.value)" /></td>
  <td data-label="${T.total}">${euros(total)} €</td>
  <td data-label="${T.actions}"><button class="btn-supprimer" onclick="supprimerArticle(${index})">❌</button></td>
`;
    tbody.appendChild(ligne);
  });

  totalElt.textContent = euros(totalGeneral);
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

  const frais = calculerFraisDePort(pays, poidsDuPanier(panier));
  const total = totalProduits + frais;


  if (totalProduitsSpan) totalProduitsSpan.textContent = euros(totalProduits);
  if (fraisPortSpan)     fraisPortSpan.textContent = euros(frais);
  if (totalGeneralSpan)  totalGeneralSpan.textContent = euros(total);
  if (paysLabel)         paysLabel.textContent = pays;
  totalProduitsSpan.textContent = euros(totalProduits);
  fraisPortSpan.textContent = euros(frais);
  totalGeneralSpan.textContent = euros(total);
  paysLabel.textContent = pays;
}

// Doit rester identique aux tables de server.js, qui fait foi :
// ici on ne fait qu’AFFICHER le montant, le serveur le facture.
// Le port depend du POIDS : un album pese 350 g, un kit 150 g.
const POIDS = { livre: 350, kit: 150 };
const POIDS_EMBALLAGE = 120;

function poidsDuPanier(panier) {
  return panier.reduce(
    (g, item) =>
      g + (String(item.id).startsWith("kit-") ? POIDS.kit : POIDS.livre) *
        item.quantity,
    POIDS_EMBALLAGE
  );
}

function calculerFraisDePort(pays, poids) {
  if (pays === "FR")
    return poids <= 500 ? 800 : poids <= 1000 ? 1000 : poids <= 2000 ? 1200 : 1800;
  if (pays === "LU") return poids <= 2000 ? 700 : 900;
  return poids <= 2000 ? 1700 : 3300;
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
  const notePersonnelle = document.getElementById("notePersonnelle"); // Récupère le champ de la note personnelle
  
  if (!bouton || !selectPays) return;

  bouton.addEventListener("click", async () => {
    const panier = getPanier();
    const pays = selectPays.value;
    const note = notePersonnelle.value;

    const response = await fetch("/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: panier, country: pays, note_personnelle: note, lang: EST_EN ? "en" : "fr" })
    });

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(T.erreurStripe);
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
    if (confirm(T.confirmerVider)) {
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
