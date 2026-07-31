import pg from 'pg';
import { config } from './env.js';

// Les colonnes numeric reviennent en chaine par defaut (precision arbitraire).
// Les montants du projet tiennent largement dans un double : on les convertit
// en nombre pour que l'API renvoie du JSON exploitable directement.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (valeur) => (valeur === null ? null : Number(valeur)));
pg.types.setTypeParser(pg.types.builtins.INT8, (valeur) => (valeur === null ? null : Number(valeur)));

export const pool = new pg.Pool(
  config.bdd.url
    ? { connectionString: config.bdd.url }
    : {
        host: config.bdd.host,
        port: config.bdd.port,
        user: config.bdd.user,
        password: config.bdd.password,
        database: config.bdd.database,
      },
);

pool.on('error', (erreur) => {
  console.error('[pg] erreur inattendue du pool :', erreur.message);
});

/** Execute une requete parametree (jamais de concatenation de chaines). */
export function requete(texte, parametres) {
  return pool.query(texte, parametres);
}

/** Renvoie la premiere ligne, ou null. */
export async function uneLigne(texte, parametres) {
  const { rows } = await pool.query(texte, parametres);
  return rows[0] ?? null;
}

/** Renvoie toutes les lignes. */
export async function lignes(texte, parametres) {
  const { rows } = await pool.query(texte, parametres);
  return rows;
}

/**
 * Execute une suite de requetes dans une transaction.
 * La validation d'une commande, par exemple, doit etre atomique :
 * creation de la commande, des lignes, decrement du stock et vidage du panier.
 */
export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultat = await callback(client);
    await client.query('COMMIT');
    return resultat;
  } catch (erreur) {
    await client.query('ROLLBACK');
    throw erreur;
  } finally {
    client.release();
  }
}
