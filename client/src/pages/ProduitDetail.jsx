import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import CarteProduit from '../components/CarteProduit';
import Revelation from '../components/Revelation';
import { Bouton, Chargement, EtatVide, ImageProduit, Pastille } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { usePanier } from '../contexts/PanierContext';
import { useWishlist } from '../contexts/WishlistContext';
import { PRODUITS_ENRICHIS } from '../data/produitsData';
import { prix as formaterPrix } from '../utils/format';

export default function ProduitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ajouter } = usePanier();
  const { estConnecte } = useAuth();
  const { info, succes } = useNotifications();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [produit, setProduit] = useState(null);
  const [similaires, setSimilaires] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);
  const [selectedBundleIds, setSelectedBundleIds] = useState([]);

  const [imagePrincipale, setImagePrincipale] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const [tailleChoisie, setTailleChoisie] = useState('');
  const [couleurChoisie, setCouleurChoisie] = useState('');
  const [ongletActif, setOngletActif] = useState('description');

  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    let annule = false;
    setChargement(true);
    setQuantite(1);

    const produitLocal = PRODUITS_ENRICHIS.find((p) => p.id === Number(id));

    api
      .get(`/produits/${id}`)
      .then(async (donnees) => {
        if (annule) return;
        const currentProd = { ...produitLocal, ...donnees.produit };
        setProduit(currentProd);
        setImagePrincipale(currentProd.image);

        if (currentProd.tailles?.length) setTailleChoisie(currentProd.tailles[0]);
        if (currentProd.couleurs?.length) setCouleurChoisie(currentProd.couleurs[0]);

        // Produits frequemment mechetes ensemble
        if (currentProd.frequentlyBoughtTogether?.length) {
          const freqProds = PRODUITS_ENRICHIS.filter((p) =>
            currentProd.frequentlyBoughtTogether.includes(p.id),
          );
          setFrequentlyBought(freqProds);
          setSelectedBundleIds(freqProds.map((p) => p.id));
        }

        // Produits similaires
        if (currentProd.categorie_id || currentProd.categorie) {
          const autres = PRODUITS_ENRICHIS.filter(
            (p) => p.id !== currentProd.id && p.categorie === currentProd.categorie,
          ).slice(0, 4);
          setSimilaires(autres);
        }
      })
      .catch(() => {
        if (!annule && produitLocal) {
          setProduit(produitLocal);
          setImagePrincipale(produitLocal.image);
          if (produitLocal.tailles?.length) setTailleChoisie(produitLocal.tailles[0]);
          if (produitLocal.couleurs?.length) setCouleurChoisie(produitLocal.couleurs[0]);

          if (produitLocal.frequentlyBoughtTogether?.length) {
            const freqProds = PRODUITS_ENRICHIS.filter((p) =>
              produitLocal.frequentlyBoughtTogether.includes(p.id),
            );
            setFrequentlyBought(freqProds);
            setSelectedBundleIds(freqProds.map((p) => p.id));
          }

          const autres = PRODUITS_ENRICHIS.filter(
            (p) => p.id !== produitLocal.id && p.categorie === produitLocal.categorie,
          ).slice(0, 4);
          setSimilaires(autres);
        }
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => {
      annule = true;
    };
  }, [id]);

  async function ajouterAuPanier() {
    if (!estConnecte) {
      info('Connectez-vous pour ajouter des articles à votre panier.');
      navigate('/connexion', { state: { retour: `/produits/${id}` } });
      return;
    }

    setEnCours(true);
    await ajouter(produit.id, quantite);
    setEnCours(false);
  }

  async function ajouterLotAuPanier() {
    if (!estConnecte) {
      info('Connectez-vous pour ajouter ce lot au panier.');
      navigate('/connexion', { state: { retour: `/produits/${id}` } });
      return;
    }

    setEnCours(true);
    await ajouter(produit.id, 1);
    for (const pId of selectedBundleIds) {
      await ajouter(pId, 1);
    }
    succes(`Le lot complet (${selectedBundleIds.length + 1} articles) a été ajouté à votre panier !`);
    setEnCours(false);
  }

  if (chargement) return <Chargement libelle="Chargement de la fiche produit..." />;

  if (!produit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <EtatVide
          icone="production_quantity_limits"
          titre="Article introuvable"
          texte="Cet article n'existe pas ou n'est plus proposé."
          action={
            <Link to="/produits">
              <Bouton iconeApres="arrow_forward">Retour au catalogue</Bouton>
            </Link>
          }
        />
      </div>
    );
  }

  const favori = isWishlisted(produit.id);
  const enRupture = produit.stock === 0;
  const maximum = produit.stock > 0 ? produit.stock : 99;

  // Calcul prix lot
  const itemsBundleSelected = frequentlyBought.filter((p) => selectedBundleIds.includes(p.id));
  const totalBundlePrix = produit.prix + itemsBundleSelected.reduce((sum, item) => sum + item.prix, 0);
  const totalBundleEconomie = Math.round(totalBundlePrix * 0.1); // 10% de reduction lot

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      {/* Fil d'Ariane */}
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 text-xs text-outline mb-6">
        <Link to="/" className="hover:text-primary transition-colors">
          Accueil
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link to="/produits" className="hover:text-primary transition-colors">
          Catalogue
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="font-bold text-on-surface truncate">{produit.nom}</span>
      </nav>

      {/* Grid Principal Produit */}
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Galerie Photos (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-outline-variant bg-surface-container aspect-square shadow-md">
            <ImageProduit
              chemin={imagePrincipale || produit.image}
              alt={produit.nom}
              className="h-full w-full object-cover"
            />

            {/* Bouton Cœur Favoris */}
            <button
              type="button"
              onClick={() => toggleWishlist(produit)}
              aria-label="Favoris"
              className={`absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-2xl backdrop-blur transition-all ${
                favori
                  ? 'bg-secondary text-on-secondary shadow-lg scale-105'
                  : 'bg-surface-container-lowest/90 text-on-surface hover:bg-surface-container-lowest'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${favori ? 'fill-1' : ''}`}>
                {favori ? 'favorite' : 'favorite_border'}
              </span>
            </button>
          </div>

          {/* Vignettes Galerie */}
          {produit.imagesGalerie && produit.imagesGalerie.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {produit.imagesGalerie.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImagePrincipale(img)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                    imagePrincipale === img ? 'border-primary scale-105 shadow-md' : 'border-outline-variant opacity-70 hover:opacity-100'
                  }`}
                >
                  <ImageProduit chemin={img} alt={`${produit.nom} vignette ${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Détails & Choix Produit (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-on-primary-container">
                {produit.categorie_nom || produit.categorie}
              </span>
              {produit.badge && (
                <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
                  {produit.badge}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
              {produit.nom}
            </h1>

            {/* Note & Avis */}
            {produit.note && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <div className="flex text-amber-500">
                  {'★'.repeat(Math.floor(produit.note))}
                  {produit.note % 1 >= 0.5 ? '★' : ''}
                </div>
                <span className="font-bold text-on-surface">{produit.note} / 5</span>
                <span className="text-outline">({produit.nombreAvis || 12} avis vérifiés)</span>
              </div>
            )}
          </div>

          {/* Prix & Stock */}
          <div className="flex items-baseline gap-3 border-y border-outline-variant/60 py-4">
            <span className="text-3xl font-extrabold text-primary">{formaterPrix(produit.prix)}</span>
            {produit.ancienPrix && (
              <span className="text-base text-outline line-through">{formaterPrix(produit.ancienPrix)}</span>
            )}
            <span className="ml-auto text-xs font-bold text-succes flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {enRupture ? 'Épuisé' : 'En stock'}
            </span>
          </div>

          {/* Court résumé */}
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {produit.description}
          </p>

          {/* Choix Tailles si applicables */}
          {produit.tailles && (
            <div>
              <span className="block text-xs font-bold text-on-surface mb-2">Taille / Dimension :</span>
              <div className="flex flex-wrap gap-2">
                {produit.tailles.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTailleChoisie(t)}
                    className={`h-10 min-w-10 rounded-xl px-3 text-xs font-bold transition-all ${
                      tailleChoisie === t
                        ? 'bg-primary text-on-primary shadow-md scale-105'
                        : 'border border-outline-variant bg-surface text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Choix Couleurs si applicables */}
          {produit.couleurs && (
            <div>
              <span className="block text-xs font-bold text-on-surface mb-2">Couleur :</span>
              <div className="flex flex-wrap gap-2">
                {produit.couleurs.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCouleurChoisie(c)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      couleurChoisie === c
                        ? 'bg-primary text-on-primary shadow-md scale-105'
                        : 'border border-outline-variant bg-surface text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sélection Quantité + Action */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex h-12 items-center rounded-2xl border border-outline-variant bg-surface">
              <button
                type="button"
                onClick={() => setQuantite((v) => Math.max(1, v - 1))}
                disabled={quantite <= 1 || enRupture}
                className="flex h-full w-10 items-center justify-center text-on-surface hover:text-primary disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <span className="w-10 text-center text-xs font-extrabold text-on-surface">{quantite}</span>
              <button
                type="button"
                onClick={() => setQuantite((v) => Math.min(maximum, v + 1))}
                disabled={quantite >= maximum || enRupture}
                className="flex h-full w-10 items-center justify-center text-on-surface hover:text-primary disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>

            <Bouton
              taille="lg"
              icone={enCours ? 'progress_activity' : 'shopping_bag'}
              onClick={ajouterAuPanier}
              disabled={enRupture || enCours}
              className="flex-1 shadow-lg shadow-primary/25"
            >
              {enRupture ? 'Article indisponible' : 'Ajouter au panier'}
            </Bouton>
          </div>

          {/* Reassurance box */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-outline-variant/60 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">local_shipping</span>
              <span>Livraison 48h à Dakar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
              <span>Paiement à la livraison</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- SYSTEME CROSS-SELLING: ACHETÉS FRÉQUEMMENT ENSEMBLE ---------- */}
      {frequentlyBought.length > 0 && (
        <section className="mt-16 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary-container/20 via-surface-container-lowest to-secondary-container/20 p-6 sm:p-8 shadow-md">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
              <span className="material-symbols-outlined text-[16px]">inventory_2</span> OFFRE BUNDLE ASSORTI
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-on-surface">
              Produits fréquemment achetés ensemble
            </h2>
            <p className="text-xs text-on-surface-variant">
              Complétez votre achat avec ces articles parfaitement assortis et bénéficiez de 10% d'économie !
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Visual Products Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Main item */}
              <div className="flex items-center gap-3 rounded-2xl border border-primary bg-surface p-3 shadow-sm min-w-[200px]">
                <img src={produit.image} alt={produit.nom} className="h-16 w-16 rounded-xl object-cover" />
                <div>
                  <span className="block text-[10px] font-bold text-primary uppercase">Article Actuel</span>
                  <p className="text-xs font-bold text-on-surface line-clamp-1">{produit.nom}</p>
                  <p className="text-xs font-extrabold text-primary">{formaterPrix(produit.prix)}</p>
                </div>
              </div>

              <span className="text-xl font-bold text-primary">+</span>

              {/* Complementary items */}
              {frequentlyBought.map((item) => {
                const coché = selectedBundleIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      setSelectedBundleIds((prev) =>
                        coché ? prev.filter((i) => i !== item.id) : [...prev, item.id],
                      )
                    }
                    className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-all min-w-[200px] ${
                      coché
                        ? 'border-primary bg-surface shadow-sm'
                        : 'border-outline-variant bg-surface/50 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={coché}
                      onChange={() => {}}
                      className="accent-primary h-4 w-4"
                    />
                    <img src={item.image} alt={item.nom} className="h-16 w-16 rounded-xl object-cover" />
                    <div>
                      <p className="text-xs font-bold text-on-surface line-clamp-1">{item.nom}</p>
                      <p className="text-xs font-extrabold text-primary">{formaterPrix(item.prix)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Bundle CTA Box */}
            <div className="flex flex-col items-center lg:items-end gap-2 border-t lg:border-t-0 lg:border-l border-outline-variant/60 pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto">
              <div className="text-center lg:text-right">
                <span className="text-xs text-outline font-medium">Prix total pour le lot ({selectedBundleIds.length + 1} articles) :</span>
                <div className="flex items-baseline justify-center lg:justify-end gap-2">
                  <span className="text-2xl font-extrabold text-primary">
                    {formaterPrix(totalBundlePrix - totalBundleEconomie)}
                  </span>
                  <span className="text-xs text-outline line-through">{formaterPrix(totalBundlePrix)}</span>
                </div>
                <span className="text-[11px] font-bold text-succes">Économie de {formaterPrix(totalBundleEconomie)}</span>
              </div>

              <button
                type="button"
                onClick={ajouterLotAuPanier}
                disabled={enCours}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-extrabold text-on-primary shadow-lg shadow-primary/25 transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                Tout ajouter au panier
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ---------- ONGLETS INFORMATIONS COMPLÉMENTAIRES ---------- */}
      <section className="mt-16">
        <div className="border-b border-outline-variant/60 flex gap-6 text-sm font-bold">
          <button
            type="button"
            onClick={() => setOngletActif('description')}
            className={`pb-3 transition-colors ${
              ongletActif === 'description'
                ? 'border-b-2 border-primary text-primary'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            Description & Conseils
          </button>
          <button
            type="button"
            onClick={() => setOngletActif('specs')}
            className={`pb-3 transition-colors ${
              ongletActif === 'specs'
                ? 'border-b-2 border-primary text-primary'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            Caractéristiques & Composition
          </button>
          <button
            type="button"
            onClick={() => setOngletActif('avis')}
            className={`pb-3 transition-colors ${
              ongletActif === 'avis'
                ? 'border-b-2 border-primary text-primary'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            Avis Clients ({produit.nombreAvis || 12})
          </button>
        </div>

        <div className="py-6 text-xs sm:text-sm leading-relaxed text-on-surface-variant">
          {ongletActif === 'description' && (
            <div className="space-y-3">
              <p>{produit.description}</p>
              <p>Conçu avec des matériaux durables et résistants pour assurer un confort maximal au quotidien. Adapté aussi bien pour le travail que pour vos sorties décontractées.</p>
            </div>
          )}

          {ongletActif === 'specs' && (
            <ul className="space-y-2 list-disc list-inside">
              {produit.caracteristiques ? (
                produit.caracteristiques.map((item, idx) => <li key={idx}>{item}</li>)
              ) : (
                <>
                  <li>Matière haute résistance sélectionnée avec soin</li>
                  <li>Finition artisanale et coutures renforcées</li>
                  <li>Entretien facile et lavable en machine</li>
                </>
              )}
            </ul>
          )}

          {ongletActif === 'avis' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-surface-container-low p-4">
                <div className="flex items-center gap-2 font-bold text-on-surface mb-1">
                  <span>Moussa B.</span>
                  <span className="text-amber-500">★★★★★</span>
                </div>
                <p className="text-xs">Produit reçu très rapidement. Qualité impeccable, tout à fait conforme aux photos du site !</p>
              </div>
              <div className="rounded-2xl bg-surface-container-low p-4">
                <div className="flex items-center gap-2 font-bold text-on-surface mb-1">
                  <span>Amina D.</span>
                  <span className="text-amber-500">★★★★★</span>
                </div>
                <p className="text-xs">Très satisfaite de mon achat, le service client WhatsApp m'a bien aidée pour le choix de la taille.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------- PRODUITS SIMILAIRES ---------- */}
      {similaires.length > 0 && (
        <section className="mt-16">
          <Revelation>
            <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-6">
              Produits de la même catégorie
            </h2>
          </Revelation>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similaires.map((element, index) => (
              <Revelation key={element.id} delai={index * 80}>
                <CarteProduit produit={element} />
              </Revelation>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
