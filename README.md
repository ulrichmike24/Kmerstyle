# KamerChic - Plateforme E-Commerce Mode & Luxe Cameroun 🇨🇲

KamerChic est une application web e-commerce haut de gamme (PWA) conçue sur-mesure pour les spécificités du marché camerounais (Douala, Yaoundé et villes secondaires), alliant prêt-à-porter de prestige, chaussures, montres, parfums et maroquinerie.

---

## 🏛️ Architecture & Séparation Stricte des Portails

Pour garantir une sécurité digne d'une plateforme de production, **le portail client est le seul exposé publiquement aux visiteurs**. Les espaces d'administration et de livraison sont strictement hermétiques et isolés :

1. **🛍️ Portail Client Public (`#client` ou `/`)** :
   - Accessible à tous les visiteurs sans barrière.
   - Carrousel héroïque 100% plein écran avec prix réels du marché camerounais (Bazin riche brodé à 85 000 FCFA, costumes italiens à 145 000 FCFA, chronographes de prestige à 165 000 FCFA).
   - Assistant de shopping intelligent **Gemini AI Styliste Privé** pour des recommandations sur-mesure adaptées aux dots, mariages, soirées et affaires.
   - Panier persistant offline-first, codes promotionnels (`BIENVENUE10`, `DOUALA5000`) et calculateur de livraison par zone.
   - Checkout fluide avec prise en compte du système d'adresses informelles (Ville, Quartier, Repère visuel "Face pharmacie...", GPS).
   - Paiement MTN Mobile Money (*126#), Orange Money (#150*4*4#) et Paiement à la Livraison (Cash on Delivery).
   - Suivi de commande en temps réel avec chronologie et contact livreur.

2. **🔒 Portail Direction & Administration (`#admin`)** :
   - **Sas de Sécurité 2FA & JWT** : Protégé par mot de passe administrateur et code **Google Authenticator (TOTP)** à 6 chiffres générant un jeton JWT chiffré.
   - **Identifiants Démo** :
     - Email : `admin@kamerchic.cm`
     - Mot de passe : `KamerAdmin2025!`
     - Clé 2FA : `123456` (ou le code 30s affiché à l'écran).
   - **Tableau de Bord Live & KPIs** : Chiffre d'affaires, marge brute, nombre de commandes, ventilation des règlements et **Journal d'Audit Immuable en direct**.
   - **Gestion des Stocks & Inventaire** : Valorisation totale du stock (prix de vente vs coût d'achat), alertes de stock critique (≤ 3 unités) et modal d'ajustement physique avec motif d'audit.
   - **Comptabilité & Marge** : Chiffre d'affaires brut, Coût des marchandises vendues (COGS), dépenses opérationnelles (salaires, loyers Akwa/Bastos, carburant), bénéfice net et trésorerie par canal (MTN MoMo, Orange Money, Cash magasin, Cash en main des livreurs).
   - **Clôture de Caisse Coursiers** : Bouton d'encaissement et de versement d'espèces pour remettre à zéro le cash en main propre des coursiers et créditer le coffre du showroom.
   - **Commandes & Ventes** : Modification de statut, assignation de coursier, impression de bordereau d'expédition / facture, et **hooks WhatsApp** (notifications client et ordre de mission livreur).
   - **Gestion des Coursiers** : Création d'agents de livraison avec attribution de codes secrets PIN personnalisés.
   - **CRUD Articles & IA Gemini** : Création, modification de titres/prix/photos, et générateur de fiches descriptives bilingues via Gemini AI.

3. **🛵 Espace Coursiers & Livreurs (`#delivery`)** :
   - **Sas de Sécurité Mobile** : Connexion par numéro de téléphone camerounais (+237 6...) et **code PIN secret à 4 chiffres** créé par la direction.
   - **Identifiants Démo** :
     - Livreur 1 : `+237 677 88 99 00` / Code PIN : `2025` (Jean-Paul Manga)
     - Livreur 2 : `+237 699 11 22 33` / Code PIN : `1985` (Eric Tchuente)
   - Interface optimisée pour smartphone :
     - Liste des courses assignées avec distinction nette des commandes payées d'avance vs à encaisser en Cash.
     - Affichage en évidence du **repère visuel informel** et bouton **Ouvrir GPS (Google Maps)**.
     - Boutons d'action rapide : **Appeler client** (`tel:`) et **WhatsApp Direct** avec message prérempli.
     - Validation "Cash Encaissé" et "Colis Livré ✓".
     - Déclaration d'échec ou de report avec motif (client injoignable, repère introuvable, report demandé).
     - Bouton de déconnexion sécurisé (aucun accès au portail admin).

---

## 📱 PWA & Performance Mobile

- **Web App Manifest** : `manifest.webmanifest` avec nom, thèmes `#78350f` et icônes adaptatives.
- **Service Worker** : `/sw.js` assurant la mise en cache prédictive et la navigation fluide même sur les réseaux 3G/4G instables du Cameroun.
- **Support Multilingue** : 100% bilingue Français (par défaut) et Anglais.

---

## 💳 Connexion aux Passerelles Réelles (Campay & Notch Pay)

Toutes les clés d'API et secrets webhook doivent rester sur le serveur backend (`src/server/paymentRoutes.ts`) :

1. **Campay** (`https://www.campay.net`) :
   - Configurez `CAMPAY_USERNAME` et `CAMPAY_PASSWORD`.
   - Utilisez le proxy `/api/payments/momo/collect` pour déclencher le prompt USSD sur le téléphone du client (`*126#` pour MTN ou `#150*4*4#` pour Orange).
2. **Notch Pay** (`https://notchpay.co`) :
   - Configurez `NOTCHPAY_PUBLIC_KEY` et `NOTCHPAY_SECRET_KEY`.
   - Configurez l'écouteur de Webhook `/api/payments/webhook` avec validation de la signature HMAC `X-Notch-Signature`.
