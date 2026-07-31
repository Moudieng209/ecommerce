import { useState } from 'react';
import { api } from '../api/client';
import Revelation from '../components/Revelation';
import { Bouton, Champ, Pastille } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { date } from '../utils/format';

export default function Profil() {
  const { utilisateur, majUtilisateur } = useAuth();
  const { succes, erreur: notifierErreur } = useNotifications();

  const [profil, setProfil] = useState({
    prenom: utilisateur.prenom,
    nom: utilisateur.nom,
    telephone: utilisateur.telephone ?? '',
  });

  const [motsDePasse, setMotsDePasse] = useState({ ancienMotDePasse: '', nouveauMotDePasse: '' });
  const [envoiProfil, setEnvoiProfil] = useState(false);
  const [envoiMotDePasse, setEnvoiMotDePasse] = useState(false);
  const [erreurs, setErreurs] = useState({});

  async function enregistrerProfil(evenement) {
    evenement.preventDefault();
    setEnvoiProfil(true);
    setErreurs({});

    try {
      const donnees = await api.patch('/auth/profil', profil);
      majUtilisateur(donnees.utilisateur);
      succes('Profil mis à jour.');
    } catch (erreur) {
      if (erreur.details) setErreurs(Object.fromEntries(erreur.details.map((d) => [d.champ, d.message])));
      else notifierErreur(erreur.message);
    } finally {
      setEnvoiProfil(false);
    }
  }

  async function changerMotDePasse(evenement) {
    evenement.preventDefault();
    setEnvoiMotDePasse(true);
    setErreurs({});

    try {
      await api.patch('/auth/mot-de-passe', motsDePasse);
      setMotsDePasse({ ancienMotDePasse: '', nouveauMotDePasse: '' });
      succes('Mot de passe modifié.');
    } catch (erreur) {
      if (erreur.details) setErreurs(Object.fromEntries(erreur.details.map((d) => [d.champ, d.message])));
      else notifierErreur(erreur.message);
    } finally {
      setEnvoiMotDePasse(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
      <Revelation>
        <span className="text-sm font-bold uppercase tracking-wider text-primary">Votre compte</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
          Mon profil
        </h1>
      </Revelation>

      <Revelation
        delai={80}
        className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-extrabold text-on-primary">
          {utilisateur.prenom.charAt(0).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-on-surface">
            {utilisateur.prenom} {utilisateur.nom}
          </h2>
          <p className="truncate text-sm text-on-surface-variant">{utilisateur.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pastille className="bg-primary-container text-on-primary-container">
              <span className="material-symbols-outlined text-[14px]">
                {utilisateur.role === 'admin' ? 'shield_person' : 'person'}
              </span>
              {utilisateur.role === 'admin' ? 'Administrateur' : 'Client'}
            </Pastille>
            <Pastille className="bg-surface-container-low text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">calendar_month</span>
              Membre depuis le {date(utilisateur.cree_le)}
            </Pastille>
          </div>
        </div>
      </Revelation>

      <Revelation
        as="form"
        delai={140}
        onSubmit={enregistrerProfil}
        className="mt-6 space-y-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-on-surface">Informations personnelles</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Champ
            label="Prénom"
            required
            erreur={erreurs.prenom}
            value={profil.prenom}
            onChange={(evenement) =>
              setProfil((precedent) => ({ ...precedent, prenom: evenement.target.value }))
            }
          />
          <Champ
            label="Nom"
            required
            erreur={erreurs.nom}
            value={profil.nom}
            onChange={(evenement) => setProfil((precedent) => ({ ...precedent, nom: evenement.target.value }))}
          />
        </div>

        <Champ
          label="Téléphone"
          type="tel"
          placeholder="+221 77 000 00 00"
          erreur={erreurs.telephone}
          value={profil.telephone}
          onChange={(evenement) =>
            setProfil((precedent) => ({ ...precedent, telephone: evenement.target.value }))
          }
        />

        <Champ
          label="Email"
          value={utilisateur.email}
          disabled
          indication="L’adresse email ne peut pas être modifiée depuis cette page."
        />

        <Bouton type="submit" disabled={envoiProfil} icone={envoiProfil ? 'progress_activity' : 'save'}>
          {envoiProfil ? 'Enregistrement…' : 'Enregistrer'}
        </Bouton>
      </Revelation>

      <Revelation
        as="form"
        delai={200}
        onSubmit={changerMotDePasse}
        className="mt-6 space-y-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-on-surface">Mot de passe</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Champ
            label="Mot de passe actuel"
            type="password"
            required
            autoComplete="current-password"
            erreur={erreurs.ancienMotDePasse}
            value={motsDePasse.ancienMotDePasse}
            onChange={(evenement) =>
              setMotsDePasse((precedent) => ({ ...precedent, ancienMotDePasse: evenement.target.value }))
            }
          />
          <Champ
            label="Nouveau mot de passe"
            type="password"
            required
            autoComplete="new-password"
            indication="8 caractères minimum, avec au moins une lettre et un chiffre."
            erreur={erreurs.nouveauMotDePasse}
            value={motsDePasse.nouveauMotDePasse}
            onChange={(evenement) =>
              setMotsDePasse((precedent) => ({ ...precedent, nouveauMotDePasse: evenement.target.value }))
            }
          />
        </div>

        <Bouton
          type="submit"
          variante="secondaire"
          disabled={envoiMotDePasse}
          icone={envoiMotDePasse ? 'progress_activity' : 'key'}
        >
          {envoiMotDePasse ? 'Modification…' : 'Changer le mot de passe'}
        </Bouton>
      </Revelation>
    </div>
  );
}
