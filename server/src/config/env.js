import 'dotenv/config';

// Lecture centralisee de la configuration : le reste du code n'accede jamais
// directement a process.env, ce qui evite les valeurs par defaut dispersees.

function requis(cle, valeurParDefaut) {
  const valeur = process.env[cle] ?? valeurParDefaut;
  if (valeur === undefined || valeur === '') {
    throw new Error(`Variable d'environnement manquante : ${cle}`);
  }
  return valeur;
}

const environnement = process.env.NODE_ENV ?? 'development';
const production = environnement === 'production';

const secretJwt = process.env.JWT_SECRET ?? '';
if (production && (secretJwt.length < 32 || secretJwt.includes('changez-cette'))) {
  throw new Error('JWT_SECRET doit etre une chaine aleatoire de 32 caracteres minimum en production.');
}

export const config = {
  environnement,
  production,
  port: Number(process.env.PORT ?? 4000),

  // Origines autorisees pour le front (CORS), separees par des virgules.
  originesClient: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  bdd: {
    url: process.env.DATABASE_URL || null,
    host: process.env.PGHOST ?? 'localhost',
    port: Number(process.env.PGPORT ?? 5432),
    user: process.env.PGUSER ?? 'postgres',
    password: process.env.PGPASSWORD ?? 'postgres',
    database: process.env.PGDATABASE ?? 'ecommerce',
  },

  jwt: {
    secret: secretJwt || 'secret-de-developpement-uniquement',
    expiration: process.env.JWT_EXPIRES_IN ?? '7d',
    nomCookie: 'jeton_3mt',
  },

  boutique: {
    fraisLivraison: Number(process.env.FRAIS_LIVRAISON ?? 500),
    devise: process.env.DEVISE ?? 'cfa',
  },

  admin: {
    email: requis('ADMIN_EMAIL', 'admin@3mt-shopping.sn'),
    motDePasse: requis('ADMIN_PASSWORD', 'Admin123!'),
  },
};
