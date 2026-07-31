import { useState } from 'react';
import { api } from '../api/client';
import Revelation from '../components/Revelation';
import { Bouton, Champ, CLASSES_SAISIE } from '../components/ui';
import { EMAIL_CONTACT, TELEPHONE_CONTACT } from '../components/PiedDePage';
import { useAuth } from '../contexts/AuthContext';

// Formulaire de contact. Le message part en POST vers l'API, la ou la version
// PHP l'envoyait en GET — l'adresse de la page contenait alors tout le message.

const COORDONNEES = [
  {
    icone: 'location_on',
    libelle: 'Adresse',
    valeur: 'Dakar, Sénégal',
    detail: 'Livraison dans toute l’agglomération',
  },
  { icone: 'mail', libelle: 'Email', valeur: EMAIL_CONTACT, detail: 'Réponse sous 24h ouvrées' },
  { icone: 'call', libelle: 'Téléphone', valeur: TELEPHONE_CONTACT, detail: 'Du lundi au samedi, 9h — 19h' },
];

export default function Contact() {
  const { utilisateur } = useAuth();

  const [formulaire, setFormulaire] = useState({
    prenom: utilisateur?.prenom ?? '',
    nom: utilisateur?.nom ?? '',
    email: utilisateur?.email ?? '',
    telephone: utilisateur?.telephone ?? '',
    contenu: '',
  });

  const [envoi, setEnvoi] = useState({ etat: 'repos', message: '' });
  const [erreurs, setErreurs] = useState({});

  function modifier(champ) {
    return (evenement) => setFormulaire((precedent) => ({ ...precedent, [champ]: evenement.target.value }));
  }

  async function envoyer(evenement) {
    evenement.preventDefault();
    setEnvoi({ etat: 'en-cours', message: '' });
    setErreurs({});

    try {
      await api.post('/messages', formulaire);
      setFormulaire((precedent) => ({ ...precedent, contenu: '' }));
      setEnvoi({
        etat: 'succes',
        message: 'Message envoyé. Notre équipe vous répond sous 24h ouvrées.',
      });
    } catch (erreur) {
      if (erreur.details) {
        setErreurs(Object.fromEntries(erreur.details.map((d) => [d.champ, d.message])));
        setEnvoi({ etat: 'erreur', message: 'Veuillez corriger les champs signalés.' });
      } else {
        setEnvoi({ etat: 'erreur', message: erreur.message });
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <Revelation className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-bold uppercase tracking-wider text-primary">Contact</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
          Nous sommes à votre écoute
        </h1>
        <p className="mt-4 text-lg text-on-surface-variant">
          Une question sur un article, une commande en cours ou une demande particulière ?
          Écrivez-nous, nous vous répondons rapidement.
        </p>
      </Revelation>

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-3">
          {COORDONNEES.map((coordonnee, index) => (
            <Revelation
              key={coordonnee.libelle}
              variante="gauche"
              delai={index * 110}
              className="group flex items-center gap-4 rounded-2xl bg-surface-container-low/70 px-5 py-4 transition-[transform,background-color] duration-300 hover:translate-x-1 hover:bg-surface-container"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-container transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:transform-none">
                <span className="material-symbols-outlined text-[22px] text-primary">
                  {coordonnee.icone}
                </span>
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                  {coordonnee.libelle}
                </span>
                <span className="block truncate text-sm font-bold text-on-surface">
                  {coordonnee.valeur}
                </span>
                <span className="block text-xs text-on-surface-variant">{coordonnee.detail}</span>
              </span>
            </Revelation>
          ))}

          <Revelation
            variante="gauche"
            delai={330}
            className="rounded-2xl border border-dashed border-primary/40 bg-primary-container/30 px-5 py-4"
          >
            <p className="flex items-start gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
              Les messages envoyés le dimanche sont traités le lundi matin.
            </p>
          </Revelation>
        </div>

        <Revelation
          as="form"
          variante="droite"
          onSubmit={envoyer}
          className="space-y-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Champ
              label="Prénom"
              required
              placeholder="Votre prénom"
              erreur={erreurs.prenom}
              value={formulaire.prenom}
              onChange={modifier('prenom')}
            />
            <Champ
              label="Nom"
              required
              placeholder="Votre nom"
              erreur={erreurs.nom}
              value={formulaire.nom}
              onChange={modifier('nom')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Champ
              label="Email"
              type="email"
              required
              placeholder="vous@exemple.com"
              erreur={erreurs.email}
              value={formulaire.email}
              onChange={modifier('email')}
            />
            <Champ
              label="Téléphone"
              type="tel"
              placeholder="+221 77 000 00 00"
              erreur={erreurs.telephone}
              value={formulaire.telephone}
              onChange={modifier('telephone')}
            />
          </div>

          <Champ label="Message" erreur={erreurs.contenu}>
            <textarea
              required
              rows={6}
              minLength={10}
              placeholder="Votre message…"
              value={formulaire.contenu}
              onChange={modifier('contenu')}
              className={`${CLASSES_SAISIE} resize-y`}
            />
          </Champ>

          <Bouton
            type="submit"
            taille="lg"
            className="w-full"
            disabled={envoi.etat === 'en-cours'}
            iconeApres={envoi.etat === 'en-cours' ? undefined : 'send'}
            icone={envoi.etat === 'en-cours' ? 'progress_activity' : undefined}
          >
            {envoi.etat === 'en-cours' ? 'Envoi en cours…' : 'Envoyer le message'}
          </Bouton>

          {/* aria-live : l'issue de l'envoi est la seule chose qui change apres
              la soumission, un lecteur d'ecran ne la verrait pas sans avertissement. */}
          <p
            aria-live="polite"
            className={`text-center text-xs ${
              envoi.etat === 'succes'
                ? 'font-semibold text-succes'
                : envoi.etat === 'erreur'
                  ? 'font-semibold text-error'
                  : 'text-on-surface-variant'
            }`}
          >
            {envoi.etat === 'succes' || envoi.etat === 'erreur'
              ? envoi.message
              : `Votre message est transmis directement à notre équipe, à destination de ${EMAIL_CONTACT}.`}
          </p>
        </Revelation>
      </div>
    </div>
  );
}
