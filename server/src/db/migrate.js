import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/db.js';

// Applique schema.sql sur la base configuree.
//   node src/db/migrate.js           -> cree ce qui manque (idempotent)
//   node src/db/migrate.js --force   -> supprime les tables puis recree tout

const dossier = dirname(fileURLToPath(import.meta.url));

// Ordre inverse des dependances : les tables filles d'abord.
const TABLES = [
  'commande_lignes',
  'commandes',
  'panier_lignes',
  'produits',
  'categories',
  'messages',
  'utilisateurs',
];

async function migrer() {
  const force = process.argv.includes('--force');

  if (force) {
    console.log('Suppression des tables existantes...');
    await pool.query(`DROP TABLE IF EXISTS ${TABLES.join(', ')} CASCADE`);
  }

  const schema = await readFile(join(dossier, 'schema.sql'), 'utf8');
  await pool.query(schema);

  console.log('Schema applique avec succes.');
}

migrer()
  .catch((erreur) => {
    console.error('Echec de la migration :', erreur.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
