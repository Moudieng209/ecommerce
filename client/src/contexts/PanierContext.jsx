import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

// Panier serveur : il suit l'utilisateur d'un appareil a l'autre, contrairement
// a un panier de session. Le contexte garde une copie locale pour l'affichage
// immediat de la pastille et des totaux.

const PanierContext = createContext(null);

const PANIER_VIDE = {
  articles: [],
  resume: { nombreArticles: 0, sousTotal: 0, fraisLivraison: 0, total: 0, devise: 'cfa' },
};

export function FournisseurPanier({ children }) {
  const { estConnecte } = useAuth();
  const { erreur: notifierErreur, succes } = useNotifications();

  const [panier, setPanier] = useState(PANIER_VIDE);
  const [chargement, setChargement] = useState(false);

  const recharger = useCallback(async () => {
    if (!estConnecte) {
      setPanier(PANIER_VIDE);
      return;
    }

    setChargement(true);
    try {
      setPanier(await api.get('/panier'));
    } catch {
      setPanier(PANIER_VIDE);
    } finally {
      setChargement(false);
    }
  }, [estConnecte]);

  // Le panier est recharge a la connexion et vide a la deconnexion.
  useEffect(() => {
    recharger();
  }, [recharger]);

  const ajouter = useCallback(
    async (produitId, quantite = 1) => {
      try {
        setPanier(await api.post('/panier', { produitId, quantite }));
        succes('Article ajouté au panier.');
        return true;
      } catch (erreur) {
        notifierErreur(erreur.message);
        return false;
      }
    },
    [notifierErreur, succes],
  );

  const changerQuantite = useCallback(
    async (produitId, quantite) => {
      try {
        setPanier(await api.patch(`/panier/${produitId}`, { quantite }));
      } catch (erreur) {
        notifierErreur(erreur.message);
        // La quantite affichee doit refleter l'etat reel du serveur.
        recharger();
      }
    },
    [notifierErreur, recharger],
  );

  const retirer = useCallback(
    async (produitId) => {
      try {
        setPanier(await api.delete(`/panier/${produitId}`));
        succes('Article retiré du panier.');
      } catch (erreur) {
        notifierErreur(erreur.message);
      }
    },
    [notifierErreur, succes],
  );

  const vider = useCallback(async () => {
    try {
      setPanier(await api.delete('/panier'));
      succes('Panier vidé.');
    } catch (erreur) {
      notifierErreur(erreur.message);
    }
  }, [notifierErreur, succes]);

  const valeur = useMemo(
    () => ({
      panier,
      articles: panier.articles,
      resume: panier.resume,
      nombreArticles: panier.resume.nombreArticles,
      chargement,
      ajouter,
      changerQuantite,
      retirer,
      vider,
      recharger,
    }),
    [panier, chargement, ajouter, changerQuantite, retirer, vider, recharger],
  );

  return <PanierContext.Provider value={valeur}>{children}</PanierContext.Provider>;
}

export function usePanier() {
  const contexte = useContext(PanierContext);
  if (!contexte) throw new Error('usePanier doit etre utilise dans FournisseurPanier.');
  return contexte;
}
