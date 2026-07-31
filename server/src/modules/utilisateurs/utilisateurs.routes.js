import { Router } from 'express';
import { exigerAdmin } from '../../middlewares/auth.js';
import { valider, validerQuery } from '../../middlewares/valider.js';
import * as controleur from './utilisateurs.controleur.js';

const router = Router();

router.use(exigerAdmin);

router.get('/', validerQuery(controleur.schemaListe), controleur.lister);
router.post('/', valider(controleur.schemaCreation), controleur.creer);
router.patch('/:id', valider(controleur.schemaModification), controleur.modifier);
router.delete('/:id', controleur.supprimer);

export default router;
