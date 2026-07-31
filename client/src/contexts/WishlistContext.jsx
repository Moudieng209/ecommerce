import { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications } from './NotificationContext';

const WishlistContext = createContext();

export function FournisseurWishlist({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const sauvegarde = localStorage.getItem('3mt_wishlist');
      return sauvegarde ? JSON.parse(sauvegarde) : [];
    } catch {
      return [];
    }
  });

  const { info, succes } = useNotifications();

  useEffect(() => {
    try {
      localStorage.setItem('3mt_wishlist', JSON.stringify(wishlist));
    } catch {
      // Ignorer si localStorage indisponible
    }
  }, [wishlist]);

  const toggleWishlist = (produit) => {
    if (!produit || !produit.id) return;
    setWishlist((prev) => {
      const existe = prev.some((p) => p.id === produit.id);
      if (existe) {
        info('Article retiré de vos favoris');
        return prev.filter((p) => p.id !== produit.id);
      } else {
        succes(`${produit.nom} ajouté à vos favoris !`);
        return [...prev, produit];
      }
    });
  };

  const isWishlisted = (id) => wishlist.some((p) => p.id === id);

  const effacerWishlist = () => setWishlist([]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isWishlisted,
        effacerWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist doit être utilisé au sein de FournisseurWishlist');
  }
  return context;
}
