const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu-list");

  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });

function getPanier() {
    return JSON.parse(localStorage.getItem("panier") || "[]");
  }
  
  function savePanier(panier) {
    localStorage.setItem("panier", JSON.stringify(panier));
  }
  
  function ajouterAuPanier(item) {
    const panier = getPanier();
    const existant = panier.find(p => p.id === item.id);

  if (existant) {
    existant.quantity += 1;
  } else {
    item.quantity = 1;
    panier.push(item);
  }

  

  savePanier(panier);
  updatePanierCompteur();
  alert(`✅ "${item.name}" ajouté au panier.`);
  }


  function modifierQuantite(index, delta) {
    const panier = getPanier();
    const item = panier[index];
  
    if (!item) return;
  
    item.quantity += delta;
  
    if (item.quantity <= 0) {
      panier.splice(index, 1); // Supprimer l'article
    }
  
    savePanier(panier);
    location.reload(); // Recharger la page pour mettre à jour l'affichage
  }
  
  function changerQuantite(index, nouvelleQuantite) {
    const panier = getPanier();
    const qte = parseInt(nouvelleQuantite, 10);
  
    if (isNaN(qte) || qte <= 0) {
      panier.splice(index, 1); // Supprime si invalide ou 0
    } else {
      panier[index].quantity = qte;
    }
  
    savePanier(panier);
    location.reload(); // Recharge la page pour voir le changement
  }
  
  function supprimerArticle(index) {
    const panier = getPanier();
    panier.splice(index, 1);
    savePanier(panier);
    location.reload();
  }
  
  function viderPanier() {
    localStorage.removeItem("panier");
    updatePanierCompteur();
  }

  function updatePanierCompteur() {
    const compteur = document.getElementById("panier-compteur");
    const panier = getPanier();
  
    if (!compteur) return;
  
    const totalArticles = panier.reduce((sum, item) => sum + item.quantity, 0);
  
    if (totalArticles > 0) {
      compteur.textContent = `(${totalArticles})`;
      compteur.style.display = "inline";
    } else {
      compteur.textContent = ""; // Retire les parenthèses
      compteur.style.display = "inline"; // ou "none" si tu préfères le masquer complètement
    }
  }
  

  
  // Appeler automatiquement au chargement de la page
  document.addEventListener("DOMContentLoaded", updatePanierCompteur);

  const panier = getPanier();
  const tbody = document.getElementById("liste-panier");
  const totalElt = document.getElementById("total-produits");

  let totalGeneral = 0;

  if (panier.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">Votre panier est vide.</td></tr>`;
    document.getElementById("payer").style.display = "none";
  } else {
    panier.forEach((item, index) => {
      const ligne = document.createElement("tr");

      const totalParArticle = item.price * item.quantity;
      totalGeneral += totalParArticle;


      ligne.innerHTML = `
  <td data-label="Produit">${item.name}</td>
  <td data-label="Prix unitaire">${(item.price / 100).toFixed(2)} €</td>
  <td data-label="Quantité">
    <input type="number" min="1" value="${item.quantity}" onchange="changerQuantite(${index}, this.value)" />
  </td>
  <td data-label="Total">${(totalParArticle / 100).toFixed(2)} €</td>
  <td data-label="Actions">
    <button class="btn-supprimer" onclick="supprimerArticle(${index})">❌</button>
  </td>
`;
    
       tbody.appendChild(ligne);
    });
  }

  totalElt.textContent = (totalGeneral / 100).toFixed(2);
  

  document.getElementById("payer").addEventListener("click", async () => {
    const panier = getPanier();
    const pays = document.getElementById("pays").value;
    const response = await fetch("https://lescontesdezoufftgen.onrender.com/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cart: panier, country: pays }) // important
    });
    
  
    const data = await response.json();
    if (data.url) {
      //viderPanier();
      window.location.href = data.url;
    } else {
      alert("Erreur lors de la redirection vers Stripe.");
    }
  });
  

  document.getElementById("vider-panier").addEventListener("click", () => {
    if (confirm("Vider le panier ?")) {
      viderPanier();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    mettreAJourFraisEtTotal();
  
    document.getElementById("pays").addEventListener("change", () => {
      mettreAJourFraisEtTotal();
    });
  });

  function calculerFraisDePort(pays, totalQuantite) {
    if (pays === "FR") {
      return totalQuantite <= 1 ? 900 : 1200;
    } else if (["UE"].includes(pays)) {
      return totalQuantite <= 1 ? 500 : 1000;
    } else {
      return totalQuantite <= 1 ? 600 : 1200;
    }
  }
  
  function mettreAJourFraisEtTotal() {
    const panier = getPanier();
    const pays = document.getElementById("pays").value;
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
  
    const fraisPort = calculerFraisDePort(pays, totalQuantite);
    const totalGeneral = totalProduits + fraisPort;
  
    totalProduitsSpan.textContent = (totalProduits / 100).toFixed(2);
    fraisPortSpan.textContent = (fraisPort / 100).toFixed(2);
    totalGeneralSpan.textContent = (totalGeneral / 100).toFixed(2);
    paysLabel.textContent = pays;
  }
  