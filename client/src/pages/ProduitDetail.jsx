import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import CarteProduit from '../components/CarteProduit';
import Revelation from '../components/Revelation';
import { Bouton, Chargement, EtatVide, ImageProduit, Pastille } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { usePanier } from '../contexts/PanierContext';
import { prix as formaterPrix } from '../utils/format';

// Fiche detaillee d'un article, avec choix de la quantite et suggestions
// issues de la meme categorie.

export default function ProduitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ajouter } = usePanier();
  const { estConnecte } = useAuth();
  const { info } = useNotifications();

  const [produit, setProduit] = useState(null);
  const [similaires, setSimilaires] = useState([]);
  const [quantite, setQuantite] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [introuvable, setIntrouvable] = useState(false);

  useEffect(() => {
    let annule = false;
    setChargement(true);
    setIntrouvable(false);
    setQuantite(1);

    api
      .get(`/produits/${id}`)
      .then(async (donnees) => {
        if (annule) return;
        setProduit(donnees.produit);

        // Suggestions du meme rayon, l'article courant exclu.
        if (donnees.produit.categorie_id) {
          const autres = await api.get(`/produits?categorie=${donnees.produit.categorie_id}&parPage=5`);
          if (!annule) {
            setSimilaires(autres.produits.filter((p) => p.id !== donnees.produit.id).slice(0, 4));
          }
        }
      })
      .catch(() => {
        if (!annule) setIntrouvable(true);
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

  if (chargement) return <Chargement libelle="Chargement de l’article…" />;

  if (introuvable || !produit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <EtatVide
          icone="production_quantity_limits"
          titre="Article introuvable"
          texte="Cet article n’existe pas ou n’est plus proposé à la vente."
          action={
            <Link to="/produits">
              <Bouton iconeApres="arrow_forward">Retour au catalogue</Bouton>
            </Link>
          }
        />
      </div>
    );
  }

  const enRupture = produit.stock === 0;
  const maximum = produit.stock > 0 ? produit.stock : 99;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      {/* Fil d'Ariane */}
      <nav aria-label="Fil d’Ariane" className="flex flex-wrap items-center gap-1.5 text-sm">
        <Link to="/" className="text-on-surface-variant transition-colors hover:text-primary">
          Accueil
        </Link>
        <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
        <Link to="/produits" className="text-on-surface-variant transition-colors hover:text-primary">
          Produits
        </Link>
        {produit.categorie_nom && (
          <>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <Link
              to={`/produits?categorie=${produit.categorie_id}`}
              className="text-on-surface-variant transition-colors hover:text-primary"
            >
              {produit.categorie_nom}
            </Link>
          </>
        )}
        <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
        <span className="font-semibold text-on-surface">{produit.nom}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Revelation variante="gauche">
          <div className="overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-xl">
            <ImageProduit
              chemin={produit.image}
              alt={produit.nom}
              className="aspect-square w-full object-cover"
            />
          </div>
        </Revelation>

        <Revelation variante="droite">
          {produit.categorie_nom && (
            <Pastille className="bg-primary-container text-on-primary-container">
              <span className="material-symbols-outlined text-[14px]">sell</span>
              {produit.categorie_nom}
            </Pastille>
          )}

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
            {produit.nom}
          </h1>

          <p className="mt-4 text-3xl font-extrabold text-primary">{formaterPrix(produit.prix)}</p>

          <p className="mt-6 leading-relaxed text-on-surface-variant">
            {produit.description || 'Aucune description n’est disponible pour cet article.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {enRupture ? (
              <Pastille className="bg-error-container text-on-error-container">
                <span className="material-symbols-outlined text-[14px]">block</span>
                Rupture de stock
              </Pastille>
            ) : (
              <Pastille className="bg-succes-container text-succes">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                {produit.stock > 0 ? `${produit.stock} en stock` : 'Disponible'}
              </Pastille>
            )}

            <Pastille className="bg-surface-container-low text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">local_shipping</span>
              Livraison sous 48h
            </Pastille>
          </div>

          {/* Selecteur de quantite + ajout */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex h-12 items-center rounded-xl border border-outline-variant bg-surface-container-lowest">
              <button
                type="button"
                onClick={() => setQuantite((valeur) => Math.max(1, valeur - 1))}
                disabled={quantite <= 1 || enRupture}
                aria-label="Diminuer la quantité"
                className="flex h-full w-11 items-center justify-center text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>

              <input
                type="number"
                min={1}
                max={maximum}
                value={quantite}
                onChange={(evenement) => {
                  const valeur = Number(evenement.target.value);
                  setQuantite(Number.isNaN(valeur) ? 1 : Math.min(maximum, Math.max(1, valeur)));
                }}
                aria-label="Quantité"
                className="h-full w-12 border-x border-outline-variant bg-transparent text-center text-sm font-bold text-on-surface focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setQuantite((valeur) => Math.min(maximum, valeur + 1))}
                disabled={quantite >= maximum || enRupture}
                aria-label="Augmenter la quantité"
                className="flex h-full w-11 items-center justify-center text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>

            <Bouton
              taille="lg"
              icone={enCours ? 'progress_activity' : 'add_shopping_cart'}
              onClick={ajouterAuPanier}
              disabled={enRupture || enCours}
            >
              {enRupture ? 'Article indisponible' : 'Ajouter au panier'}
            </Bouton>

            <Link to="/panier">
              <Bouton taille="lg" variante="secondaire" iconeApres="arrow_forward">
                Voir le panier
              </Bouton>
            </Link>
          </div>

          <div className="mt-8 grid gap-3 rounded-2xl border border-outline-variant bg-surface-container-low/50 p-5 sm:grid-cols-3">
            {[
              { icone: 'payments', libelle: 'Paiement à la livraison' },
              { icone: 'sync', libelle: 'Échange sous 7 jours' },
              { icone: 'support_agent', libelle: 'Assistance 6j/7' },
            ].map((atout) => (
              <span key={atout.libelle} className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-primary">{atout.icone}</span>
                {atout.libelle}
              </span>
            ))}
          </div>
        </Revelation>
      </div>

      {similaires.length > 0 && (
        <section className="mt-20">
          <Revelation>
            <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">
              Dans le même rayon
            </h2>
          </Revelation>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
