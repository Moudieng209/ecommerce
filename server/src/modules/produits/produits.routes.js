import { Router } from 'express';
import { exigerAdmin } from '../../middlewares/auth.js';
import { televersementImage } from '../../middlewares/televersement.js';
import { validerQuery } from '../../middlewares/valider.js';
import * as controleur from './produits.controleur.js';

const router = Router();

// Catalogue public
router.get('/', validerQuery(controleur.schemaListe), controleur.lister);
router.get('/:id', controleur.detail);

// Administration : le corps arrive en multipart, donc multer s'execute avant
// la validation, qui se fait dans le controleur.
router.post('/', exigerAdmin, televersementImage, controleur.creer);
router.patch('/:id', exigerAdmin, televersementImage, controleur.modifier);
router.delete('/:id', exigerAdmin, controleur.supprimer);

export default router;
