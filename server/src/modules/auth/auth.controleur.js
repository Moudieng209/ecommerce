import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { uneLigne } from '../../config/db.js';
import { poserCookie, retirerCookie, signerJeton } from '../../middlewares/auth.js';
import { ErreurHttp } from '../../utils/ErreurHttp.js';

const CHAMPS_PUBLICS = 'id, prenom, nom, email, telephone, role, cree_le';

export const schemaInscription = z.object({
  prenom: z.string().trim().min(2, 'Le prenom doit contenir au moins 2 caracteres.').max(60),
  nom: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caracteres.').max(60),
  email: z.email('Adresse email invalide.').trim().toLowerCase(),
  telephone: z.string().trim().max(30).optional().or(z.literal('')),
  motDePasse: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caracteres.')
    .max(100)
    .regex(/[A-Za-z]/, 'Le mot de passe doit contenir au moins une lettre.')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre.'),
});

export const schemaConnexion = z.object({
  email: z.email('Adresse email invalide.').trim().toLowerCase(),
  motDePasse: z.string().min(1, 'Le mot de passe est requis.'),
});

export const schemaProfil = z.object({
  prenom: z.string().trim().min(2).max(60),
  nom: z.string().trim().min(2).max(60),
  telephone: z.string().trim().max(30).optional().or(z.literal('')),
});

export const schemaMotDePasse = z.object({
  ancienMotDePasse: z.string().min(1, 'Le mot de passe actuel est requis.'),
  nouveauMotDePasse: z
    .string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caracteres.')
    .max(100)
    .regex(/[A-Za-z]/, 'Le mot de passe doit contenir au moins une lettre.')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre.'),
});

export async function inscription(req, res) {
  const { prenom, nom, email, telephone, motDePasse } = req.body;

  const existant = await uneLigne('SELECT id FROM utilisateurs WHERE lower(email) = lower($1)', [email]);
  if (existant) throw ErreurHttp.conflit('Un compte existe deja avec cette adresse email.');

  // bcrypt avec sel et cout 12, la ou le code PHP stockait un simple MD5.
  const empreinte = await bcrypt.hash(motDePasse, 12);

  const utilisateur = await uneLigne(
    `INSERT INTO utilisateurs (prenom, nom, email, telephone, mot_de_passe, role)
     VALUES ($1, $2, $3, NULLIF($4, ''), $5, 'client')
     RETURNING ${CHAMPS_PUBLICS}`,
    [prenom, nom, email, telephone ?? '', empreinte],
  );

  poserCookie(res, signerJeton(utilisateur));
  res.status(201).json({ utilisateur });
}

export async function connexion(req, res) {
  const { email, motDePasse } = req.body;

  const compte = await uneLigne(
    'SELECT id, prenom, nom, email, telephone, role, actif, mot_de_passe FROM utilisateurs WHERE lower(email) = lower($1)',
    [email],
  );

  // Message identique que l'email soit inconnu ou le mot de passe faux :
  // sinon l'API permettrait d'enumerer les comptes existants.
  const messageGenerique = 'Email ou mot de passe incorrect.';
  if (!compte) {
    // Comparaison a vide malgre tout, pour que la reponse mette le meme temps
    // qu'avec un compte existant (pas de fuite par mesure du delai).
    await bcrypt.compare(motDePasse, '$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
    throw ErreurHttp.nonAuthentifie(messageGenerique);
  }

  const valide = await bcrypt.compare(motDePasse, compte.mot_de_passe);
  if (!valide) throw ErreurHttp.nonAuthentifie(messageGenerique);
  if (!compte.actif) throw ErreurHttp.interdit('Ce compte a ete desactive.');

  delete compte.mot_de_passe;
  delete compte.actif;

  poserCookie(res, signerJeton(compte));
  res.json({ utilisateur: compte });
}

export async function deconnexion(req, res) {
  retirerCookie(res);
  res.json({ message: 'Deconnexion effectuee.' });
}

export async function moi(req, res) {
  // Visiteur anonyme : « aucune session » est une reponse valide, pas une erreur.
  res.json({ utilisateur: req.utilisateur ?? null });
}

export async function majProfil(req, res) {
  const { prenom, nom, telephone } = req.body;

  const utilisateur = await uneLigne(
    `UPDATE utilisateurs SET prenom = $1, nom = $2, telephone = NULLIF($3, '')
     WHERE id = $4 RETURNING ${CHAMPS_PUBLICS}`,
    [prenom, nom, telephone ?? '', req.utilisateur.id],
  );

  res.json({ utilisateur });
}

export async function changerMotDePasse(req, res) {
  const { ancienMotDePasse, nouveauMotDePasse } = req.body;

  const compte = await uneLigne('SELECT mot_de_passe FROM utilisateurs WHERE id = $1', [req.utilisateur.id]);
  const valide = await bcrypt.compare(ancienMotDePasse, compte.mot_de_passe);
  if (!valide) throw ErreurHttp.requeteInvalide('Le mot de passe actuel est incorrect.');

  const empreinte = await bcrypt.hash(nouveauMotDePasse, 12);
  await uneLigne('UPDATE utilisateurs SET mot_de_passe = $1 WHERE id = $2 RETURNING id', [
    empreinte,
    req.utilisateur.id,
  ]);

  res.json({ message: 'Mot de passe mis a jour.' });
}
