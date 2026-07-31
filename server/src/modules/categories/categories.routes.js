import { Router } from 'express';
import { exigerAdmin } from '../../middlewares/auth.js';
import { valider } from '../../middlewares/valider.js';
import * as controleur from './categories.controleur.js';

const router = Router();

router.get('/', controleur.lister);
router.post('/', exigerAdmin, valider(controleur.schemaCategorie), controleur.creer);
router.patch('/:id', exigerAdmin, valider(controleur.schemaCategorie), controleur.modifier);
router.delete('/:id', exigerAdmin, controleur.supprimer);

export default router;
