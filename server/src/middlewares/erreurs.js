import multer from 'multer';
import { ZodError } from 'zod';
import { config } from '../config/env.js';
import { ErreurHttp } from '../utils/ErreurHttp.js';

export function routeIntrouvable(req, res, next) {
  next(ErreurHttp.introuvable(`Route inconnue : ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars -- Express identifie le gestionnaire d'erreurs a ses 4 parametres
export function gestionnaireErreurs(erreur, req, res, next) {
  let statut = erreur.statut ?? 500;
  let message = erreur.message ?? 'Erreur interne du serveur.';
  let details = erreur.details ?? null;

  // Violations de contraintes PostgreSQL traduites en messages utiles.
  if (erreur.code === '23505') {
    statut = 409;
    message = 'Cette valeur existe deja.';
  } else if (erreur.code === '23503') {
    statut = 409;
    message = 'Cette ressource est liee a d autres donnees et ne peut pas etre modifiee ainsi.';
  } else if (erreur.code === '23514') {
    statut = 400;
    message = 'Valeur refusee par une contrainte de la base.';
  } else if (erreur instanceof ZodError) {
    // Validation appelee directement dans un controleur (formulaires multipart,
    // ou le corps n'est lisible qu'apres multer).
    statut = 400;
    message = 'Donnees invalides.';
    details = erreur.issues.map((probleme) => ({
      champ: probleme.path.join('.') || 'corps',
      message: probleme.message,
    }));
  } else if (erreur instanceof multer.MulterError) {
    statut = 400;
    message =
      erreur.code === 'LIMIT_FILE_SIZE'
        ? 'Image trop volumineuse (2 Mo maximum).'
        : `Televersement refuse : ${erreur.message}`;
  }

  if (statut >= 500) {
    console.error('[erreur]', erreur);
    if (config.production) {
      message = 'Erreur interne du serveur.';
      details = null;
    }
  }

  res.status(statut).json({ erreur: message, ...(details ? { details } : {}) });
}
