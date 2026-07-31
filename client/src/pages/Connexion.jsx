import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import Revelation from '../components/Revelation';
import { Bouton, Champ } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

export default function Connexion() {
  const { connexion, utilisateur, estConnecte, chargement } = useAuth();
  const { succes } = useNotifications();
  const emplacement = useLocation();

  const [formulaire, setFormulaire] = useState({ email: '', motDePasse: '' });
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  // Page demandee avant la redirection vers la connexion.
  const retour = emplacement.state?.retour ?? '/';

  // Une seule redirection, declarative : la session mise a jour re-rend ce
  // composant, qui redirige aussitot. Un navigate() dans le gestionnaire de
  // soumission entrerait en concurrence avec cette garde, qui gagne toujours.
  if (!chargement && estConnecte) {
    const destination = utilisateur.role === 'admin' && retour === '/' ? '/admin' : retour;
    return <Navigate to={destination} replace />;
  }

  async function soumettre(evenement) {
    evenement.preventDefault();
    setEnvoi(true);
    setErreur('');

    try {
      const compte = await connexion(formulaire.email, formulaire.motDePasse);
      succes(`Bienvenue, ${compte.prenom} !`);
    } catch (erreurConnexion) {
      setErreur(erreurConnexion.message);
      setEnvoi(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6 md:py-24">
      <Revelation variante="zoom">
        <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-8 shadow-xl">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
              <span className="material-symbols-outlined text-[28px] text-on-primary">lock</span>
            </span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-on-surface">Connexion</h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              Retrouvez votre panier et vos commandes.
            </p>
          </div>

          <form onSubmit={soumettre} className="mt-8 space-y-4">
            <Champ
              label="Email"
              type="email"
              required
              autoComplete="email"
              placeholder="vous@exemple.com"
              value={formulaire.email}
              onChange={(evenement) =>
                setFormulaire((precedent) => ({ ...precedent, email: evenement.target.value }))
              }
            />

            <div className="relative">
              <Champ
                label="Mot de passe"
                type={motDePasseVisible ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={formulaire.motDePasse}
                onChange={(evenement) =>
                  setFormulaire((precedent) => ({ ...precedent, motDePasse: evenement.target.value }))
                }
              />
              <button
                type="button"
                onClick={() => setMotDePasseVisible((visible) => !visible)}
                aria-label={motDePasseVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="absolute right-3 top-8 text-on-surface-variant transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {motDePasseVisible ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {erreur && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl bg-error-container px-3 py-2.5 text-xs font-medium text-on-error-container"
              >
                <span className="material-symbols-outlined text-[16px]">error</span>
                {erreur}
              </p>
            )}

            <Bouton
              type="submit"
              taille="lg"
              className="w-full"
              disabled={envoi}
              icone={envoi ? 'progress_activity' : 'login'}
            >
              {envoi ? 'Connexion…' : 'Se connecter'}
            </Bouton>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="font-semibold text-primary hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </Revelation>
    </div>
  );
}
