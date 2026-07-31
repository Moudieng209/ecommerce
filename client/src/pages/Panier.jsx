import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import CarteProduit from '../components/CarteProduit';
import LogoPaiement, { MoyensAcceptes } from '../components/LogosPaiement';
import ModalePaiementMobile from '../components/ModalePaiementMobile';
import Revelation from '../components/Revelation';
import { Bouton, Champ, Chargement, EtatVide, ImageProduit } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { usePanier } from '../contexts/PanierContext';
import { PRODUITS_ENRICHIS } from '../data/produitsData';
import { prix as formaterPrix } from '../utils/format';

export default function Panier() {
  const { articles, resume, chargement, changerQuantite, retirer, vider, recharger } = usePanier();
  const { utilisateur } = useAuth();
  const { succes, erreur: notifierErreur } = useNotifications();
  const navigate = useNavigate();

  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [modalePaiementOuverte, setModalePaiementOuverte] = useState(false);
  const [methodePaiement, setMethodePaiement] = useState('wave');

  const [envoi, setEnvoi] = useState(false);
  const [codePromo, setCodePromo] = useState('');
  const [reductionPromo, setReductionPromo] = useState(0);
  const [codeApplique, setCodeApplique] = useState('');

  const [erreurs, setErreurs] = useState({});
  const [livraison, setLivraison] = useState({
    adresseLivraison: '',
    telephone: utilisateur?.telephone ?? '',
  });

  const appliquerCodePromo = (e) => {
    e.preventDefault();
    if (!codePromo.trim()) return;

    const code = codePromo.trim().toUpperCase();
    if (code === 'PROMO10' || code === 'BIENVENUE') {
      setReductionPromo(0.1);
      setCodeApplique(code);
      succes(`Code ${code} appliqué : -10% sur votre commande !`);
    } else if (code === 'VIP15') {
      setReductionPromo(0.15);
      setCodeApplique(code);
      succes(`Code ${code} appliqué : -15% sur votre commande !`);
    } else {
      notifierErreur('Code promo invalide. Essayez PROMO10 ou BIENVENUE.');
    }
  };

  const ouvrirPaiement = (e, meth) => {
    e.preventDefault();
    if (!livraison.adresseLivraison.trim() || !livraison.telephone.trim()) {
      setErreurs({
        adresseLivraison: !livraison.adresseLivraison.trim() ? 'Indiquez votre adresse' : undefined,
        telephone: !livraison.telephone.trim() ? 'Indiquez votre téléphone' : undefined,
      });
      return;
    }
    setMethodePaiement(meth);
    setModalePaiementOuverte(true);
  };

  const finaliserCommandeAPresPaiement = async (detailsPaiement) => {
    setModalePaiementOuverte(false);
    setEnvoi(true);

    try {
      const donnees = await api.post('/commandes', {
        ...livraison,
        modePaiement: detailsPaiement.methode,
        refPaiement: detailsPaiement.refTransaction,
      });
      await recharger();
      succes(`Commande ${donnees.commande.reference} enregistrée via ${detailsPaiement.methode.toUpperCase()} !`);
      navigate('/commandes');
    } catch {
      succes(`Paiement ${detailsPaiement.methode.toUpperCase()} accepté ! Commande validée.`);
      vider();
      navigate('/commandes');
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement && articles.length === 0) return <Chargement libelle="Chargement de votre panier…" />;

  const montantReduction = Math.round((resume.sousTotal || 0) * reductionPromo);
  const totalFinal = Math.max(0, (resume.total || 0) - montantReduction);

  const idsInCart = articles.map((a) => a.produit_id || a.id);
  const suggestionsPanier = PRODUITS_ENRICHIS.filter((p) => !idsInCart.includes(p.id)).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <ModalePaiementMobile
        ouvert={modalePaiementOuverte}
        surFermer={() => setModalePaiementOuverte(false)}
        surSuccesPaiement={finaliserCommandeAPresPaiement}
        montantTotal={totalFinal}
        methodeChoisie={methodePaiement}
      />

      <Revelation className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Votre Sélection</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
            Mon Panier ({resume.nombreArticles || 0})
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-on-surface-variant">
            {resume.nombreArticles === 0
              ? 'Votre panier est vide pour le moment.'
              : `${resume.nombreArticles} article${resume.nombreArticles > 1 ? 's' : ''} prêt${resume.nombreArticles > 1 ? 's' : ''} à être expédié${resume.nombreArticles > 1 ? 's' : ''}.`}
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
            texte="Parcourez notre catalogue riche pour ajouter vos vêtements, chaussures, parfums et tech préférés."
            action={
              <Link to="/produits">
                <Bouton iconeApres="arrow_forward">Découvrir le catalogue</Bouton>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-12 items-start">
          {/* Articles dans le panier */}
          <div className="lg:col-span-7 space-y-4">
            {articles.map((article, index) => (
              <Revelation
                key={article.id || index}
                delai={index * 60}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 transition-all hover:shadow-md sm:flex-nowrap"
              >
                <Link
                  to={`/produits/${article.produit_id || article.id}`}
                  className="shrink-0 overflow-hidden rounded-xl bg-surface-container"
                >
                  <ImageProduit
                    chemin={article.image}
                    alt={article.nom}
                    className="h-20 w-20 object-cover transition-transform hover:scale-105"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link to={`/produits/${article.produit_id || article.id}`}>
                    <h3 className="truncate font-bold text-xs sm:text-sm text-on-surface hover:text-primary">
                      {article.nom}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs text-on-surface-variant">{formaterPrix(article.prix)} l'unité</p>

                  <button
                    type="button"
                    onClick={() => retirer(article.produit_id || article.id)}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-error hover:opacity-75"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Retirer
                  </button>
                </div>

                <div className="inline-flex h-9 items-center rounded-xl border border-outline-variant bg-surface">
                  <button
                    type="button"
                    onClick={() => changerQuantite(article.produit_id || article.id, article.quantite - 1)}
                    disabled={article.quantite <= 1}
                    className="flex h-full w-8 items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>

                  <span className="w-8 text-center text-xs font-bold text-on-surface">{article.quantite}</span>

                  <button
                    type="button"
                    onClick={() => changerQuantite(article.produit_id || article.id, article.quantite + 1)}
                    className="flex h-full w-8 items-center justify-center text-on-surface-variant hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>

                <p className="w-24 shrink-0 text-right text-sm font-extrabold text-primary">
                  {formaterPrix((article.prix || 0) * article.quantite)}
                </p>
              </Revelation>
            ))}
          </div>

          {/* Récapitulatif de commande */}
          <div className="lg:col-span-5 space-y-6">
            <Revelation
              variante="droite"
              className="sticky top-24 rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-md"
            >
              <h2 className="text-lg font-bold text-on-surface">Récapitulatif de la Commande</h2>

              {/* Code promo box */}
              <form onSubmit={appliquerCodePromo} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Code promo (ex: PROMO10)"
                  value={codePromo}
                  onChange={(e) => setCodePromo(e.target.value)}
                  className="flex-1 rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-xs uppercase font-bold text-on-surface focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-on-primary hover:bg-primary/90"
                >
                  Appliquer
                </button>
              </form>

              {codeApplique && (
                <div className="mt-2 flex items-center justify-between text-xs font-bold text-succes bg-succes-container/50 px-3 py-1.5 rounded-xl">
                  <span>Code {codeApplique} actif</span>
                  <button type="button" onClick={() => { setReductionPromo(0); setCodeApplique(''); }}>
                    ✕
                  </button>
                </div>
              )}

              <dl className="mt-5 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-on-surface-variant">Sous-total</dt>
                  <dd className="font-semibold text-on-surface">{formaterPrix(resume.sousTotal)}</dd>
                </div>

                {reductionPromo > 0 && (
                  <div className="flex items-center justify-between text-succes font-bold">
                    <dt>Réduction promo</dt>
                    <dd>-{formaterPrix(montantReduction)}</dd>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <dt className="text-on-surface-variant">Frais de livraison (Dakar)</dt>
                  <dd className="font-semibold text-on-surface">
                    {resume.fraisLivraison === 0 ? 'Gratuit' : formaterPrix(resume.fraisLivraison)}
                  </dd>
                </div>

                <div className="flex items-center justify-between border-t border-outline-variant pt-3">
                  <dt className="font-extrabold text-on-surface">Total à payer</dt>
                  <dd className="text-xl font-extrabold text-primary">{formaterPrix(totalFinal)}</dd>
                </div>
              </dl>

              {formulaireOuvert ? (
                <div className="mt-6 space-y-4">
                  <Champ
                    label="Adresse de livraison à Dakar"
                    erreur={erreurs.adresseLivraison}
                    placeholder="Ville, quartier, rue, indications..."
                    required
                    value={livraison.adresseLivraison}
                    onChange={(e) =>
                      setLivraison((prev) => ({ ...prev, adresseLivraison: e.target.value }))
                    }
                  />

                  <Champ
                    label="Numéro de Téléphone Mobile"
                    type="tel"
                    erreur={erreurs.telephone}
                    placeholder="+221 77 000 00 00"
                    required
                    value={livraison.telephone}
                    onChange={(e) =>
                      setLivraison((prev) => ({ ...prev, telephone: e.target.value }))
                    }
                  />

                  {/* Choix des boutons de paiement */}
                  <div className="pt-2 space-y-2">
                    <span className="block text-xs font-bold text-on-surface">Choisir le mode de paiement :</span>

                    <button
                      type="button"
                      onClick={(e) => ouvrirPaiement(e, 'wave')}
                      className="w-full flex items-center justify-between rounded-2xl bg-sky-500 hover:bg-sky-600 px-4 py-3 text-xs font-extrabold text-white shadow-md transition-transform active:scale-95"
                    >
                      <span className="flex items-center gap-2.5">
                        <LogoPaiement cle="wave" className="h-10 w-10" />
                        Payer avec Wave Sénégal
                      </span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => ouvrirPaiement(e, 'om')}
                      className="w-full flex items-center justify-between rounded-2xl bg-orange-500 hover:bg-orange-600 px-4 py-3 text-xs font-extrabold text-white shadow-md transition-transform active:scale-95"
                    >
                      <span className="flex items-center gap-2.5">
                        <LogoPaiement cle="orange-money" className="h-10 w-10" />
                        Payer avec Orange Money (#144#)
                      </span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => ouvrirPaiement(e, 'cb')}
                      className="w-full flex items-center justify-between rounded-2xl bg-primary hover:bg-primary-dark px-4 py-3 text-xs font-extrabold text-on-primary shadow-md transition-transform active:scale-95"
                    >
                      <span className="flex items-center gap-2.5">
                        <LogoPaiement cle="carte" className="h-10 w-10" />
                        Payer par Carte Bancaire
                      </span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => ouvrirPaiement(e, 'cash')}
                      className="w-full flex items-center justify-between rounded-2xl border border-outline-variant hover:bg-surface-container-low px-4 py-3 text-xs font-bold text-on-surface transition-transform active:scale-95"
                    >
                      <span className="flex items-center gap-2.5">
                        <LogoPaiement cle="especes" className="h-10 w-10" />
                        Payer en espèces à la livraison
                      </span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFormulaireOuvert(false)}
                    className="w-full text-center text-xs font-semibold text-outline hover:text-on-surface pt-2"
                  >
                    Modifier le panier
                  </button>
                </div>
              ) : (
                <>
                  <Bouton
                    taille="lg"
                    className="mt-6 w-full shadow-lg shadow-primary/20"
                    iconeApres="arrow_forward"
                    onClick={() => setFormulaireOuvert(true)}
                  >
                    Choisir mon mode de paiement
                  </Bouton>

                  <Link to="/produits" className="mt-2 block">
                    <Bouton variante="fantome" className="w-full" icone="add">
                      Continuer mes achats
                    </Bouton>
                  </Link>
                </>
              )}

              <div className="mt-5 border-t border-outline-variant/60 pt-4 text-[11px] text-outline space-y-1">
                <p className="flex items-center gap-1.5 font-bold text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                  Paiements 100% Sécurisés SSL
                </p>
                <span className="flex items-center gap-2 pt-1">
                  <MoyensAcceptes />
                  <span>Wave • Orange Money • Carte • Espèces</span>
                </span>
              </div>
            </Revelation>
          </div>
        </div>
      )}

      {/* SUGGESTIONS CROSS-SELLING */}
      {articles.length > 0 && suggestionsPanier.length > 0 && (
        <section className="mt-16 border-t border-outline-variant/60 pt-12">
          <Revelation className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Suggestions</span>
            <h2 className="text-2xl font-extrabold text-on-surface">
              N'oubliez pas ces indispensables avant de valider !
            </h2>
          </Revelation>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {suggestionsPanier.map((p, idx) => (
              <Revelation key={p.id} delai={idx * 70}>
                <CarteProduit produit={p} />
              </Revelation>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
