import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Revelation from '../components/Revelation';
import { Bouton, Champ } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

// Creation de compte client. Les regles de mot de passe sont verifiees par
// l'API : ce qui est affiche ici n'est qu'une aide a la saisie.

export default function Inscription() {
  const { inscription, estConnecte, chargement } = useAuth();
  const { succes } = useNotifications();

  const [formulaire, setFormulaire] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    motDePasse: '',
  });

  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const [erreurGenerale, setErreurGenerale] = useState('');

  // Redirection declarative unique, pour la meme raison que sur la page de
  // connexion : un navigate() apres l'appel API perdrait la course avec elle.
  if (!chargement && estConnecte) return <Navigate to="/produits" replace />;

  const criteres = [
    { libelle: '8 caractères minimum', valide: formulaire.motDePasse.length >= 8 },
    { libelle: 'au moins une lettre', valide: /[A-Za-z]/.test(formulaire.motDePasse) },
    { libelle: 'au moins un chiffre', valide: /[0-9]/.test(formulaire.motDePasse) },
  ];

  function modifier(champ) {
    return (evenement) => setFormulaire((precedent) => ({ ...precedent, [champ]: evenement.target.value }));
  }

  async function soumettre(evenement) {
    evenement.preventDefault();
    setEnvoi(true);
    setErreurs({});
    setErreurGenerale('');

    try {
      const compte = await inscription(formulaire);
      succes(`Votre compte est créé, bienvenue ${compte.prenom} !`);
    } catch (erreur) {
      if (erreur.details) setErreurs(Object.fromEntries(erreur.details.map((d) => [d.champ, d.message])));
      else setErreurGenerale(erreur.message);
      setEnvoi(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col justify-center px-4 py-16 sm:px-6 md:py-20">
      <Revelation variante="zoom">
        <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-8 shadow-xl">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
              <span className="material-symbols-outlined text-[28px] text-on-primary">person_add</span>
            </span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-on-surface">
              Créer un compte
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              Quelques secondes suffisent pour commencer vos achats.
            </p>
          </div>

          <form onSubmit={soumettre} className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Champ
                label="Prénom"
                required
                autoComplete="given-name"
                placeholder="Awa"
                erreur={erreurs.prenom}
                value={formulaire.prenom}
                onChange={modifier('prenom')}
              />
              <Champ
                label="Nom"
                required
                autoComplete="family-name"
                placeholder="Diop"
                erreur={erreurs.nom}
                value={formulaire.nom}
                onChange={modifier('nom')}
              />
            </div>

            <Champ
              label="Email"
              type="email"
              required
              autoComplete="email"
              placeholder="vous@exemple.com"
              erreur={erreurs.email}
              value={formulaire.email}
              onChange={modifier('email')}
            />

            <Champ
              label="Téléphone (facultatif)"
              type="tel"
              autoComplete="tel"
              placeholder="+221 77 000 00 00"
              erreur={erreurs.telephone}
              value={formulaire.telephone}
              onChange={modifier('telephone')}
            />

            <div className="relative">
              <Champ
                label="Mot de passe"
                type={motDePasseVisible ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                erreur={erreurs.motDePasse}
                value={formulaire.motDePasse}
                onChange={modifier('motDePasse')}
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

            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              {criteres.map((critere) => (
                <li
                  key={critere.libelle}
                  className={`flex items-center gap-1 text-[11px] font-medium ${
                    critere.valide ? 'text-succes' : 'text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {critere.valide ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  {critere.libelle}
                </li>
              ))}
            </ul>

            {erreurGenerale && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl bg-error-container px-3 py-2.5 text-xs font-medium text-on-error-container"
              >
                <span className="material-symbols-outlined text-[16px]">error</span>
                {erreurGenerale}
              </p>
            )}

            <Bouton
              type="submit"
              taille="lg"
              className="w-full"
              disabled={envoi}
              icone={envoi ? 'progress_activity' : 'person_add'}
            >
              {envoi ? 'Création…' : 'Créer mon compte'}
            </Bouton>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Vous avez déjà un compte ?{' '}
            <Link to="/connexion" className="font-semibold text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </Revelation>
    </div>
  );
}
