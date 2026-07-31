import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/client';
import Revelation from '../../components/Revelation';
import { Bouton, CLASSES_SAISIE, Chargement, EtatVide, ImageProduit } from '../../components/ui';
import { useNotifications } from '../../contexts/NotificationContext';
import { COULEURS_STATUT, LIBELLES_STATUT, dateHeure, prix as formaterPrix } from '../../utils/format';

// Suivi des commandes : filtre par statut, recherche, changement d'etat et
// suppression. L'annulation restitue le stock cote serveur.

const STATUTS = ['En attente', 'Validee', 'Expediee', 'Livree', 'Annulee'];

export default function AdminCommandes() {
  const { succes, erreur: notifierErreur } = useNotifications();

  const [commandes, setCommandes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [chargement, setChargement] = useState(true);
  const [statut, setStatut] = useState('');
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [ouverte, setOuverte] = useState(null);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const requete = new URLSearchParams({ page: String(page), parPage: '20' });
      if (statut) requete.set('statut', statut);
      if (recherche) requete.set('recherche', recherche);

      const donnees = await api.get(`/commandes/toutes?${requete}`);
      setCommandes(donnees.commandes);
      setPagination(donnees.pagination);
    } catch (erreur) {
      notifierErreur(erreur.message);
    } finally {
      setChargement(false);
    }
  }, [statut, recherche, page, notifierErreur]);

  useEffect(() => {
    const minuterie = setTimeout(charger, 300);
    return () => clearTimeout(minuterie);
  }, [charger]);

  async function changerStatut(commande, nouveauStatut) {
    try {
      const donnees = await api.patch(`/commandes/${commande.id}/statut`, { statut: nouveauStatut });
      setCommandes((precedentes) =>
        precedentes.map((element) =>
          element.id === commande.id ? { ...element, statut: donnees.commande.statut } : element,
        ),
      );
      succes(`Commande ${commande.reference} : ${LIBELLES_STATUT[nouveauStatut]}.`);
    } catch (erreur) {
      notifierErreur(erreur.message);
    }
  }

  async function supprimer(commande) {
    if (!window.confirm(`Supprimer définitivement la commande ${commande.reference} ?`)) return;

    try {
      await api.delete(`/commandes/${commande.id}`);
      succes('Commande supprimée.');
      charger();
    } catch (erreur) {
      notifierErreur(erreur.message);
    }
  }

  return (
    <div className="space-y-6">
      <Revelation>
        <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">Commandes</h1>
        <p className="mt-1.5 text-sm text-on-surface-variant">
          {pagination.total} commande{pagination.total > 1 ? 's' : ''} enregistrée
          {pagination.total > 1 ? 's' : ''}.
        </p>
      </Revelation>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-64 flex-1">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
            search
          </span>
          <input
            type="search"
            value={recherche}
            onChange={(evenement) => {
              setRecherche(evenement.target.value);
              setPage(1);
            }}
            placeholder="Référence, nom ou email du client…"
            aria-label="Rechercher une commande"
            className="h-11 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-3 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none"
          />
        </div>

        <select
          value={statut}
          onChange={(evenement) => {
            setStatut(evenement.target.value);
            setPage(1);
          }}
          aria-label="Filtrer par statut"
          className={`${CLASSES_SAISIE} mt-0 h-11 w-48 bg-surface-container-lowest py-0`}
        >
          <option value="">Tous les statuts</option>
          {STATUTS.map((element) => (
            <option key={element} value={element}>
              {LIBELLES_STATUT[element]}
            </option>
          ))}
        </select>
      </div>

      {chargement ? (
        <Chargement />
      ) : commandes.length === 0 ? (
        <EtatVide
          icone="receipt_long"
          titre="Aucune commande"
          texte="Les commandes passées par vos clients apparaîtront ici."
        />
      ) : (
        <div className="space-y-3">
          {commandes.map((commande, index) => {
            const estOuverte = ouverte === commande.id;

            return (
              <Revelation
                key={commande.id}
                delai={Math.min(index, 6) * 60}
                className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest"
              >
                <div className="flex flex-wrap items-center gap-4 p-4">
                  <button
                    type="button"
                    onClick={() => setOuverte(estOuverte ? null : commande.id)}
                    aria-expanded={estOuverte}
                    aria-label="Afficher le détail"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] transition-transform duration-300 motion-reduce:transition-none ${
                        estOuverte ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  <div className="min-w-40 flex-1">
                    <p className="font-extrabold text-on-surface">{commande.reference}</p>
                    <p className="mt-0.5 truncate text-xs text-on-surface-variant">
                      {commande.prenom} {commande.nom} · {commande.email}
                    </p>
                  </div>

                  <div className="hidden text-xs text-on-surface-variant sm:block">
                    {dateHeure(commande.cree_le)}
                  </div>

                  <p className="font-extrabold text-primary">{formaterPrix(commande.total)}</p>

                  <select
                    value={commande.statut}
                    onChange={(evenement) => changerStatut(commande, evenement.target.value)}
                    aria-label={`Statut de la commande ${commande.reference}`}
                    className={`h-9 rounded-lg border-0 px-2 text-xs font-bold focus:outline-none ${
                      COULEURS_STATUT[commande.statut]
                    }`}
                  >
                    {STATUTS.map((element) => (
                      <option key={element} value={element} className="bg-surface-container-lowest text-on-surface">
                        {LIBELLES_STATUT[element]}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => supprimer(commande)}
                    aria-label={`Supprimer la commande ${commande.reference}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                    estOuverte ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-3 border-t border-outline-variant/60 bg-surface-container-low/40 p-4">
                      {commande.lignes.map((ligne) => (
                        <div key={ligne.id} className="flex items-center gap-3">
                          <ImageProduit
                            chemin={ligne.image}
                            alt={ligne.nom_produit}
                            className="h-12 w-12 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-on-surface">
                              {ligne.nom_produit}
                            </p>
                            <p className="text-xs text-on-surface-variant">
                              {formaterPrix(ligne.prix_unitaire)} × {ligne.quantite}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-on-surface">
                            {formaterPrix(ligne.sous_total)}
                          </p>
                        </div>
                      ))}

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-outline-variant/60 pt-3 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            location_on
                          </span>
                          {commande.adresse_livraison ?? 'Adresse non renseignée'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-primary">call</span>
                          {commande.telephone ?? '—'}
                        </span>
                        <span className="ml-auto">
                          Sous-total {formaterPrix(commande.sous_total)} + livraison{' '}
                          {formaterPrix(commande.frais_livraison)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Revelation>
            );
          })}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Bouton
                variante="secondaire"
                taille="sm"
                icone="chevron_left"
                disabled={page <= 1}
                onClick={() => setPage((precedent) => precedent - 1)}
              >
                Précédent
              </Bouton>

              <span className="text-sm text-on-surface-variant">
                Page {page} sur {pagination.pages}
              </span>

              <Bouton
                variante="secondaire"
                taille="sm"
                iconeApres="chevron_right"
                disabled={page >= pagination.pages}
                onClick={() => setPage((precedent) => precedent + 1)}
              >
                Suivant
              </Bouton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
