import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Chargement } from './ui';

/**
 * Barriere d'acces des routes privees.
 * Le controle reste purement visuel : l'API verifie de son cote chaque requete,
 * un utilisateur ne gagne donc rien a forcer une URL.
 */
export default function RouteProtegee({ admin = false, children }) {
  const { estConnecte, estAdmin, chargement } = useAuth();
  const emplacement = useLocation();

  // Tant que la session n'est pas verifiee, rediriger renverrait a tort un
  // utilisateur deja connecte vers la page de connexion.
  if (chargement) return <Chargement libelle="Vérification de votre session…" />;

  if (!estConnecte) {
    return <Navigate to="/connexion" replace state={{ retour: emplacement.pathname }} />;
  }

  if (admin && !estAdmin) return <Navigate to="/" replace />;

  return children;
}
