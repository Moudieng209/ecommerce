import { z } from 'zod';
import { lignes, uneLigne } from '../../config/db.js';
import { config } from '../../config/env.js';
import { ErreurHttp } from '../../utils/ErreurHttp.js';

// Le panier appartient a l'utilisateur authentifie (req.utilisateur.id).
// La version PHP travaillait sur « id_client = 1 » code en dur : tous les
// visiteurs partageaient donc le meme panier.

export const schemaAjout = z.object({
  produitId: z.coerce.number().int().positive(),
  quantite: z.coerce.number().int().min(1).max(99).default(1),
});

export const schemaQuantite = z.object({
  quantite: z.coerce.number().int().min(1).max(99),
});

async function chargerPanier(utilisateurId) {
  const articles = await lignes(
    `SELECT pl.id, pl.produit_id, pl.quantite,
            p.nom, p.prix, p.image, p.stock, p.actif,
            (p.prix * pl.quantite) AS sous_total
     FROM panier_lignes pl
     JOIN produits p ON p.id = pl.produit_id
     WHERE pl.utilisateur_id = $1
     ORDER BY pl.cree_le`,
    [utilisateurId],
  );

  const sousTotal = articles.reduce((somme, article) => somme + Number(article.sous_total), 0);
  const nombreArticles = articles.reduce((somme, article) => somme + article.quantite, 0);
  const fraisLivraison = articles.length > 0 ? config.boutique.fraisLivraison : 0;

  return {
    articles,
    resume: {
      nombreArticles,
      sousTotal,
      fraisLivraison,
      total: sousTotal + fraisLivraison,
      devise: config.boutique.devise,
    },
  };
}

export async function afficher(req, res) {
  res.json(await chargerPanier(req.utilisateur.id));
}

export async function ajouter(req, res) {
  const { produitId, quantite } = req.body;

  const produit = await uneLigne('SELECT id, stock, actif FROM produits WHERE id = $1', [produitId]);
  if (!produit || !produit.actif) throw ErreurHttp.introuvable('Produit indisponible.');

  const ligneExistante = await uneLigne(
    'SELECT quantite FROM panier_lignes WHERE utilisateur_id = $1 AND produit_id = $2',
    [req.utilisateur.id, produitId],
  );

  const quantiteVoulue = (ligneExistante?.quantite ?? 0) + quantite;
  if (produit.stock > 0 && quantiteVoulue > produit.stock) {
    throw ErreurHttp.conflit(`Stock insuffisant : ${produit.stock} article(s) disponible(s).`);
  }

  // Un seul aller-retour grace a la contrainte d'unicite (utilisateur, produit).
  await uneLigne(
    `INSERT INTO panier_lignes (utilisateur_id, produit_id, quantite)
     VALUES ($1, $2, $3)
     ON CONFLICT (utilisateur_id, produit_id)
     DO UPDATE SET quantite = panier_lignes.quantite + EXCLUDED.quantite
     RETURNING id`,
    [req.utilisateur.id, produitId, quantite],
  );

  res.status(201).json(await chargerPanier(req.utilisateur.id));
}

export async function changerQuantite(req, res) {
  const { quantite } = req.body;

  const produit = await uneLigne('SELECT stock FROM produits WHERE id = $1', [req.params.produitId]);
  if (!produit) throw ErreurHttp.introuvable('Produit introuvable.');
  if (produit.stock > 0 && quantite > produit.stock) {
    throw ErreurHttp.conflit(`Stock insuffisant : ${produit.stock} article(s) disponible(s).`);
  }

  const ligne = await uneLigne(
    'UPDATE panier_lignes SET quantite = $1 WHERE utilisateur_id = $2 AND produit_id = $3 RETURNING id',
    [quantite, req.utilisateur.id, req.params.produitId],
  );

  if (!ligne) throw ErreurHttp.introuvable('Cet article n est pas dans votre panier.');
  res.json(await chargerPanier(req.utilisateur.id));
}

export async function retirer(req, res) {
  await uneLigne('DELETE FROM panier_lignes WHERE utilisateur_id = $1 AND produit_id = $2 RETURNING id', [
    req.utilisateur.id,
    req.params.produitId,
  ]);

  res.json(await chargerPanier(req.utilisateur.id));
}

export async function vider(req, res) {
  await lignes('DELETE FROM panier_lignes WHERE utilisateur_id = $1', [req.utilisateur.id]);
  res.json(await chargerPanier(req.utilisateur.id));
}

export { chargerPanier };
