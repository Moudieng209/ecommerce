import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import Revelation from '../components/Revelation';
import { Bouton, Chargement, EtatVide, ImageProduit, Pastille } from '../components/ui';
import { useConfirmation } from '../contexts/ConfirmationContext';
import { useNotifications } from '../contexts/NotificationContext';
import { COULEURS_STATUT, LIBELLES_STATUT, dateHeure, prix as formaterPrix } from '../utils/format';

// Historique des commandes du client, avec le detail des articles — impossible
// dans la version PHP, qui ne conservait que le montant total.

const ETAPES_SUIVI = ['En attente', 'Validee', 'Expediee', 'Livree'];

export default function Commandes() {
  const { succes, erreur: notifierErreur } = useNotifications();
  const confirmer = useConfirmation();

  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [ouverte, setOuverte] = useState(null);

  useEffect(() => {
    api
      .get('/commandes/mes-commandes')
      .then((donnees) => setCommandes(donnees.commandes))
      .catch(() => setCommandes([]))
      .finally(() => setChargement(false));
  }, []);

  async function annuler(commande) {
    const valide = await confirmer({
      titre: 'Annuler cette commande ?',
      message: `La commande ${commande.reference} sera annulée et les articles retourneront en stock.`,
      libelleConfirmer: 'Annuler la commande',
      libelleAnnuler: 'Conserver',
    });
    if (!valide) return;

    try {
      const donnees = await api.post(`/commandes/${commande.id}/annuler`);
      setCommandes((precedentes) =>
        precedentes.map((element) =>
          element.id === commande.id ? { ...element, statut: donnees.commande.statut } : element,
        ),
      );
      succes('Commande annulée. Les articles sont retournés en stock.');
    } catch (erreur) {
      notifierErreur(erreur.message);
    }
  }

  if (chargement) return <Chargement libelle="Chargement de vos commandes…" />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
      <Revelation>
        <span className="text-sm font-bold uppercase tracking-wider text-primary">Votre historique</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
          Mes commandes
        </h1>
        <p className="mt-3 text-on-surface-variant">
          Suivez l’avancement de vos commandes et consultez le détail de chaque livraison.
        </p>
      </Revelation>

      {commandes.length === 0 ? (
        <div className="mt-10">
          <EtatVide
            icone="receipt_long"
            titre="Aucune commande pour l’instant"
            texte="Dès que vous validerez un panier, votre commande apparaîtra ici avec son suivi."
            action={
              <Link to="/produits">
                <Bouton iconeApres="arrow_forward">Découvrir le catalogue</Bouton>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {commandes.map((commande, index) => {
            const estOuverte = ouverte === commande.id;
            const annulee = commande.statut === 'Annulee';
            const etapeCourante = ETAPES_SUIVI.indexOf(commande.statut);

            return (
              <Revelation
                key={commande.id}
                delai={index * 70}
                className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="font-extrabold text-on-surface">{commande.reference}</h2>
                      <Pastille className={COULEURS_STATUT[commande.statut]}>
                        {LIBELLES_STATUT[commande.statut]}
                      </Pastille>
                    </div>
                    <p className="mt-1.5 text-xs text-on-surface-variant">
                      Passée le {dateHeure(commande.cree_le)} · {commande.lignes.length} article
                      {commande.lignes.length > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-xl font-extrabold text-primary">{formaterPrix(commande.total)}</p>

                    <button
                      type="button"
                      onClick={() => setOuverte(estOuverte ? null : commande.id)}
                      aria-expanded={estOuverte}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-low"
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] transition-transform duration-300 motion-reduce:transition-none ${
                          estOuverte ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                  </div>
                </div>

                {/* Suivi visuel : la barre s'arrete a l'etape atteinte. */}
                {!annulee && (
                  <div className="border-t border-outline-variant/60 px-5 py-4">
                    <ol className="flex items-center gap-1">
                      {ETAPES_SUIVI.map((etape, position) => {
                        const atteinte = position <= etapeCourante;

                        return (
                          <li key={etape} className="flex flex-1 items-center gap-1">
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[14px] transition-colors ${
                                atteinte
                                  ? 'bg-primary text-on-primary'
                                  : 'bg-surface-container text-outline'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {atteinte ? 'check' : 'radio_button_unchecked'}
                              </span>
                            </span>

                            <span
                              className={`hidden text-[11px] font-semibold sm:block ${
                                atteinte ? 'text-on-surface' : 'text-outline'
                              }`}
                            >
                              {LIBELLES_STATUT[etape]}
                            </span>

                            {position < ETAPES_SUIVI.length - 1 && (
                              <span
                                className={`h-0.5 flex-1 rounded-full ${
                                  position < etapeCourante ? 'bg-primary' : 'bg-outline-variant/60'
                                }`}
                              />
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                    estOuverte ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-3 border-t border-outline-variant/60 bg-surface-container-low/40 p-5">
                      {commande.lignes.map((ligne) => (
                        <div key={ligne.id} className="flex items-center gap-3">
                          <ImageProduit
                            chemin={ligne.image}
                            alt={ligne.nom_produit}
                            className="h-14 w-14 shrink-0 rounded-lg object-cover"
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

                      <dl className="space-y-1.5 border-t border-outline-variant/60 pt-3 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-on-surface-variant">Sous-total</dt>
                          <dd className="font-semibold">{formaterPrix(commande.sous_total)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-on-surface-variant">Livraison</dt>
                          <dd className="font-semibold">{formaterPrix(commande.frais_livraison)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-bold">Total</dt>
                          <dd className="font-extrabold text-primary">{formaterPrix(commande.total)}</dd>
                        </div>
                      </dl>

                      {commande.adresse_livraison && (
                        <p className="flex items-start gap-2 border-t border-outline-variant/60 pt-3 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            location_on
                          </span>
                          {commande.adresse_livraison} · {commande.telephone}
                        </p>
                      )}

                      {commande.statut === 'En attente' && (
                        <div className="pt-2">
                          <Bouton variante="secondaire" taille="sm" icone="cancel" onClick={() => annuler(commande)}>
                            Annuler cette commande
                          </Bouton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Revelation>
            );
          })}
        </div>
      )}
    </div>
  );
}
