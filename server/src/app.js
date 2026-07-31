import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import { identifier } from './middlewares/auth.js';
import { gestionnaireErreurs, routeIntrouvable } from './middlewares/erreurs.js';
import { DOSSIER_TELEVERSEMENTS } from './middlewares/televersement.js';
import routes from './routes.js';

const racineDepot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function creerApplication() {
  const app = express();

  // Derriere un reverse proxy (Nginx, Render, Railway...), sans quoi les cookies
  // « secure » et la limitation par IP se basent sur la mauvaise adresse.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      // Les images sont servies a un front heberge sur une autre origine.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(
    cors({
      origin(origine, callback) {
        // Requetes sans origine : curl, applications mobiles, tests.
        if (!origine || config.originesClient.includes(origine)) return callback(null, true);
        return callback(new Error(`Origine non autorisee : ${origine}`));
      },
      credentials: true,
    }),
  );

  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (!config.production) app.use(morgan('dev'));

  // Ressources statiques : les visuels historiques du projet et les images
  // televersees depuis le back-office.
  app.use('/images', express.static(join(racineDepot, 'images'), { maxAge: '7d' }));
  app.use('/uploads', express.static(DOSSIER_TELEVERSEMENTS, { maxAge: '7d' }));

  // Identification facultative posee avant les routes : chaque controleur
  // dispose de req.utilisateur quand un jeton valide accompagne la requete.
  app.use(identifier);

  app.get('/sante', (req, res) => res.json({ statut: 'ok', horodatage: new Date().toISOString() }));
  app.use('/api', routes);

  app.use(routeIntrouvable);
  app.use(gestionnaireErreurs);

  return app;
}
