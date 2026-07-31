import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { lignes, uneLigne } from '../../config/db.js';
import { DOSSIER_TELEVERSEMENTS } from '../../middlewares/televersement.js';
import { ErreurHttp } from '../../utils/ErreurHttp.js';

const TRIS = {
  recent: 'p.cree_le DESC',
  ancien: 'p.cree_le ASC',
  'prix-croissant': 'p.prix ASC',
  'prix-decroissant': 'p.prix DESC',
  nom: 'lower(p.nom) ASC',
};

// z.coerce.boolean() convertirait "false" en true (toute chaine non vide est
// vraie en JavaScript) : les cases a cocher et les query strings ont donc
// besoin de leur propre lecture.
const booleen = z
  .union([z.boolean(), z.string()])
  .transform((valeur) =>
    typeof valeur === 'boolean' ? valeur : ['true', '1', 'on', 'oui'].includes(valeur.toLowerCase()),
  );

export const schemaListe = z.object({
  recherche: z.string().trim().max(120).optional(),
  categorie: z.coerce.number().int().positive().optional(),
  prixMin: z.coerce.number().min(0).optional(),
  prixMax: z.coerce.number().min(0).optional(),
  tri: z.enum(Object.keys(TRIS)).default('recent'),
  page: z.coerce.number().int().min(1).default(1),
  parPage: z.coerce.number().int().min(1).max(60).default(12),
  inclureInactifs: booleen.default(false),
});

const schemaProduitBase = {
  nom: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caracteres.').max(150),
  description: z.string().trim().max(2000).default(''),
  prix: z.coerce.number().min(0, 'Le prix ne peut pas etre negatif.'),
  stock: z.coerce.number().int().min(0).default(0),
  categorieId: z.coerce.number().int().positive().nullable().optional(),
  image: z.string().trim().max(300).optional(),
  actif: booleen.default(true),
};

export const schemaCreation = z.object(schemaProduitBase);
export const schemaModification = z.object(schemaProduitBase).partial();

// Le formulaire d'administration envoie du multipart (a cause du fichier image) :
// les champs y arrivent en chaines, zod les reconvertit via coerce.
function normaliserCorps(req) {
  const corps = { ...req.body };
  if (req.file) corps.image = `/uploads/${req.file.filename}`;
  if (corps.categorieId === '' || corps.categorieId === 'null') corps.categorieId = null;
  return corps;
}

async function supprimerFichier(chemin) {
  // Seules les images televersees sont supprimables : celles du dossier
  // /images sont des ressources du projet, partagees par plusieurs produits.
  if (!chemin?.startsWith('/uploads/')) return;
  try {
    await unlink(join(DOSSIER_TELEVERSEMENTS, chemin.replace('/uploads/', '')));
  } catch {
    // Fichier deja absent : sans consequence.
  }
}

export async function lister(req, res) {
  const { recherche, categorie, prixMin, prixMax, tri, page, parPage, inclureInactifs } = req.donneesValidees;

  // Les filtres sont assembles en parametres numerotes ($1, $2...) :
  // aucune valeur utilisateur n'entre dans le texte SQL.
  const conditions = [];
  const parametres = [];

  // Seul un administrateur peut demander a voir les produits desactives.
  const admin = req.utilisateur?.role === 'admin';
  if (!admin || !inclureInactifs) conditions.push('p.actif = TRUE');

  if (recherche) {
    parametres.push(`%${recherche}%`);
    conditions.push(`(p.nom ILIKE $${parametres.length} OR p.description ILIKE $${parametres.length})`);
  }
  if (categorie) {
    parametres.push(categorie);
    conditions.push(`p.categorie_id = $${parametres.length}`);
  }
  if (prixMin !== undefined) {
    parametres.push(prixMin);
    conditions.push(`p.prix >= $${parametres.length}`);
  }
  if (prixMax !== undefined) {
    parametres.push(prixMax);
    conditions.push(`p.prix <= $${parametres.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const decalage = (page - 1) * parPage;

  const { total } = await uneLigne(`SELECT count(*)::int AS total FROM produits p ${where}`, parametres);

  const resultats = await lignes(
    `SELECT p.id, p.nom, p.description, p.prix, p.image, p.stock, p.actif, p.cree_le,
            p.categorie_id, c.nom AS categorie_nom
     FROM produits p
     LEFT JOIN categories c ON c.id = p.categorie_id
     ${where}
     ORDER BY ${TRIS[tri]}
     LIMIT $${parametres.length + 1} OFFSET $${parametres.length + 2}`,
    [...parametres, parPage, decalage],
  );

  res.json({
    produits: resultats,
    pagination: { page, parPage, total, pages: Math.max(1, Math.ceil(total / parPage)) },
  });
}

export async function detail(req, res) {
  const produit = await uneLigne(
    `SELECT p.id, p.nom, p.description, p.prix, p.image, p.stock, p.actif, p.cree_le,
            p.categorie_id, c.nom AS categorie_nom
     FROM produits p
     LEFT JOIN categories c ON c.id = p.categorie_id
     WHERE p.id = $1`,
    [req.params.id],
  );

  if (!produit) throw ErreurHttp.introuvable('Produit introuvable.');
  if (!produit.actif && req.utilisateur?.role !== 'admin') {
    throw ErreurHttp.introuvable('Produit introuvable.');
  }

  res.json({ produit });
}

export async function creer(req, res) {
  const donnees = schemaCreation.parse(normaliserCorps(req));

  const produit = await uneLigne(
    `INSERT INTO produits (categorie_id, nom, description, prix, image, stock, actif)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      donnees.categorieId ?? null,
      donnees.nom,
      donnees.description,
      donnees.prix,
      donnees.image ?? null,
      donnees.stock,
      donnees.actif,
    ],
  );

  res.status(201).json({ produit });
}

export async function modifier(req, res) {
  const donnees = schemaModification.parse(normaliserCorps(req));

  const existant = await uneLigne('SELECT * FROM produits WHERE id = $1', [req.params.id]);
  if (!existant) throw ErreurHttp.introuvable('Produit introuvable.');

  const produit = await uneLigne(
    `UPDATE produits SET
       categorie_id = $1, nom = $2, description = $3, prix = $4,
       image = $5, stock = $6, actif = $7
     WHERE id = $8
     RETURNING *`,
    [
      donnees.categorieId === undefined ? existant.categorie_id : donnees.categorieId,
      donnees.nom ?? existant.nom,
      donnees.description ?? existant.description,
      donnees.prix ?? existant.prix,
      donnees.image ?? existant.image,
      donnees.stock ?? existant.stock,
      donnees.actif ?? existant.actif,
      req.params.id,
    ],
  );

  // L'ancienne image televersee devient orpheline des qu'elle est remplacee.
  if (donnees.image && donnees.image !== existant.image) await supprimerFichier(existant.image);

  res.json({ produit });
}

export async function supprimer(req, res) {
  const produit = await uneLigne('DELETE FROM produits WHERE id = $1 RETURNING *', [req.params.id]);
  if (!produit) throw ErreurHttp.introuvable('Produit introuvable.');

  await supprimerFichier(produit.image);
  res.json({ message: 'Produit supprime.' });
}
