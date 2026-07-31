import { lignes, uneLigne } from '../../config/db.js';

// Tableau de bord de l'administration : le back-office PHP n'affichait que des
// liens, l'API fournit ici de vrais indicateurs.

export async function tableauDeBord(req, res) {
  const [totaux, parStatut, dernieresCommandes, meilleursProduits, ventesParJour, stockFaible] =
    await Promise.all([
      uneLigne(`
        SELECT
          (SELECT count(*)::int FROM produits WHERE actif)                    AS produits,
          (SELECT count(*)::int FROM utilisateurs WHERE role = 'client')      AS clients,
          (SELECT count(*)::int FROM categories)                             AS categories,
          (SELECT count(*)::int FROM commandes)                              AS commandes,
          (SELECT count(*)::int FROM messages WHERE NOT lu)                  AS messages_non_lus,
          (SELECT coalesce(sum(total), 0) FROM commandes WHERE statut <> 'Annulee') AS chiffre_affaires
      `),

      lignes(`
        SELECT statut, count(*)::int AS nombre, coalesce(sum(total), 0) AS montant
        FROM commandes GROUP BY statut ORDER BY statut
      `),

      lignes(`
        SELECT c.id, c.reference, c.total, c.statut, c.cree_le, u.prenom, u.nom, u.email
        FROM commandes c JOIN utilisateurs u ON u.id = c.utilisateur_id
        ORDER BY c.cree_le DESC LIMIT 5
      `),

      lignes(`
        SELECT cl.produit_id, cl.nom_produit, cl.image,
               sum(cl.quantite)::int AS quantite_vendue,
               sum(cl.sous_total)    AS chiffre_affaires
        FROM commande_lignes cl
        JOIN commandes c ON c.id = cl.commande_id
        WHERE c.statut <> 'Annulee'
        GROUP BY cl.produit_id, cl.nom_produit, cl.image
        ORDER BY quantite_vendue DESC
        LIMIT 5
      `),

      // Serie complete des 14 derniers jours, y compris les jours sans vente :
      // sinon le graphique du tableau de bord aurait des trous.
      lignes(`
        SELECT jour::date AS jour,
               coalesce(count(c.id), 0)::int AS commandes,
               coalesce(sum(c.total), 0)     AS montant
        FROM generate_series(current_date - interval '13 days', current_date, interval '1 day') AS jour
        LEFT JOIN commandes c
          ON c.cree_le::date = jour::date AND c.statut <> 'Annulee'
        GROUP BY jour
        ORDER BY jour
      `),

      lignes(`
        SELECT id, nom, stock, image FROM produits
        WHERE actif AND stock > 0 AND stock <= 5
        ORDER BY stock ASC LIMIT 5
      `),
    ]);

  res.json({
    totaux,
    parStatut,
    dernieresCommandes,
    meilleursProduits,
    ventesParJour,
    stockFaible,
  });
}
