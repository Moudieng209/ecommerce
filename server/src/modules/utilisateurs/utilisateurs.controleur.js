import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { lignes, uneLigne } from '../../config/db.js';
import { ErreurHttp } from '../../utils/ErreurHttp.js';

// Gestion des comptes par l'administration (clients et administrateurs).

const CHAMPS_PUBLICS = 'id, prenom, nom, email, telephone, role, actif, cree_le';

export const schemaListe = z.object({
  role: z.enum(['client', 'admin']).optional(),
  recherche: z.string().trim().max(120).optional(),
});

export const schemaCreation = z.object({
  prenom: z.string().trim().min(2).max(60),
  nom: z.string().trim().min(2).max(60),
  email: z.email('Adresse email invalide.').trim().toLowerCase(),
  telephone: z.string().trim().max(30).optional().or(z.literal('')),
  motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caracteres.').max(100),
  role: z.enum(['client', 'admin']).default('client'),
});

export const schemaModification = z.object({
  prenom: z.string().trim().min(2).max(60),
  nom: z.string().trim().min(2).max(60),
  telephone: z.string().trim().max(30).optional().or(z.literal('')),
  role: z.enum(['client', 'admin']),
  actif: z.boolean().default(true),
  motDePasse: z.string().min(8).max(100).optional().or(z.literal('')),
});

export async function lister(req, res) {
  const { role, recherche } = req.donneesValidees;

  const conditions = [];
  const parametres = [];

  if (role) {
    parametres.push(role);
    conditions.push(`role = $${parametres.length}`);
  }
  if (recherche) {
    parametres.push(`%${recherche}%`);
    conditions.push(
      `(prenom ILIKE $${parametres.length} OR nom ILIKE $${parametres.length} OR email ILIKE $${parametres.length})`,
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const utilisateurs = await lignes(
    `SELECT ${CHAMPS_PUBLICS},
            (SELECT count(*)::int FROM commandes c WHERE c.utilisateur_id = u.id) AS nombre_commandes
     FROM utilisateurs u ${where} ORDER BY cree_le DESC`,
    parametres,
  );

  res.json({ utilisateurs });
}

export async function creer(req, res) {
  const { prenom, nom, email, telephone, motDePasse, role } = req.body;

  const existant = await uneLigne('SELECT id FROM utilisateurs WHERE lower(email) = lower($1)', [email]);
  if (existant) throw ErreurHttp.conflit('Un compte existe deja avec cette adresse email.');

  const utilisateur = await uneLigne(
    `INSERT INTO utilisateurs (prenom, nom, email, telephone, mot_de_passe, role)
     VALUES ($1, $2, $3, NULLIF($4, ''), $5, $6)
     RETURNING ${CHAMPS_PUBLICS}`,
    [prenom, nom, email, telephone ?? '', await bcrypt.hash(motDePasse, 12), role],
  );

  res.status(201).json({ utilisateur });
}

export async function modifier(req, res) {
  const { prenom, nom, telephone, role, actif, motDePasse } = req.body;
  const cible = Number(req.params.id);

  // Un administrateur ne peut ni se retrograder ni se desactiver lui-meme :
  // ce serait le moyen le plus simple de se verrouiller hors du back-office.
  if (cible === req.utilisateur.id && (role !== 'admin' || actif === false)) {
    throw ErreurHttp.requeteInvalide('Vous ne pouvez pas retirer vos propres droits d administration.');
  }

  const empreinte = motDePasse ? await bcrypt.hash(motDePasse, 12) : null;

  const utilisateur = await uneLigne(
    `UPDATE utilisateurs SET
       prenom = $1, nom = $2, telephone = NULLIF($3, ''), role = $4, actif = $5,
       mot_de_passe = COALESCE($6, mot_de_passe)
     WHERE id = $7
     RETURNING ${CHAMPS_PUBLICS}`,
    [prenom, nom, telephone ?? '', role, actif, empreinte, cible],
  );

  if (!utilisateur) throw ErreurHttp.introuvable('Utilisateur introuvable.');
  res.json({ utilisateur });
}

export async function supprimer(req, res) {
  const cible = Number(req.params.id);
  if (cible === req.utilisateur.id) {
    throw ErreurHttp.requeteInvalide('Vous ne pouvez pas supprimer votre propre compte.');
  }

  const utilisateur = await uneLigne('DELETE FROM utilisateurs WHERE id = $1 RETURNING id', [cible]);
  if (!utilisateur) throw ErreurHttp.introuvable('Utilisateur introuvable.');

  res.json({ message: 'Compte supprime.' });
}
