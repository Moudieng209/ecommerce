import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { pool, transaction } from '../config/db.js';

// Jeu de donnees de demonstration : un compte administrateur, un compte client,
// les categories et les produits de la boutique d'origine.
// Le script est reentrant : relance sans doublon (ON CONFLICT).

const CATEGORIES = [
  { nom: 'Vêtements', description: 'Chemises, polos, joggings et tenues du quotidien.' },
  { nom: 'Chaussures', description: 'Sneakers, chaussures de sport et de ville.' },
  { nom: 'Accessoires', description: 'Serviettes, sacs et petits accessoires de mode.' },
  { nom: 'Parfums', description: 'Parfums et soins pour homme et femme.' },
];

const PRODUITS = [
  {
    categorie: 'Vêtements',
    nom: 'Chemise classique',
    description: 'Chemise coupe droite en coton, idéale pour le bureau comme pour les sorties.',
    prix: 15000,
    image: '/images/chemise.png',
    stock: 24,
  },
  {
    categorie: 'Vêtements',
    nom: 'Polo piqué',
    description: 'Polo en maille piquée respirante, col côtelé et coupe ajustée.',
    prix: 12000,
    image: '/images/polo.png',
    stock: 30,
  },
  {
    categorie: 'Vêtements',
    nom: 'Tee-shirt coton bio',
    description: 'Tee-shirt uni en coton biologique, doux et résistant au lavage.',
    prix: 7500,
    image: '/images/tee-shirt.png',
    stock: 50,
  },
  {
    categorie: 'Vêtements',
    nom: 'Jogging molletonné',
    description: 'Bas de jogging molletonné avec poches latérales et taille élastiquée.',
    prix: 14000,
    image: '/images/jogging.png',
    stock: 18,
  },
  {
    categorie: 'Vêtements',
    nom: 'Jean brut',
    description: 'Jean denim brut coupe droite, solide et intemporel.',
    prix: 18000,
    image: '/images/jeans.png',
    stock: 20,
  },
  {
    categorie: 'Vêtements',
    nom: 'Costume deux pièces',
    description: 'Costume veste et pantalon en tissu fluide, pour les grandes occasions.',
    prix: 65000,
    image: '/images/costume.png',
    stock: 8,
  },
  {
    categorie: 'Vêtements',
    nom: 'Robe élégante',
    description: 'Robe fluide à la coupe élégante, agréable à porter toute la journée.',
    prix: 22000,
    image: '/images/robe0.png',
    stock: 12,
  },
  {
    categorie: 'Vêtements',
    nom: 'Short de sport',
    description: 'Short léger à séchage rapide, parfait pour l’entraînement.',
    prix: 8000,
    image: '/images/short.png',
    stock: 35,
  },
  {
    categorie: 'Chaussures',
    nom: 'Sneakers urbaines',
    description: 'Sneakers à semelle amortissante, confortables du matin au soir.',
    prix: 32000,
    image: '/images/sneaker.png',
    stock: 16,
  },
  {
    categorie: 'Chaussures',
    nom: 'Chaussures de course',
    description: 'Modèle running respirant, maintien renforcé et semelle antidérapante.',
    prix: 38000,
    image: '/images/foot.png',
    stock: 14,
  },
  {
    categorie: 'Chaussures',
    nom: 'Chaussures de ville',
    description: 'Chaussures en cuir traité, finition soignée pour un rendu habillé.',
    prix: 45000,
    image: '/images/chaussure1.jpg',
    stock: 10,
  },
  {
    categorie: 'Accessoires',
    nom: 'Serviette de bain',
    description: 'Serviette épaisse en coton éponge, très absorbante.',
    prix: 6000,
    image: '/images/serviette.png',
    stock: 40,
  },
  {
    categorie: 'Accessoires',
    nom: 'Serviette de plage',
    description: 'Grande serviette colorée, légère et facile à transporter.',
    prix: 6500,
    image: '/images/serviette0.png',
    stock: 28,
  },
  {
    categorie: 'Parfums',
    nom: 'Parfum signature',
    description: 'Eau de parfum boisée, tenue longue durée, flacon de 100 ml.',
    prix: 28000,
    image: '/images/parfun.png',
    stock: 22,
  },
];

async function semer() {
  await transaction(async (client) => {
    // --- Comptes ---
    const motDePasseAdmin = await bcrypt.hash(config.admin.motDePasse, 12);
    await client.query(
      `INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, role)
       VALUES ($1, $2, $3, $4, 'admin')
       ON CONFLICT (lower(email)) DO UPDATE
         SET mot_de_passe = EXCLUDED.mot_de_passe, role = 'admin'`,
      ['Admin', '3MT', config.admin.email, motDePasseAdmin],
    );

    const motDePasseClient = await bcrypt.hash('Client123!', 12);
    await client.query(
      `INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, telephone, role)
       VALUES ($1, $2, $3, $4, $5, 'client')
       ON CONFLICT (lower(email)) DO NOTHING`,
      ['Awa', 'Diop', 'client@3mt-shopping.sn', motDePasseClient, '+221 77 000 00 00'],
    );

    // --- Categories ---
    const idsCategories = new Map();
    for (const categorie of CATEGORIES) {
      const { rows } = await client.query(
        `INSERT INTO categories (nom, description) VALUES ($1, $2)
         ON CONFLICT (lower(nom)) DO UPDATE SET description = EXCLUDED.description
         RETURNING id`,
        [categorie.nom, categorie.description],
      );
      idsCategories.set(categorie.nom, rows[0].id);
    }

    // --- Produits ---
    for (const produit of PRODUITS) {
      const { rows } = await client.query('SELECT id FROM produits WHERE lower(nom) = lower($1)', [produit.nom]);
      if (rows.length > 0) continue;

      await client.query(
        `INSERT INTO produits (categorie_id, nom, description, prix, image, stock)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          idsCategories.get(produit.categorie),
          produit.nom,
          produit.description,
          produit.prix,
          produit.image,
          produit.stock,
        ],
      );
    }
  });

  console.log('Donnees de demonstration inserees.');
  console.log(`  Admin  : ${config.admin.email} / ${config.admin.motDePasse}`);
  console.log('  Client : client@3mt-shopping.sn / Client123!');
}

semer()
  .catch((erreur) => {
    console.error('Echec du seed :', erreur.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
