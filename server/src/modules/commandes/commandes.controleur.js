import { z } from 'zod';
import { lignes, transaction, uneLigne } from '../../config/db.js';
import { config } from '../../config/env.js';
import { ErreurHttp } from '../../utils/ErreurHttp.js';

export const STATUTS = ['En attente', 'Validee', 'Expediee', 'Livree', 'Annulee'];

export const schemaValidation = z.object({
  adresseLivraison: z.string().trim().min(5, 'Indiquez une adresse de livraison.').max(300),
  telephone: z.string().trim().min(6, 'Indiquez un numero de telephone.').max(30),
});

export const schemaStatut = z.object({
  statut: z.enum(STATUTS),
});

export const schemaListeAdmin = z.object({
  statut: z.enum(STATUTS).optional(),
  recherche: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  parPage: z.coerce.number().int().min(1).max(100).default(20),
});

async function chargerLignes(commandeIds) {
  if (commandeIds.length === 0) return new Map();

  const toutesLignes = await lignes(
    `SELECT id, commande_id, produit_id, nom_produit, image, prix_unitaire, quantite, sous_total
     FROM commande_lignes WHERE commande_id = ANY($1::int[]) ORDER BY id`,
    [commandeIds],
  );

  const parCommande = new Map();
  for (const ligne of toutesLignes) {
    if (!parCommande.has(ligne.commande_id)) parCommande.set(ligne.commande_id, []);
    parCommande.get(ligne.commande_id).push(ligne);
  }
  return parCommande;
}

/**
 * Transforme le panier en commande.
 * Tout se fait dans une transaction : sans elle, une erreur en cours de route
 * laisserait une commande sans lignes ou un stock decremente pour rien.
 */
export async function passerCommande(req, res) {
  const { adresseLivraison, telephone } = req.body;
  const utilisateurId = req.utilisateur.id;

  const commande = await transaction(async (client) => {
    // FOR UPDATE verrouille les produits du panier : deux commandes simultanees
    // sur le dernier article ne peuvent pas passer toutes les deux.
    const { rows: articles } = await client.query(
      `SELECT pl.produit_id, pl.quantite, p.nom, p.prix, p.image, p.stock, p.actif
       FROM panier_lignes pl
       JOIN produits p ON p.id = pl.produit_id
       WHERE pl.utilisateur_id = $1
       ORDER BY pl.produit_id
       FOR UPDATE OF p`,
      [utilisateurId],
    );

    if (articles.length === 0) throw ErreurHttp.requeteInvalide('Votre panier est vide.');

    const indisponible = articles.find((article) => !article.actif);
    if (indisponible) {
      throw ErreurHttp.conflit(`Le produit « ${indisponible.nom} » n est plus disponible.`);
    }

    const stockInsuffisant = articles.find(
      (article) => article.stock > 0 && article.quantite > article.stock,
    );
    if (stockInsuffisant) {
      throw ErreurHttp.conflit(
        `Stock insuffisant pour « ${stockInsuffisant.nom} » : ${stockInsuffisant.stock} restant(s).`,
      );
    }

    const sousTotal = articles.reduce((somme, a) => somme + Number(a.prix) * a.quantite, 0);
    const fraisLivraison = config.boutique.fraisLivraison;

    // La reference lisible (CMD-2026-00012) contient l'identifiant, qui n'existe
    // qu'une fois la ligne inseree. Deux instructions sont donc necessaires : une
    // CTE ne conviendrait pas, l'UPDATE d'une instruction ne voyant pas les lignes
    // que sa propre CTE vient d'inserer. La transaction garantit l'ensemble.
    const { rows: inserees } = await client.query(
      `INSERT INTO commandes
         (reference, utilisateur_id, sous_total, frais_livraison, total, adresse_livraison, telephone)
       VALUES ('provisoire-' || gen_random_uuid(), $1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [utilisateurId, sousTotal, fraisLivraison, sousTotal + fraisLivraison, adresseLivraison, telephone],
    );

    const { rows: referencees } = await client.query(
      `UPDATE commandes
       SET reference = 'CMD-' || to_char(cree_le, 'YYYY') || '-' || lpad(id::text, 5, '0')
       WHERE id = $1
       RETURNING *`,
      [inserees[0].id],
    );

    const nouvelleCommande = referencees[0];

    for (const article of articles) {
      await client.query(
        `INSERT INTO commande_lignes (commande_id, produit_id, nom_produit, image, prix_unitaire, quantite)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [nouvelleCommande.id, article.produit_id, article.nom, article.image, article.prix, article.quantite],
      );

      // Le stock illimite est represente par 0 : on ne le decremente pas.
      if (article.stock > 0) {
        await client.query('UPDATE produits SET stock = stock - $1 WHERE id = $2', [
          article.quantite,
          article.produit_id,
        ]);
      }
    }

    await client.query('DELETE FROM panier_lignes WHERE utilisateur_id = $1', [utilisateurId]);

    const { rows: lignesCommande } = await client.query(
      'SELECT * FROM commande_lignes WHERE commande_id = $1 ORDER BY id',
      [nouvelleCommande.id],
    );

    return { ...nouvelleCommande, lignes: lignesCommande };
  });

  res.status(201).json({ commande });
}

