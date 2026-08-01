import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/client';
import Modale from '../../components/Modale';
import Revelation from '../../components/Revelation';
import { Bouton, Champ, CLASSES_SAISIE, Chargement, EtatVide, Pastille } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { date } from '../../utils/format';

// Comptes clients et administrateurs. La version PHP separait les tables
// « clients » et « utilisateurs » : ils sont ici reunis, distingues par un role.

const FORMULAIRE_VIDE = {
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  motDePasse: '',
  role: 'client',
  actif: true,
};

export default function AdminUtilisateurs() {
  const { utilisateur: moi } = useAuth();
  const { succes, erreur: notifierErreur } = useNotifications();
  const confirmer = useConfirmation();

  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [role, setRole] = useState('');
  const [recherche, setRecherche] = useState('');

  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [enEdition, setEnEdition] = useState(null);
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [erreurs, setErreurs] = useState({});

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const requete = new URLSearchParams();
      if (role) requete.set('role', role);
      if (recherche) requete.set('recherche', recherche);

      const donnees = await api.get(`/utilisateurs?${requete}`);
      setUtilisateurs(donnees.utilisateurs);
    } catch (erreur) {
      notifierErreur(erreur.message);
    } finally {
      setChargement(false);
    }
  }, [role, recherche, notifierErreur]);

  useEffect(() => {
    const minuterie = setTimeout(charger, 300);
    return () => clearTimeout(minuterie);
  }, [charger]);

  function ouvrir(compte = null) {
    setEnEdition(compte);
    setFormulaire(
      compte
        ? {
            prenom: compte.prenom,
            nom: compte.nom,
            email: compte.email,
            telephone: compte.telephone ?? '',
            motDePasse: '',
            role: compte.role,
            actif: compte.actif,
          }
        : FORMULAIRE_VIDE,
    );
    setErreurs({});
    setModaleOuverte(true);
  }

  async function enregistrer(evenement) {
    evenement.preventDefault();
    setEnvoi(true);
    setErreurs({});

    try {
      if (enEdition) {
        // Le mot de passe n'est transmis que s'il a ete saisi : laisse vide,
        // l'ancien reste en place.
        const corps = {
          prenom: formulaire.prenom,
          nom: formulaire.nom,
          telephone: formulaire.telephone,
          role: formulaire.role,
          actif: formulaire.actif,
        };
        if (formulaire.motDePasse) corps.motDePasse = formulaire.motDePasse;

        await api.patch(`/utilisateurs/${enEdition.id}`, corps);
        succes('Compte mis à jour.');
      } else {
        await api.post('/utilisateurs', formulaire);
        succes('Compte créé.');
      }

      setModaleOuverte(false);
      charger();
    } catch (erreur) {
      if (erreur.details) setErreurs(Object.fromEntries(erreur.details.map((d) => [d.champ, d.message])));
      else notifierErreur(erreur.message);
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer(compte) {
    const valide = await confirmer({
      titre: 'Supprimer ce compte ?',
      message: `Le compte de ${compte.prenom} ${compte.nom} sera supprimé, ainsi que ses commandes. Cette action est irréversible.`,
      libelleConfirmer: 'Supprimer',
    });
    if (!valide) return;

    try {
      await api.delete(`/utilisateurs/${compte.id}`);
      succes('Compte supprimé.');
      charger();
    } catch (erreur) {
      notifierErreur(erreur.message);
    }
  }

  return (
    <div className="space-y-6">
      <Revelation className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">Utilisateurs</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            {utilisateurs.length} compte{utilisateurs.length > 1 ? 's' : ''} enregistré
            {utilisateurs.length > 1 ? 's' : ''}.
          </p>
        </div>

        <Bouton icone="person_add" onClick={() => ouvrir()}>
          Nouveau compte
        </Bouton>
      </Revelation>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-64 flex-1">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
            search
          </span>
          <input
            type="search"
            value={recherche}
            onChange={(evenement) => setRecherche(evenement.target.value)}
            placeholder="Nom, prénom ou email…"
            aria-label="Rechercher un compte"
            className="h-11 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-3 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none"
          />
        </div>

        <select
          value={role}
          onChange={(evenement) => setRole(evenement.target.value)}
          aria-label="Filtrer par rôle"
          className={`${CLASSES_SAISIE} mt-0 h-11 w-48 bg-surface-container-lowest py-0`}
        >
          <option value="">Tous les rôles</option>
          <option value="client">Clients</option>
          <option value="admin">Administrateurs</option>
        </select>
      </div>

      {chargement ? (
        <Chargement />
      ) : utilisateurs.length === 0 ? (
        <EtatVide icone="group" titre="Aucun compte" texte="Aucun utilisateur ne correspond à ce filtre." />
      ) : (
        <Revelation className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="border-b border-outline-variant bg-surface-container-low/60 text-left">
                <tr className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Téléphone</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Commandes</th>
                  <th className="px-4 py-3">Inscription</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/60">
                {utilisateurs.map((compte) => (
                  <tr key={compte.id} className="transition-colors hover:bg-surface-container-low/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-container text-xs font-bold text-on-primary-container">
                          {compte.prenom.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-on-surface">
                            {compte.prenom} {compte.nom}
                            {compte.id === moi.id && (
                              <span className="ml-1.5 text-[11px] font-normal text-on-surface-variant">
                                (vous)
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-on-surface-variant">{compte.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-on-surface-variant">{compte.telephone ?? '—'}</td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Pastille
                          className={
                            compte.role === 'admin'
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container-low text-on-surface-variant'
                          }
                        >
                          {compte.role === 'admin' ? 'Admin' : 'Client'}
                        </Pastille>
                        {!compte.actif && (
                          <Pastille className="bg-error-container text-on-error-container">Désactivé</Pastille>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-on-surface">{compte.nombre_commandes}</td>

                    <td className="px-4 py-3 text-xs text-on-surface-variant">{date(compte.cree_le)}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => ouvrir(compte)}
                          aria-label={`Modifier ${compte.prenom} ${compte.nom}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary-container hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => supprimer(compte)}
                          disabled={compte.id === moi.id}
                          aria-label={`Supprimer ${compte.prenom} ${compte.nom}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error-container hover:text-error disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Revelation>
      )}

      <Modale
        ouverte={modaleOuverte}
        surFermeture={() => setModaleOuverte(false)}
        titre={enEdition ? 'Modifier le compte' : 'Nouveau compte'}
        sousTitre={enEdition ? enEdition.email : 'Créez un compte client ou administrateur.'}
      >
        <form onSubmit={enregistrer} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Champ
              label="Prénom"
              required
              erreur={erreurs.prenom}
              value={formulaire.prenom}
              onChange={(evenement) =>
                setFormulaire((precedent) => ({ ...precedent, prenom: evenement.target.value }))
              }
            />
            <Champ
              label="Nom"
              required
              erreur={erreurs.nom}
              value={formulaire.nom}
              onChange={(evenement) =>
                setFormulaire((precedent) => ({ ...precedent, nom: evenement.target.value }))
              }
            />
          </div>

          <Champ
            label="Email"
            type="email"
            required
            disabled={Boolean(enEdition)}
            indication={enEdition ? 'L’adresse email n’est pas modifiable.' : undefined}
            erreur={erreurs.email}
            value={formulaire.email}
            onChange={(evenement) =>
              setFormulaire((precedent) => ({ ...precedent, email: evenement.target.value }))
            }
          />

          <Champ
            label="Téléphone"
            type="tel"
            placeholder="+221 77 000 00 00"
            erreur={erreurs.telephone}
            value={formulaire.telephone}
            onChange={(evenement) =>
              setFormulaire((precedent) => ({ ...precedent, telephone: evenement.target.value }))
            }
          />

          <Champ
            label={enEdition ? 'Nouveau mot de passe' : 'Mot de passe'}
            type="password"
            required={!enEdition}
            autoComplete="new-password"
            placeholder="••••••••"
            indication={enEdition ? 'Laissez vide pour conserver l’actuel.' : '8 caractères minimum.'}
            erreur={erreurs.motDePasse}
            value={formulaire.motDePasse}
            onChange={(evenement) =>
              setFormulaire((precedent) => ({ ...precedent, motDePasse: evenement.target.value }))
            }
          />

          <Champ label="Rôle" erreur={erreurs.role}>
            <select
              value={formulaire.role}
              onChange={(evenement) =>
                setFormulaire((precedent) => ({ ...precedent, role: evenement.target.value }))
              }
              className={`${CLASSES_SAISIE} h-11 py-0`}
            >
              <option value="client">Client</option>
              <option value="admin">Administrateur</option>
            </select>
          </Champ>

          {enEdition && (
            <label className="flex items-center gap-3 rounded-xl bg-surface-container-low/60 px-4 py-3">
              <input
                type="checkbox"
                checked={formulaire.actif}
                onChange={(evenement) =>
                  setFormulaire((precedent) => ({ ...precedent, actif: evenement.target.checked }))
                }
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              <span className="text-sm">
                <span className="block font-semibold text-on-surface">Compte actif</span>
                <span className="block text-xs text-on-surface-variant">
                  Un compte désactivé ne peut plus se connecter.
                </span>
              </span>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Bouton type="button" variante="secondaire" onClick={() => setModaleOuverte(false)}>
              Annuler
            </Bouton>
            <Bouton type="submit" disabled={envoi} icone={envoi ? 'progress_activity' : 'save'}>
              {envoi ? 'Enregistrement…' : 'Enregistrer'}
            </Bouton>
          </div>
        </form>
      </Modale>
    </div>
  );
}
