# Traduction luxembourgeoise — points à faire relire par un natif

> La traduction LU (dossier `public/lu/`) a été générée automatiquement (orthographe visée : lod.lu, règle d'Eifel).
> Elle constitue une **base de travail** : merci de relire/corriger les termes ci-dessous avant publication.
> Marque « Les Contes de Zoufftgen », titres des livres et « Zoufftgen » sont **volontairement gardés en français**.

---

## 1. Termes transverses (récurrents sur plusieurs pages) — à figer en priorité

Une décision ici se répercute partout, donc à trancher d'abord.

| FR | LU utilisé | Alternatives / à vérifier |
|---|---|---|
| Objets narratifs (titre, menu) | **Narrativ Objeten** | *Erzielobjeten* (plus idiomatique ?) |
| Interventions (menu, titre) | **Atelieren a Liesungen** | choix de sens (ateliers & lectures), pas littéral |
| Parutions & Rencontres (menu) | **Aktualitéit & Evenementer** | = actualité & événements |
| À propos (menu) | **Iwwer mech** | = à propos de moi |
| L'univers / Panier / La collection | **D'Welt / Wuerekuerf / D'Sammlung** | a priori OK |
| Rencontres (tags, presse) | **Begéignungen** | OK ? |
| « Ouvrir le menu » (aria-label) | **Menü opmaachen** | OK ? |
| Couverture rigide | **festen Asaz** (tome 1) / **Festen Aband** (tome 2) | ⚠️ **incohérent entre pages** — choisir : *Hardcover* ? *festen Asaz* ? |
| Vernis / dorure 3D | **3D-Verguldung** / *gëllen Detailer* | terme d'impression à valider |
| Lecture accompagnée / autonome | **begleet Liesen** / **selbststänneg(t) Liesen** | ⚠️ orthographe variable (*selbststännegt* vs *selbstänneg*) |
| Dessin pas à pas | **Schrëtt-fir-Schrëtt-Zeechnung** | néologisme composé |
| Commander (boutons) | **Online bestellen / Den Album bestellen / Am Buttek / Ofhuelen** | harmoniser le ton des boutons |
| Toponymes | **Diddeleng** (Dudelange), **Diddenuewen** (Thionville), **Loutrengen** (Lorraine) | confirmer les exonymes |

---

## 2. Par page

### Accueil (`lu/index.html`)
- Hero : « Geschichten, déi zu Zoufftgen entstane sinn, tëscht Bësch, Erënnerung a Fantasie. »
- « Eng Sammlung, geschriwwen an illustréiert vun Hélène Hardy. »

### D'Sammlung (`lu/collection.html`)
- **schalkege Geescht** (esprit malicieux) — alt : *geckeg / spëtzbubeg*
- **décke matte Pabeier** (papier épais mat) ; **Noenahm** (gros plan) — alt : *Détailopnam*
- **En Abenteuer** (aventure — germanisme ?) ; **d'Liesen ze verlängeren** (prolonger la lecture)
- **Méi wéi eng Geschicht** (titre « Plus qu'une histoire ») ; **Uerderung am Realen** (ancrage dans le réel, meta)

### D'Welt (`lu/univers.html`)
- **D'Foschthaus** (maison forestière) — alt : *Fouschterhaus / Bëschhaus*
- **Bauerei** (ferme) — alt : *Haff* ; **huel Weid** (saule creux) ; **Päiperlekspark** (parc aux papillons)
- **Noossegkeet** (proximité) — alt : *Nootheet* ; **duerchquéiert** (traverser)

### Iwwer mech (`lu/apropos.html`)
- **Kulturvermëttlerin** (« intervenante culturelle ») — forme à valider
- **Routkéiselchen** (rouge-gorge) — alt : *Routbréischtchen* ; **Kuerwächelchen** (écureuil) — alt : *Kawächelchen / Eechkätzchen*
- **Stëllten** (silences) — alt : *Rou*

### Atelieren a Liesungen (`lu/interventions.html`)
- **pädagogesch Parcoursen** (parcours pédagogiques) — alt : *pädagogesch Programmer*
- **Maison-relais-Beräich** (périscolaire) ; **gedeelte Opmierksamkeet** (attention partagée) ; **erzielt Virliesung** (lecture contée)

### Narrativ Objeten (`lu/objetsnarratifs.html`)
- **An der Atelier** (genre de *Atelier* ?) — alt : *an der Wierkstatt*
- **Objeten op sech** (à part entière) ; **Eechelen** (glands) ; **gehandhaabt** (manipulés) — alt : *an d'Hand geholl*
- **Demnächst** (à venir) — alt : *Geschwënn* ; **tatsächlech** (tangible)

### Aktualitéit & Evenementer (`lu/parutions.html`)
- **Dédicacen / Dédicace-Séancen / Dédicacéieren** (emprunts FR — courants à l'oral, à valider à l'écrit)
- **Erausgab** (parution), **Verwuerzelung** (ancrage), **immersiv Liesung**

### Kontakt (`lu/contact.html`) + messages JS (`lu/js/contact.js`)
- Intro : « zéckt net mir ze schreiwen » ; « Ech äntweren op all Noricht mat Opmierksamkeet »
- Messages JS : « Wann ech glift fëllt all Felder aus » ; « kräizt d'Këscht … un » ; « Är Noricht gouf gutt verschéckt » ; « et ass e Feeler opgetrueden »
- **Renseignement** gardé proche du FR (meta) — à remplacer si besoin

### Paiement (`lu/cancel.html`, `lu/success.html`)
- **Bezuelung ofgebrach** (paiement annulé) — alt : *annuléiert*
- **Wann Dir e Problem haat** (prétérit + vouvoiement à vérifier)
- **Äre Wuerekuerf erëm ophuelen** (reprendre le panier) — alt : *weiderféieren*
- **Merci fir Äert Vertrauen** (merci de votre confiance) ; **mat vill Suergfalt**

### Livres (`lu/boutique/*.html`)
- **en heemlechen Awunner** (habitant secret) — alt : *geheim* ; **Duercherneen** (désordre) ; **entstoe gelooss**
- Tome 2 : **eng nei Rätsel** → genre neutre probable **e neit Rätsel** ; **bis bei seng Haus** → **bis bei säin Haus**
- Tome 3 : **gëllene Look** (allure dorée) — alt : *gëllent Ausgesinn* ; **grompelege Papp** (papa grognon) ; **Zänndokter / Aendokter** (dentiste / ophtalmo) ; **no Rendez-vous** (sur rdv)

### Panier (`lu/boutique/panier.html` + `lu/js/panier.js`)
- En-têtes : **Produkt / Eenheetspräis / Quantitéit / Total / Aktiounen**
- **Zur Bezuelung** (procéder au paiement) — alt : *Bezuelen* ; **Resumé vun Ärer Bestellung** ; **Liwwerland** (pays de livraison) ; **Versandkäschten**
- Pays : **Frankräich, Lëtzebuerg, Europäesch Unioun, Groussbritannien, d'Schwäiz, Rescht vun der Welt**
- **Perséinlech Notiz** + placeholder « Eng Widmung, eng Präzisioun fir Är Bestellung… »
- **Äre Wuerekuerf ass eidel** ; **Wuerekuerf eidel maachen?**

---

*Une fois les corrections décidées, elles peuvent être appliquées en une passe (notamment les termes transverses du §1, à harmoniser sur toutes les pages).*