export async function mesCommandes(req, res) {
  const commandes = await lignes(
    'SELECT * FROM commandes WHERE utilisateur_id = $1 ORDER BY cree_le DESC',
    [req.utilisateur.id],
  );

  const parCommande = await chargerLignes(commandes.map((c) => c.id));
  res.json({
    commandes: commandes.map((commande) => ({ ...commande, lignes: parCommande.get(commande.id) ?? [] })),
  });
}

export async function detail(req, res) {
  const commande = await uneLigne(
    `SELECT c.*, u.prenom, u.nom, u.email
     FROM commandes c JOIN utilisateurs u ON u.id = c.utilisateur_id
     WHERE c.id = $1`,
    [req.params.id],
  );

  if (!commande) throw ErreurHttp.introuvable('Commande introuvable.');

  // Un client ne peut consulter que ses propres commandes.
  if (req.utilisateur.role !== 'admin' && commande.utilisateur_id !== req.utilisateur.id) {
    throw ErreurHttp.interdit('Cette commande ne vous appartient pas.');
  }

  const lignesCommande = await lignes(
    'SELECT * FROM commande_lignes WHERE commande_id = $1 ORDER BY id',
    [commande.id],
  );

  res.json({ commande: { ...commande, lignes: lignesCommande } });
}

export async function annuler(req, res) {
  const commande = await transaction(async (client) => {
    const { rows } = await client.query('SELECT * FROM commandes WHERE id = $1 FOR UPDATE', [req.params.id]);
    const existante = rows[0];

    if (!existante) throw ErreurHttp.introuvable('Commande introuvable.');
    if (req.utilisateur.role !== 'admin' && existante.utilisateur_id !== req.utilisateur.id) {
      throw ErreurHttp.interdit('Cette commande ne vous appartient pas.');
    }
    if (existante.statut === 'Annulee') throw ErreurHttp.conflit('Cette commande est deja annulee.');
    if (existante.statut !== 'En attente' && req.utilisateur.role !== 'admin') {
      throw ErreurHttp.conflit('Une commande deja traitee ne peut plus etre annulee en ligne.');
    }

    // Le stock reserve retourne au catalogue.
    await client.query(
      `UPDATE produits p
       SET stock = p.stock + cl.quantite
       FROM commande_lignes cl
       WHERE cl.commande_id = $1 AND cl.produit_id = p.id AND p.stock > 0`,
      [existante.id],
    );

    const { rows: misesAJour } = await client.query(
      `UPDATE commandes SET statut = 'Annulee' WHERE id = $1 RETURNING *`,
      [existante.id],
    );

    return misesAJour[0];
  });

  res.json({ commande });
}

// --- Administration ---

export async function listerToutes(req, res) {
  const { statut, recherche, page, parPage } = req.donneesValidees;

  const conditions = [];
  const parametres = [];

  if (statut) {
    parametres.push(statut);
    conditions.push(`c.statut = $${parametres.length}`);
  }
  if (recherche) {
    parametres.push(`%${recherche}%`);
    conditions.push(
      `(c.reference ILIKE $${parametres.length} OR u.nom ILIKE $${parametres.length}
        OR u.prenom ILIKE $${parametres.length} OR u.email ILIKE $${parametres.length})`,
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { total } = await uneLigne(
    `SELECT count(*)::int AS total FROM commandes c JOIN utilisateurs u ON u.id = c.utilisateur_id ${where}`,
    parametres,
  );

  const commandes = await lignes(
    `SELECT c.*, u.prenom, u.nom, u.email
     FROM commandes c JOIN utilisateurs u ON u.id = c.utilisateur_id
     ${where}
     ORDER BY c.cree_le DESC
     LIMIT $${parametres.length + 1} OFFSET $${parametres.length + 2}`,
    [...parametres, parPage, (page - 1) * parPage],
  );

  const parCommande = await chargerLignes(commandes.map((c) => c.id));

  res.json({
    commandes: commandes.map((commande) => ({ ...commande, lignes: parCommande.get(commande.id) ?? [] })),
    pagination: { page, parPage, total, pages: Math.max(1, Math.ceil(total / parPage)) },
  });
}

export async function changerStatut(req, res) {
  const { statut } = req.body;

  // L'annulation passe par la route dediee, qui restitue le stock.
  if (statut === 'Annulee') {
    return annuler(req, res);
  }

  const commande = await uneLigne('UPDATE commandes SET statut = $1 WHERE id = $2 RETURNING *', [
    statut,
    req.params.id,
  ]);

  if (!commande) throw ErreurHttp.introuvable('Commande introuvable.');
  return res.json({ commande });
}

export async function supprimer(req, res) {
  const commande = await uneLigne('DELETE FROM commandes WHERE id = $1 RETURNING id', [req.params.id]);
  if (!commande) throw ErreurHttp.introuvable('Commande introuvable.');

  res.json({ message: 'Commande supprimee.' });
}
