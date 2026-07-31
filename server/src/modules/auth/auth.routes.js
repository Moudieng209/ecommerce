import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { exigerConnexion } from '../../middlewares/auth.js';
import { valider } from '../../middlewares/valider.js';
import * as controleur from './auth.controleur.js';

const router = Router();

// Freine les tentatives de connexion en rafale (attaque par dictionnaire).
const limiteurAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { erreur: 'Trop de tentatives. Reessayez dans quelques minutes.' },
});

router.post('/inscription', limiteurAuth, valider(controleur.schemaInscription), controleur.inscription);
router.post('/connexion', limiteurAuth, valider(controleur.schemaConnexion), controleur.connexion);
router.post('/deconnexion', controleur.deconnexion);

// Volontairement publique : le front interroge cette route au demarrage pour
// savoir si une session existe. Repondre 401 a un visiteur anonyme remplirait
// sa console d'erreurs pour un cas parfaitement normal.
router.get('/moi', controleur.moi);
router.patch('/profil', exigerConnexion, valider(controleur.schemaProfil), controleur.majProfil);
router.patch(
  '/mot-de-passe',
  exigerConnexion,
  valider(controleur.schemaMotDePasse),
  controleur.changerMotDePasse,
);

export default router;
