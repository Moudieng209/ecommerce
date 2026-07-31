import { Router } from 'express';
import { exigerAdmin } from './middlewares/auth.js';
import authRoutes from './modules/auth/auth.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import commandesRoutes from './modules/commandes/commandes.routes.js';
import messagesRoutes from './modules/messages/messages.routes.js';
import panierRoutes from './modules/panier/panier.routes.js';
import produitsRoutes from './modules/produits/produits.routes.js';
import utilisateursRoutes from './modules/utilisateurs/utilisateurs.routes.js';
import { tableauDeBord } from './modules/statistiques/statistiques.controleur.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    nom: '3MT-Shopping API',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth',
      produits: '/api/produits',
      categories: '/api/categories',
      panier: '/api/panier',
      commandes: '/api/commandes',
      messages: '/api/messages',
      utilisateurs: '/api/utilisateurs (admin)',
      statistiques: '/api/statistiques (admin)',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/produits', produitsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/panier', panierRoutes);
router.use('/commandes', commandesRoutes);
router.use('/messages', messagesRoutes);
router.use('/utilisateurs', utilisateursRoutes);
router.get('/statistiques', exigerAdmin, tableauDeBord);

export default router;
