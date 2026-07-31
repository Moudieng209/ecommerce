import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { exigerAdmin } from '../../middlewares/auth.js';
import { valider } from '../../middlewares/valider.js';
import * as controleur from './messages.controleur.js';

const router = Router();

// Le formulaire de contact est ouvert a tous : sans limite, il servirait de robinet a spam.
const limiteurContact = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { erreur: 'Trop de messages envoyes. Reessayez plus tard.' },
});

router.post('/', limiteurContact, valider(controleur.schemaMessage), controleur.envoyer);

router.get('/', exigerAdmin, controleur.lister);
router.patch('/:id/lu', exigerAdmin, controleur.marquerLu);
router.delete('/:id', exigerAdmin, controleur.supprimer);

export default router;
