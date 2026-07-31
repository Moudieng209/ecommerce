import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

// Session de l'utilisateur. Le jeton lui-meme n'est jamais manipule ici :
// il vit dans un cookie httpOnly, hors de portee du JavaScript de la page.

const AuthContext = createContext(null);

export function FournisseurAuth({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  // Au demarrage, on demande au serveur qui est connecte : le cookie peut
  // avoir survecu a la fermeture de l'onglet.
  useEffect(() => {
    let annule = false;

    api
      .get('/auth/moi')
      .then((donnees) => {
        if (!annule) setUtilisateur(donnees.utilisateur);
      })
      .catch(() => {
        if (!annule) setUtilisateur(null);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => {
      annule = true;
    };
  }, []);

  const connexion = useCallback(async (email, motDePasse) => {
    const donnees = await api.post('/auth/connexion', { email, motDePasse });
    setUtilisateur(donnees.utilisateur);
    return donnees.utilisateur;
  }, []);

  const inscription = useCallback(async (formulaire) => {
    const donnees = await api.post('/auth/inscription', formulaire);
    setUtilisateur(donnees.utilisateur);
    return donnees.utilisateur;
  }, []);

  const deconnexion = useCallback(async () => {
    await api.post('/auth/deconnexion');
    setUtilisateur(null);
  }, []);

  const majUtilisateur = useCallback((nouveau) => setUtilisateur(nouveau), []);

  const valeur = useMemo(
    () => ({
      utilisateur,
      chargement,
      estConnecte: Boolean(utilisateur),
      estAdmin: utilisateur?.role === 'admin',
      connexion,
      inscription,
      deconnexion,
      majUtilisateur,
    }),
    [utilisateur, chargement, connexion, inscription, deconnexion, majUtilisateur],
  );

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) throw new Error('useAuth doit etre utilise dans FournisseurAuth.');
  return contexte;
}
