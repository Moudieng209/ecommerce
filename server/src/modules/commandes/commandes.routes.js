import { Router } from 'express';
import { exigerAdmin, exigerConnexion } from '../../middlewares/auth.js';
import { valider, validerQuery } from '../../middlewares/valider.js';
import * as controleur from './commandes.controleur.js';

const router = Router();

router.use(exigerConnexion);

// Espace client
router.post('/', valider(controleur.schemaValidation), controleur.passerCommande);
router.get('/mes-commandes', controleur.mesCommandes);
router.post('/:id/annuler', controleur.annuler);

// Administration — declaree avant /:id pour que « toutes » ne soit pas lu comme un identifiant.
router.get('/toutes', exigerAdmin, validerQuery(controleur.schemaListeAdmin), controleur.listerToutes);
router.patch('/:id/statut', exigerAdmin, valider(controleur.schemaStatut), controleur.changerStatut);
router.delete('/:id', exigerAdmin, controleur.supprimer);

router.get('/:id', controleur.detail);

export default router;
