import { z } from 'zod';
import { lignes, uneLigne } from '../../config/db.js';
import { ErreurHttp } from '../../utils/ErreurHttp.js';

export const schemaCategorie = z.object({
  nom: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caracteres.').max(80),
  description: z.string().trim().max(1000).default(''),
});

export async function lister(req, res) {
  // Le compteur de produits actifs sert directement aux filtres de la boutique.
  const categories = await lignes(
    `SELECT c.id, c.nom, c.description, c.cree_le,
            count(p.id) FILTER (WHERE p.actif) ::int AS nombre_produits
     FROM categories c
     LEFT JOIN produits p ON p.categorie_id = c.id
     GROUP BY c.id
     ORDER BY lower(c.nom)`,
  );

  res.json({ categories });
}

export async function creer(req, res) {
  const { nom, description } = req.body;

  const existante = await uneLigne('SELECT id FROM categories WHERE lower(nom) = lower($1)', [nom]);
  if (existante) throw ErreurHttp.conflit('Une categorie porte deja ce nom.');

  const categorie = await uneLigne(
    'INSERT INTO categories (nom, description) VALUES ($1, $2) RETURNING *',
    [nom, description],
  );

  res.status(201).json({ categorie });
}

export async function modifier(req, res) {
  const { nom, description } = req.body;

  const categorie = await uneLigne(
    'UPDATE categories SET nom = $1, description = $2 WHERE id = $3 RETURNING *',
    [nom, description, req.params.id],
  );

  if (!categorie) throw ErreurHttp.introuvable('Categorie introuvable.');
  res.json({ categorie });
}

export async function supprimer(req, res) {
  // Les produits rattaches ne sont pas supprimes : la cle etrangere est
  // declaree ON DELETE SET NULL, ils basculent simplement en « sans categorie ».
  const categorie = await uneLigne('DELETE FROM categories WHERE id = $1 RETURNING id', [req.params.id]);
  if (!categorie) throw ErreurHttp.introuvable('Categorie introuvable.');

  res.json({ message: 'Categorie supprimee.' });
}
