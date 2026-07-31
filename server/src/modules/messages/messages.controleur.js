import { z } from 'zod';
import { lignes, uneLigne } from '../../config/db.js';
import { ErreurHttp } from '../../utils/ErreurHttp.js';

export const schemaMessage = z.object({
  prenom: z.string().trim().min(2, 'Le prenom est requis.').max(60),
  nom: z.string().trim().min(2, 'Le nom est requis.').max(60),
  email: z.email('Adresse email invalide.').trim().toLowerCase(),
  telephone: z.string().trim().max(30).optional().or(z.literal('')),
  contenu: z.string().trim().min(10, 'Le message doit contenir au moins 10 caracteres.').max(3000),
});

export async function envoyer(req, res) {
  const { prenom, nom, email, telephone, contenu } = req.body;

  const message = await uneLigne(
    `INSERT INTO messages (prenom, nom, email, telephone, contenu)
     VALUES ($1, $2, $3, NULLIF($4, ''), $5)
     RETURNING id, cree_le`,
    [prenom, nom, email, telephone ?? '', contenu],
  );

  res.status(201).json({ message: 'Votre message a bien ete envoye.', reference: message.id });
}

export async function lister(req, res) {
  const messages = await lignes('SELECT * FROM messages ORDER BY cree_le DESC');
  const { non_lus: nonLus } = await uneLigne('SELECT count(*)::int AS non_lus FROM messages WHERE NOT lu');

  res.json({ messages, nonLus });
}

export async function marquerLu(req, res) {
  const message = await uneLigne('UPDATE messages SET lu = NOT lu WHERE id = $1 RETURNING *', [
    req.params.id,
  ]);

  if (!message) throw ErreurHttp.introuvable('Message introuvable.');
  res.json({ message });
}

export async function supprimer(req, res) {
  const message = await uneLigne('DELETE FROM messages WHERE id = $1 RETURNING id', [req.params.id]);
  if (!message) throw ErreurHttp.introuvable('Message introuvable.');

  res.json({ message: 'Message supprime.' });
}
