import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import Revelation from '../../components/Revelation';
import { Chargement, ImageProduit, Pastille } from '../../components/ui';
import { COULEURS_STATUT, LIBELLES_STATUT, dateHeure, prix as formaterPrix } from '../../utils/format';

// Tableau de bord : indicateurs, ventes des 14 derniers jours, meilleures
// ventes et alertes de stock. Le graphique est dessine a la main plutot que
// d'ajouter une bibliotheque pour six barres.

export default function TableauDeBord() {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api
      .get('/statistiques')
      .then(setDonnees)
      .catch(() => setDonnees(null))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <Chargement libelle="Chargement des statistiques…" />;
  if (!donnees) return <p className="text-on-surface-variant">Statistiques indisponibles.</p>;

  const { totaux, parStatut, dernieresCommandes, meilleursProduits, ventesParJour, stockFaible } = donnees;

  const CARTES = [
    {
      libelle: 'Chiffre d’affaires',
      valeur: formaterPrix(totaux.chiffre_affaires),
      icone: 'payments',
      lien: '/admin/commandes',
    },
    { libelle: 'Commandes', valeur: totaux.commandes, icone: 'receipt_long', lien: '/admin/commandes' },
    { libelle: 'Produits actifs', valeur: totaux.produits, icone: 'inventory_2', lien: '/admin/produits' },
    { libelle: 'Clients', valeur: totaux.clients, icone: 'group', lien: '/admin/utilisateurs' },
    { libelle: 'Catégories', valeur: totaux.categories, icone: 'category', lien: '/admin/categories' },
    {
      libelle: 'Messages non lus',
      valeur: totaux.messages_non_lus,
      icone: 'mark_email_unread',
      lien: '/admin/messages',
      alerte: totaux.messages_non_lus > 0,
    },
  ];

  // Echelle du graphique : la barre la plus haute occupe toute la hauteur.
  const montantMaximum = Math.max(...ventesParJour.map((jour) => Number(jour.montant)), 1);

  return (
    <div className="space-y-6">
      <Revelation>
        <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">Tableau de bord</h1>
        <p className="mt-1.5 text-sm text-on-surface-variant">
          Vue d’ensemble de l’activité de la boutique.
        </p>
      </Revelation>

      {/* --- Indicateurs --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARTES.map((carte, index) => (
          <Revelation key={carte.libelle} delai={index * 60}>
            <Link
              to={carte.lien}
              className="group flex items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:transform-none ${
                  carte.alerte ? 'bg-error-container' : 'bg-primary-container'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[24px] ${
                    carte.alerte ? 'text-error' : 'text-primary'
                  }`}
                >
                  {carte.icone}
                </span>
              </span>

              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                  {carte.libelle}
                </span>
                <span className="block truncate text-xl font-extrabold text-on-surface">
                  {carte.valeur}
                </span>
              </span>
            </Link>
          </Revelation>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* --- Graphique des ventes --- */}
        <Revelation className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
          <h2 className="text-lg font-bold text-on-surface">Ventes des 14 derniers jours</h2>

          {/* h-full sur chaque colonne : une barre dimensionnee en pourcentage a
              besoin d'un parent dont la hauteur est connue, sinon elle reste a zero. */}
          <div className="mt-6 flex h-48 gap-1.5">
            {ventesParJour.map((jour) => {
              const hauteur = (Number(jour.montant) / montantMaximum) * 100;
              const libelleJour = new Date(jour.jour).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
              });

              return (
                <div key={jour.jour} className="group flex h-full flex-1 flex-col items-center gap-1.5">
                  <div className="relative flex w-full flex-1 items-end">
                    <div
                      style={{ height: `${Math.max(hauteur, 2)}%` }}
                      className="w-full rounded-t-md bg-primary/70 transition-colors group-hover:bg-primary"
                    />

                    {/* Infobulle au survol : evite d'afficher 14 montants a la fois. */}
                    <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-on-surface px-2 py-1 text-[10px] font-semibold text-surface opacity-0 transition-opacity group-hover:opacity-100">
                      {formaterPrix(jour.montant)} · {jour.commandes} cmd
                    </span>
                  </div>

                  <span className="text-[9px] text-on-surface-variant">{libelleJour}</span>
                </div>
              );
            })}
          </div>
        </Revelation>

        {/* --- Repartition par statut --- */}
        <Revelation delai={80} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
          <h2 className="text-lg font-bold text-on-surface">Commandes par statut</h2>

          {parStatut.length === 0 ? (
            <p className="mt-6 text-sm text-on-surface-variant">Aucune commande enregistrée.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {parStatut.map((ligne) => (
                <li key={ligne.statut} className="flex items-center justify-between gap-3">
                  <Pastille className={COULEURS_STATUT[ligne.statut]}>
                    {LIBELLES_STATUT[ligne.statut]}
                  </Pastille>
                  <span className="text-right">
                    <span className="block text-sm font-bold text-on-surface">{ligne.nombre}</span>
                    <span className="block text-[11px] text-on-surface-variant">
                      {formaterPrix(ligne.montant)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Revelation>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* --- Dernieres commandes --- */}
        <Revelation className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-on-surface">Dernières commandes</h2>
            <Link to="/admin/commandes" className="text-xs font-semibold text-primary hover:underline">
              Tout voir
            </Link>
          </div>

          {dernieresCommandes.length === 0 ? (
            <p className="mt-6 text-sm text-on-surface-variant">Aucune commande pour le moment.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {dernieresCommandes.map((commande) => (
                <li
                  key={commande.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low/60 px-3 py-2.5"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-on-surface">
                      {commande.reference}
                    </span>
                    <span className="block truncate text-[11px] text-on-surface-variant">
                      {commande.prenom} {commande.nom} · {dateHeure(commande.cree_le)}
                    </span>
                  </span>

                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-extrabold text-primary">
                      {formaterPrix(commande.total)}
                    </span>
                    <Pastille className={`mt-0.5 ${COULEURS_STATUT[commande.statut]}`}>
                      {LIBELLES_STATUT[commande.statut]}
                    </Pastille>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Revelation>

        {/* --- Meilleures ventes et alertes de stock --- */}
        <Revelation delai={80} className="space-y-6">
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="text-lg font-bold text-on-surface">Meilleures ventes</h2>

            {meilleursProduits.length === 0 ? (
              <p className="mt-6 text-sm text-on-surface-variant">Aucune vente enregistrée.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {meilleursProduits.map((produit, index) => (
                  <li key={`${produit.produit_id}-${produit.nom_produit}`} className="flex items-center gap-3">
                    <span className="w-5 shrink-0 text-sm font-extrabold text-primary/40">
                      {index + 1}
                    </span>
                    <ImageProduit
                      chemin={produit.image}
                      alt={produit.nom_produit}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-on-surface">
                        {produit.nom_produit}
                      </span>
                      <span className="block text-[11px] text-on-surface-variant">
                        {produit.quantite_vendue} vendu{produit.quantite_vendue > 1 ? 's' : ''}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-on-surface">
                      {formaterPrix(produit.chiffre_affaires)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {stockFaible.length > 0 && (
            <div className="rounded-2xl border border-error/30 bg-error-container/30 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-error">warning</span>
                Stocks faibles
              </h2>

              <ul className="mt-4 space-y-2">
                {stockFaible.map((produit) => (
                  <li key={produit.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-on-surface">{produit.nom}</span>
                    <Pastille className="bg-error text-on-error">
                      {produit.stock} restant{produit.stock > 1 ? 's' : ''}
                    </Pastille>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Revelation>
      </div>
    </div>
  );
}
