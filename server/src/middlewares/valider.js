import { ErreurHttp } from '../utils/ErreurHttp.js';

/**
 * Valide une partie de la requete avec un schema zod et remplace la valeur
 * brute par la valeur analysee (types convertis, chaines nettoyees).
 * Toute donnee entrante passe par ici : c'est ce qui remplace les
 * concatenations de $_POST du code PHP d'origine.
 */
export function valider(schema, source = 'body') {
  return (req, res, next) => {
    const resultat = schema.safeParse(req[source]);

    if (!resultat.success) {
      const details = resultat.error.issues.map((probleme) => ({
        champ: probleme.path.join('.') || source,
        message: probleme.message,
      }));
      return next(ErreurHttp.requeteInvalide('Donnees invalides.', details));
    }

    // req.query et req.params sont en lecture seule sous Express 5 :
    // la valeur analysee est deposee a part plutot que reassignee.
    if (source === 'body') req.body = resultat.data;
    else req.donneesValidees = resultat.data;

    return next();
  };
}

/** Raccourci lisible pour les schemas de query string. */
export const validerQuery = (schema) => valider(schema, 'query');
export const validerParams = (schema) => valider(schema, 'params');
