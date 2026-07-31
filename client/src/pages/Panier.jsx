import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Revelation from '../components/Revelation';
import { Bouton, Champ, Chargement, EtatVide, ImageProduit } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { usePanier } from '../contexts/PanierContext';
import { prix as formaterPrix } from '../utils/format';

// Panier et validation de commande. Le recapitulatif est calcule par le serveur :
// modifier les prix cote navigateur n'a donc aucun effet sur la commande reelle.

export default function Panier() {
  const { articles, resume, chargement, changerQuantite, retirer, vider, recharger } = usePanier();
  const { utilisateur } = useAuth();
  const { succes, erreur: notifierErreur } = useNotifications();
  const navigate = useNavigate();

  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const [livraison, setLivraison] = useState({
    adresseLivraison: '',
    telephone: utilisateur?.telephone ?? '',
  });

  async function validerCommande(evenement) {
    evenement.preventDefault();
    setEnvoi(true);
    setErreurs({});

    try {
      const donnees = await api.post('/commandes', livraison);
      await recharger();
      succes(`Commande ${donnees.commande.reference} enregistrée.`);
      navigate('/commandes');
    } catch (erreur) {
      // Les erreurs de validation sont replacees sous leur champ ; les autres
      // (stock insuffisant, panier vide) partent en notification.
      if (erreur.details) {
        setErreurs(Object.fromEntries(erreur.details.map((d) => [d.champ, d.message])));
      } else {
        notifierErreur(erreur.message);
      }
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement && articles.length === 0) return <Chargement libelle="Chargement de votre panier…" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <Revelation className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-sm font-bold uppercase tracking-wider text-primary">Votre sélection</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
            Mon panier
          </h1>
          <p className="mt-3 text-on-surface-variant">
            {resume.nombreArticles === 0
              ? 'Votre panier est vide pour le moment.'
              : `${resume.nombreArticles} article${resume.nombreArticles > 1 ? 's' : ''} en attente de commande.`}
          </p>
        </div>

        {articles.length > 0 && (
          <Bouton
            variante="secondaire"
            icone="delete_sweep"
            onClick={() => {
              if (window.confirm('Vider entièrement votre panier ?')) vider();
            }}
          >
            Vider le panier
          </Bouton>
        )}
      </Revelation>

      {articles.length === 0 ? (
        <div className="mt-10">
          <EtatVide
            icone="shopping_cart_off"
            titre="Votre panier est vide"
            texte="Parcourez le catalogue et ajoutez les articles qui vous plaisent : ils vous attendront ici."
            action={
              <Link to="/produits">
                <Bouton iconeApres="arrow_forward">Découvrir le catalogue</Bouton>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          {/* --- Articles --- */}
          <div className="space-y-4">
            {articles.map((article, index) => (
              <Revelation
                key={article.id}
                delai={index * 70}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 transition-shadow hover:shadow-md sm:flex-nowrap"
              >
                <Link
                  to={`/produits/${article.produit_id}`}
                  className="shrink-0 overflow-hidden rounded-xl bg-surface-container"
                >
                  <ImageProduit
                    chemin={article.image}
                    alt={article.nom}
                    className="h-24 w-24 object-cover transition-transform duration-300 hover:scale-105"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link to={`/produits/${article.produit_id}`}>
                    <h3 className="truncate font-bold text-on-surface transition-colors hover:text-primary">
                      {article.nom}
                    </h3>
                  </Link>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {formaterPrix(article.prix)} l’unité
                  </p>

                  <button
                    type="button"
                    onClick={() => retirer(article.produit_id)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-error transition-opacity hover:opacity-75"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Retirer
                  </button>
                </div>

                <div className="inline-flex h-10 items-center rounded-xl border border-outline-variant">
                  <button
                    type="button"
                    onClick={() => changerQuantite(article.produit_id, article.quantite - 1)}
                    disabled={article.quantite <= 1}
                    aria-label={`Diminuer la quantité de ${article.nom}`}
                    className="flex h-full w-9 items-center justify-center text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>

                  <span className="w-9 text-center text-sm font-bold text-on-surface">
                    {article.quantite}
                  </span>

                  <button
                    type="button"
                    onClick={() => changerQuantite(article.produit_id, article.quantite + 1)}
                    disabled={article.stock > 0 && article.quantite >= article.stock}
                    aria-label={`Augmenter la quantité de ${article.nom}`}
                    className="flex h-full w-9 items-center justify-center text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>

                <p className="w-28 shrink-0 text-right font-extrabold text-primary">
                  {formaterPrix(article.sous_total)}
                </p>
              </Revelation>
            ))}
          </div>

          {/* --- Recapitulatif --- */}
          <Revelation
            variante="droite"
            className="sticky top-24 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-on-surface">Récapitulatif</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-on-surface-variant">Sous-total</dt>
                <dd className="font-semibold text-on-surface">{formaterPrix(resume.sousTotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-on-surface-variant">Livraison</dt>
                <dd className="font-semibold text-on-surface">{formaterPrix(resume.fraisLivraison)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant pt-3">
                <dt className="font-bold text-on-surface">Total à payer</dt>
                <dd className="text-xl font-extrabold text-primary">{formaterPrix(resume.total)}</dd>
              </div>
            </dl>

            {formulaireOuvert ? (
              <form onSubmit={validerCommande} className="mt-6 space-y-4">
                <Champ
                  label="Adresse de livraison"
                  erreur={erreurs.adresseLivraison}
                  placeholder="Quartier, rue, indications…"
                  required
                  value={livraison.adresseLivraison}
                  onChange={(evenement) =>
                    setLivraison((precedent) => ({
                      ...precedent,
                      adresseLivraison: evenement.target.value,
                    }))
                  }
                />

                <Champ
                  label="Téléphone"
                  type="tel"
                  erreur={erreurs.telephone}
                  placeholder="+221 77 000 00 00"
                  required
                  value={livraison.telephone}
                  onChange={(evenement) =>
                    setLivraison((precedent) => ({ ...precedent, telephone: evenement.target.value }))
                  }
                />

                <Bouton
                  type="submit"
                  taille="lg"
                  disabled={envoi}
                  className="w-full"
                  icone={envoi ? 'progress_activity' : 'check_circle'}
                >
                  {envoi ? 'Validation…' : 'Confirmer la commande'}
                </Bouton>

                <button
                  type="button"
                  onClick={() => setFormulaireOuvert(false)}
                  className="w-full text-center text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Revenir au panier
                </button>
              </form>
            ) : (
              <>
                <Bouton
                  taille="lg"
                  className="mt-6 w-full"
                  iconeApres="arrow_forward"
                  onClick={() => setFormulaireOuvert(true)}
                >
                  Passer la commande
                </Bouton>

                <Link to="/produits" className="mt-3 block">
                  <Bouton variante="fantome" className="w-full" icone="add">
                    Continuer mes achats
                  </Bouton>
                </Link>
              </>
            )}

            <p className="mt-5 flex items-start gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
              Paiement à la livraison. Aucune donnée bancaire ne vous est demandée.
            </p>
          </Revelation>
        </div>
      )}
    </div>
  );
}
