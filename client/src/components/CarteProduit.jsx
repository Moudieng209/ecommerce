import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { usePanier } from '../contexts/PanierContext';
import { useWishlist } from '../contexts/WishlistContext';
import { prix as formaterPrix } from '../utils/format';
import { ImageProduit } from './ui';

export default function CarteProduit({ produit }) {
  const { ajouter } = usePanier();
  const { estConnecte } = useAuth();
  const { info } = useNotifications();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [enCours, setEnCours] = useState(false);

  const favori = isWishlisted(produit.id);
  const enRupture = produit.stock === 0;
  const stockFaible = produit.stock > 0 && produit.stock <= 5;
  const aReduction = produit.ancienPrix && produit.ancienPrix > produit.prix;
  const pourcentageReduction = aReduction
    ? Math.round(((produit.ancienPrix - produit.prix) / produit.ancienPrix) * 100)
    : 0;

  async function ajouterAuPanier(evenement) {
    evenement.preventDefault();
    evenement.stopPropagation();

    if (!estConnecte) {
      info('Connectez-vous pour ajouter des articles à votre panier.');
      navigate('/connexion', { state: { retour: '/produits' } });
      return;
    }

    setEnCours(true);
    await ajouter(produit.id, 1);
    setEnCours(false);
  }

  function gererFavori(evenement) {
    evenement.preventDefault();
    evenement.stopPropagation();
    toggleWishlist(produit);
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl">
      {/* Image & Badges */}
      <Link to={`/produits/${produit.id}`} className="relative block overflow-hidden bg-surface-container aspect-square">
        <ImageProduit
          chemin={produit.image}
          alt={produit.nom}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Categorie Badge */}
        {(produit.categorie_nom || produit.categorie) && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-surface-container-lowest/90 px-2.5 py-1 text-[11px] font-bold text-on-surface backdrop-blur shadow-sm">
            {produit.categorie_nom || produit.categorie}
          </span>
        )}

        {/* Reduction Tag */}
        {aReduction && (
          <span className="absolute left-3 bottom-3 z-10 rounded-full bg-error px-2.5 py-0.5 text-[11px] font-extrabold text-on-error shadow-sm">
            -{pourcentageReduction}%
          </span>
        )}

        {/* Stock / Status Badge */}
        {enRupture ? (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-error/90 px-2.5 py-1 text-[11px] font-bold text-on-error shadow-sm">
            Rupture
          </span>
        ) : stockFaible ? (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-secondary-container px-2.5 py-1 text-[11px] font-bold text-on-secondary-container shadow-sm">
            Reste {produit.stock}
          </span>
        ) : produit.badge ? (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-bold text-on-primary shadow-sm">
            {produit.badge}
          </span>
        ) : null}

        {/* Bouton Favoris Cœur */}
        <button
          type="button"
          onClick={gererFavori}
          aria-label="Ajouter aux favoris"
          className={`absolute right-3 bottom-3 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-all ${
            favori
              ? 'bg-secondary text-on-secondary shadow-md scale-105'
              : 'bg-surface-container-lowest/80 text-on-surface hover:bg-surface-container-lowest hover:scale-110'
          }`}
        >
          <span className={`material-symbols-outlined text-[18px] ${favori ? 'fill-1' : ''}`}>
            {favori ? 'favorite' : 'favorite_border'}
          </span>
        </button>
      </Link>

      {/* Detail produit */}
      <div className="flex flex-1 flex-col p-4">
        {/* Note étoiles */}
        {produit.note && (
          <div className="mb-1.5 flex items-center gap-1 text-xs">
            <div className="flex text-amber-500">
              {'★'.repeat(Math.floor(produit.note))}
              {produit.note % 1 >= 0.5 ? '★' : ''}
            </div>
            <span className="font-bold text-on-surface text-[11px]">{produit.note}</span>
            {produit.nombreAvis && (
              <span className="text-outline text-[11px]">({produit.nombreAvis})</span>
            )}
          </div>
        )}

        <Link to={`/produits/${produit.id}`}>
          <h3 className="line-clamp-1 text-base font-bold text-on-surface transition-colors group-hover:text-primary">
            {produit.nom}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-on-surface-variant">
          {produit.description || 'Produit de qualité supérieure garanti par 3MT-Shopping.'}
        </p>

        <div className="mt-4 flex items-end justify-between gap-2 border-t border-outline-variant/40 pt-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-primary">{formaterPrix(produit.prix)}</span>
              {aReduction && (
                <span className="text-xs text-outline line-through">{formaterPrix(produit.ancienPrix)}</span>
              )}
            </div>
            <span className="text-[11px] text-outline font-medium">
              {produit.stock > 0 ? 'En stock' : 'Épuisé'}
            </span>
          </div>

          <button
            type="button"
            onClick={ajouterAuPanier}
            disabled={enRupture || enCours}
            aria-label={`Ajouter ${produit.nom} au panier`}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary-container px-3 text-xs font-bold text-on-primary-container transition-all hover:bg-primary hover:text-on-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className={`material-symbols-outlined text-[18px] ${enCours ? 'animate-spin' : ''}`}>
              {enCours ? 'progress_activity' : 'shopping_bag'}
            </span>
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </div>
    </article>
  );
}
