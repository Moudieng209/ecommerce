import { creerApplication } from './app.js';
import { config } from './config/env.js';
import { pool } from './config/db.js';

const app = creerApplication();

// Verification de la base au demarrage : mieux vaut echouer tout de suite
// que renvoyer des 500 a la premiere requete.
try {
  await pool.query('SELECT 1');
  console.log(`[bdd] connexion etablie (${config.bdd.database ?? config.bdd.url})`);
} catch (erreur) {
  console.error('[bdd] connexion impossible :', erreur.message);
  console.error('      Verifiez que PostgreSQL tourne et que server/.env est correct.');
  process.exit(1);
}

const serveur = app.listen(config.port, () => {
  console.log(`[api] 3MT-Shopping demarree sur http://localhost:${config.port}`);
  console.log(`[api] environnement : ${config.environnement}`);
  console.log(`[api] origines autorisees : ${config.originesClient.join(', ')}`);
});

// Arret propre : on laisse les requetes en cours se terminer avant de fermer
// le pool, sinon elles echouent au redemarrage.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`\n[api] arret demande (${signal})...`);
    serveur.close(async () => {
      await pool.end();
      process.exit(0);
    });
  });
}
