# 3MT-Shopping

Boutique en ligne : **API REST Node.js/Express + PostgreSQL** et **front React (Vite)**.

Ce dépôt est la réécriture complète du projet PHP/MySQL d'origine, conservé pour référence
dans [legacy-php/](legacy-php/).

---

## Sommaire

- [Démarrage rapide](#démarrage-rapide)
- [Architecture](#architecture)
- [Comptes de démonstration](#comptes-de-démonstration)
- [API](#api)
- [Base de données](#base-de-données)
- [Ce que la migration a corrigé](#ce-que-la-migration-a-corrigé)
- [Correspondance avec l'ancien code PHP](#correspondance-avec-lancien-code-php)
- [Mise en production](#mise-en-production)

---

## Démarrage rapide

**Prérequis** : Node.js 20+, PostgreSQL 14+.

```bash
# 1. Base de données
createdb -U postgres ecommerce

# 2. API
cd server
cp .env.example .env        # ajustez les identifiants PostgreSQL
npm install
npm run db:migrate          # crée les tables
npm run db:seed             # comptes + catalogue de démonstration
npm run dev                 # http://localhost:4000

# 3. Front (dans un second terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Ouvrez ensuite **http://localhost:5173**.

En développement, Vite relaie `/api`, `/images` et `/uploads` vers le serveur Express : le front
et l'API partagent la même origine, donc aucune configuration CORS n'est nécessaire.

### Scripts utiles

| Commande | Effet |
|---|---|
| `npm run dev` (server) | API avec rechargement automatique |
| `npm run db:migrate` | Applique `schema.sql` (idempotent) |
| `npm run db:migrate -- --force` | Supprime les tables puis recrée tout |
| `npm run db:seed` | Insère les données de démonstration |
| `npm run db:reset` | `--force` + seed, remise à zéro complète |
| `npm run build` (client) | Build de production dans `client/dist/` |

---

## Architecture

```
ecommerce/
├── server/                     API REST Express (ESM)
│   └── src/
│       ├── config/             env.js (configuration), db.js (pool + transactions)
│       ├── db/                 schema.sql, migrate.js, seed.js
│       ├── middlewares/        auth (JWT), valider (zod), televersement, erreurs
│       ├── modules/            un dossier par domaine métier
│       │   ├── auth/           inscription, connexion, profil
│       │   ├── produits/       catalogue + CRUD admin
│       │   ├── categories/     rayons
│       │   ├── panier/         panier serveur, par utilisateur
│       │   ├── commandes/      validation transactionnelle, suivi, annulation
│       │   ├── messages/       formulaire de contact
│       │   ├── utilisateurs/   gestion des comptes (admin)
│       │   └── statistiques/   tableau de bord
│       ├── app.js              assemblage Express
│       └── index.js            démarrage et arrêt propre
│
├── client/                     Front React 19 + Vite + Tailwind v4
│   └── src/
│       ├── api/client.js       client HTTP unique (cookies inclus)
│       ├── contexts/           Auth, Panier, Notifications
│       ├── components/         Revelation, EnTete, PiedDePage, CarteProduit, ui, Modale
│       ├── layouts/            DispositionBoutique, DispositionAdmin
│       ├── pages/              vitrine, catalogue, panier, commandes, compte
│       │   └── admin/          tableau de bord et CRUD
│       └── index.css           thème (jetons Material 3) et animations
│
├── images/                     visuels du projet, servis par l'API sur /images
└── legacy-php/                 ancien site PHP, conservé pour référence
```

### Design

L'interface reprend le système de design de la vitrine **SenBus Pro** : jetons de couleur
Material 3 déclarés dans `@theme` (Tailwind v4), typographie Inter, icônes Material Symbols,
cartes arrondies et sections révélées au défilement (composant `Revelation`). La palette est
déclinée sur le vert de la marque 3MT (`#83e2b6` en accent, `#0f7a53` en couleur primaire).

---

## Comptes de démonstration

Créés par `npm run db:seed` :

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@3mt-shopping.sn` | `Admin123!` |
| Client | `client@3mt-shopping.sn` | `Client123!` |

Les identifiants de l'administrateur se règlent dans `server/.env`
(`ADMIN_EMAIL`, `ADMIN_PASSWORD`).

---

## API

Base : `http://localhost:4000/api`. Les réponses sont en JSON ; les erreurs ont la forme
`{ "erreur": "message", "details": [...] }`.

L'authentification repose sur un **JWT transporté par un cookie httpOnly** : inaccessible au
JavaScript de la page, donc à une injection XSS. L'en-tête `Authorization: Bearer <jeton>` reste
accepté pour les tests en ligne de commande.

### Authentification — `/auth`

| Méthode | Route | Accès | Rôle |
|---|---|---|---|
| POST | `/auth/inscription` | public | Créer un compte client |
| POST | `/auth/connexion` | public | Se connecter (limité à 20 essais / 15 min) |
| POST | `/auth/deconnexion` | public | Effacer le cookie de session |
| GET | `/auth/moi` | public | Session courante (`utilisateur: null` si anonyme) |
| PATCH | `/auth/profil` | connecté | Modifier ses informations |
| PATCH | `/auth/mot-de-passe` | connecté | Changer son mot de passe |

### Catalogue — `/produits`, `/categories`

| Méthode | Route | Accès |
|---|---|---|
| GET | `/produits` | public — filtres `recherche`, `categorie`, `prixMin`, `prixMax`, `tri`, `page`, `parPage` |
| GET | `/produits/:id` | public |
| POST · PATCH · DELETE | `/produits[/:id]` | admin — `multipart/form-data`, champ fichier `image` |
| GET | `/categories` | public |
| POST · PATCH · DELETE | `/categories[/:id]` | admin |

### Panier — `/panier` (connecté)

`GET /panier` · `POST /panier` · `PATCH /panier/:produitId` · `DELETE /panier/:produitId` ·
`DELETE /panier`

Chaque réponse renvoie le panier complet avec son récapitulatif calculé côté serveur
(`sousTotal`, `fraisLivraison`, `total`).

### Commandes — `/commandes` (connecté)

| Méthode | Route | Accès |
|---|---|---|
| POST | `/commandes` | client — transforme le panier en commande |
| GET | `/commandes/mes-commandes` | client |
| GET | `/commandes/:id` | propriétaire ou admin |
| POST | `/commandes/:id/annuler` | propriétaire (si « En attente ») ou admin |
| GET | `/commandes/toutes` | admin — filtres `statut`, `recherche`, pagination |
| PATCH | `/commandes/:id/statut` | admin |
| DELETE | `/commandes/:id` | admin |

Statuts : `En attente` → `Validee` → `Expediee` → `Livree`, plus `Annulee`.

### Messages, comptes, statistiques

`POST /messages` (public, 10 messages/heure) · `GET|PATCH|DELETE /messages` (admin) ·
`GET|POST|PATCH|DELETE /utilisateurs` (admin) · `GET /statistiques` (admin).

---

## Base de données

```
utilisateurs ──┬── panier_lignes ──── produits ──── categories
               └── commandes ──── commande_lignes ──┘
messages
```

- **`utilisateurs`** — clients et administrateurs dans une seule table, distingués par `role`.
- **`produits`** — `prix` en `numeric(12,2)`, `stock`, `actif` (masquer sans supprimer).
- **`panier_lignes`** — unicité `(utilisateur_id, produit_id)`, ce qui permet un
  « ajouter ou incrémenter » en une seule requête.
- **`commandes` / `commande_lignes`** — le nom et le prix des articles sont recopiés dans les
  lignes : l'historique reste juste même si un produit change de prix ou disparaît.
- Clés étrangères, contraintes `CHECK`, index et déclencheurs `maj_le` : voir
  [server/src/db/schema.sql](server/src/db/schema.sql).

---

## Ce que la migration a corrigé

Les problèmes suivants étaient présents dans le code PHP d'origine.

| Problème | Ancien code | Correction |
|---|---|---|
| **Injections SQL** | `"SELECT * FROM clients WHERE email='$user'"` — toutes les requêtes concaténaient les entrées | Requêtes paramétrées (`$1`, `$2`) partout, sans exception |
| **Mots de passe en MD5** | `md5($password)`, sans sel | bcrypt, coût 12 |
| **Panier partagé** | `$id_client = 1;` codé en dur : tous les visiteurs partageaient un panier | Panier rattaché à l'utilisateur du jeton |
| **Commandes sans détail** | Seul le montant total était stocké | Table `commande_lignes` avec le détail figé |
| **Aucune transaction** | Insertion de commande puis vidage du panier, sans atomicité | `BEGIN`/`COMMIT`, verrous `FOR UPDATE` sur le stock |
| **Pas de gestion de stock** | Le stock n'existait pas | Décrément à la commande, restitution à l'annulation |
| **Back-office non protégé** | Pages accessibles en devinant l'URL | Rôle `admin` vérifié à chaque requête API |
| **Formulaire de contact en GET** | Le message entier passait dans l'URL | POST validé, avec limitation anti-spam |
| **Aucune validation** | `$_POST['prix']` inséré tel quel | Schémas zod sur toutes les entrées |
| **Double système de comptes** | Tables `clients` et `utilisateurs` séparées, deux connexions | Une table, une colonne `role` |

Corrections complémentaires : en-têtes de sécurité (helmet), CORS restreint, limitation du débit
sur la connexion, noms de fichiers téléversés régénérés, comparaison de mot de passe à temps
constant, et message d'erreur unique à la connexion pour ne pas révéler quels emails existent.

---

## Correspondance avec l'ancien code PHP

| Ancien fichier | Remplacé par |
|---|---|
| `index.php`, `page d'acceuil/accueil.php` | `client/src/pages/Accueil.jsx` |
| `page d'acceuil/home_produit.php` | `client/src/pages/Produits.jsx` + `GET /api/produits` |
| `page d'acceuil/panier.php`, `ajouter_au_panier.php`, `supprimer_panier.php` | `client/src/pages/Panier.jsx` + `/api/panier` |
| `page d'acceuil/valider_commande.php`, `page_commande.php` | `/api/commandes` + `client/src/pages/Commandes.jsx` |
| `contact.html`, `message.php` | `client/src/pages/Contact.jsx` + `POST /api/messages` |
| `connexion page client/*`, `connexion page admin/*` | `/api/auth` + pages `Connexion.jsx` / `Inscription.jsx` |
| `Page administrateur/Tableau de bord/**` | `client/src/pages/admin/**` + routes admin |
| `connexion.php` (identifiants en clair) | `server/src/config/db.js` + `server/.env` |

---

## Mise en production

1. **Base** : créez la base, puis `npm run db:migrate` (sans `--force`).
2. **Variables** dans `server/.env` :
   - `NODE_ENV=production`
   - `JWT_SECRET` — chaîne aléatoire de 32 caractères minimum (le serveur refuse de démarrer
     sinon) : `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
   - `CLIENT_ORIGIN` — l'URL exacte du front, séparées par des virgules si plusieurs
   - identifiants PostgreSQL réels
3. **Front** : `npm run build`, puis servez `client/dist/` derrière un serveur statique.
   Si l'API est sur un autre domaine, définissez `VITE_API_URL` **avant** le build.
4. **HTTPS obligatoire** : en production, le cookie de session est émis avec `secure` et
   `SameSite=None`, il ne sera pas transmis en HTTP simple.
5. Servez l'application derrière un reverse proxy (`trust proxy` est déjà activé) et prévoyez
   une sauvegarde régulière de `server/uploads/`, qui contient les images téléversées.

<img width="1905" height="948" alt="image" src="https://github.com/user-attachments/assets/814204ea-8b03-41e5-aa7b-ded912fce2b7" />
<img width="1626" height="989" alt="image" src="https://github.com/user-attachments/assets/90b0fa13-7ca7-4b17-8ade-acb703f9359c" />
<img width="1565" height="992" alt="image" src="https://github.com/user-attachments/assets/0e432e15-7009-4381-bbe7-cb78c45a7de7" />
<img width="1426" height="992" alt="image" src="https://github.com/user-attachments/assets/860fedd1-8a4a-4ea2-a4ca-109e01bc74ad" />
<img width="1576" height="992" alt="image" src="https://github.com/user-attachments/assets/db85cf64-d44a-4cef-b99f-dfcbb4b06a40" />
<img width="1530" height="963" alt="image" src="https://github.com/user-attachments/assets/5683ecf3-9a46-4432-aa77-f11cca6d7d3b" />
<img width="1677" height="994" alt="image" src="https://github.com/user-attachments/assets/994c7f08-df16-4dda-9a79-6e931337ddc2" />
