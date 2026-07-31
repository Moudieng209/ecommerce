import { Link } from 'react-router-dom';
import CarteProduit from '../components/CarteProduit';
import Revelation from '../components/Revelation';
import { Bouton, EtatVide } from '../components/ui';
import { useWishlist } from '../contexts/WishlistContext';

export default function Favoris() {
  const { wishlist, wishlistCount, effacerWishlist } = useWishlist();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Espace Personnel</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
            Mes Articles Favoris ({wishlistCount})
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-on-surface-variant">
            Retrouvez tous les produits que vous avez sauvegardés pour vos futurs achats.
          </p>
        </div>

        {wishlistCount > 0 && (
          <Bouton variante="secondaire" icone="delete_sweep" onClick={effacerWishlist}>
            Vider les favoris
          </Bouton>
        )}
      </div>

      {wishlistCount === 0 ? (
        <EtatVide
          icone="favorite"
          titre="Votre liste de favoris est vide"
          texte="Cliquez sur le symbole cœur d'un produit pour le conserver dans vos favoris et le retrouver facilement plus tard."
          action={
            <Link to="/produits">
              <Bouton iconeApres="arrow_forward">Découvrir les produits</Bouton>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {wishlist.map((produit, idx) => (
            <Revelation key={produit.id} delai={(idx % 4) * 60}>
              <CarteProduit produit={produit} />
            </Revelation>
          ))}
        </div>
      )}
    </div>
  );
}
