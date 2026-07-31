import { Router } from 'express';
import { exigerConnexion } from '../../middlewares/auth.js';
import { valider } from '../../middlewares/valider.js';
import * as controleur from './panier.controleur.js';

const router = Router();

// Tout le panier est privé : chaque route travaille sur l'utilisateur du jeton.
router.use(exigerConnexion);

router.get('/', controleur.afficher);
router.post('/', valider(controleur.schemaAjout), controleur.ajouter);
router.patch('/:produitId', valider(controleur.schemaQuantite), controleur.changerQuantite);
router.delete('/:produitId', controleur.retirer);
router.delete('/', controleur.vider);

export default router;
