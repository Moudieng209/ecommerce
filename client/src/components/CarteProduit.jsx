import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePanier } from '../contexts/PanierContext';
import { useNotifications } from '../contexts/NotificationContext';
import { prix as formaterPrix } from '../utils/format';
import { ImageProduit, Pastille } from './ui';

// Fiche produit du catalogue. L'ajout au panier se fait sur place, sans quitter
// la page ni recharger quoi que ce soit.

export default function CarteProduit({ produit }) {
  const { ajouter } = usePanier();
  const { estConnecte } = useAuth();
  const { info } = useNotifications();
  const navigate = useNavigate();

  const [enCours, setEnCours] = useState(false);

  const enRupture = produit.stock === 0;
  const stockFaible = produit.stock > 0 && produit.stock <= 5;

  async function ajouterAuPanier(evenement) {
    // La carte entiere est un lien vers la fiche : le bouton ne doit pas naviguer.
    evenement.preventDefault();

    if (!estConnecte) {
      info('Connectez-vous pour ajouter des articles à votre panier.');
      navigate('/connexion', { state: { retour: '/produits' } });
      return;
    }

    setEnCours(true);
    await ajouter(produit.id, 1);
    setEnCours(false);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl">
      <Link to={`/produits/${produit.id}`} className="relative block overflow-hidden bg-surface-container">
        <ImageProduit
          chemin={produit.image}
          alt={produit.nom}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />

        {produit.categorie_nom && (
          <span className="absolute left-3 top-3 rounded-full bg-surface-container-lowest/90 px-2.5 py-1 text-[11px] font-bold text-on-surface backdrop-blur">
            {produit.categorie_nom}
          </span>
        )}

        {enRupture && (
          <span className="absolute right-3 top-3 rounded-full bg-error px-2.5 py-1 text-[11px] font-bold text-on-error">
            Rupture
          </span>
        )}
        {stockFaible && (
          <span className="absolute right-3 top-3 rounded-full bg-secondary-container px-2.5 py-1 text-[11px] font-bold text-on-secondary-container">
            Plus que {produit.stock}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/produits/${produit.id}`}>
          <h3 className="line-clamp-1 text-base font-bold text-on-surface transition-colors group-hover:text-primary">
            {produit.nom}
          </h3>
        </Link>

        <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-on-surface-variant">
          {produit.description || 'Aucune description disponible.'}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-extrabold text-primary">{formaterPrix(produit.prix)}</p>
            {!enRupture && (
              <Pastille className="mt-1 bg-surface-container-low text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                {produit.stock > 0 ? `${produit.stock} en stock` : 'Disponible'}
              </Pastille>
            )}
          </div>

          <button
            type="button"
            onClick={ajouterAuPanier}
            disabled={enRupture || enCours}
            aria-label={`Ajouter ${produit.nom} au panier`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container transition-[background-color,color,transform] hover:bg-primary hover:text-on-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary-container disabled:hover:text-on-primary-container"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                enCours ? 'animate-spin motion-reduce:animate-none' : ''
              }`}
            >
              {enCours ? 'progress_activity' : 'add_shopping_cart'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
