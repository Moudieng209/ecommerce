import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/client';
import Revelation from '../../components/Revelation';
import { Bouton, Chargement, EtatVide, Pastille } from '../../components/ui';
import { useNotifications } from '../../contexts/NotificationContext';
import { dateHeure } from '../../utils/format';

// Messages recus depuis le formulaire de contact.

export default function AdminMessages() {
  const { succes, erreur: notifierErreur } = useNotifications();

  const [messages, setMessages] = useState([]);
  const [nonLus, setNonLus] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState('tous');

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const donnees = await api.get('/messages');
      setMessages(donnees.messages);
      setNonLus(donnees.nonLus);
    } catch (erreur) {
      notifierErreur(erreur.message);
    } finally {
      setChargement(false);
    }
  }, [notifierErreur]);

  useEffect(() => {
    charger();
  }, [charger]);

  async function basculerLu(message) {
    try {
      const donnees = await api.patch(`/messages/${message.id}/lu`);
      setMessages((precedents) =>
        precedents.map((element) => (element.id === message.id ? donnees.message : element)),
      );
      setNonLus((precedent) => precedent + (donnees.message.lu ? -1 : 1));
    } catch (erreur) {
      notifierErreur(erreur.message);
    }
  }

  async function supprimer(message) {
    if (!window.confirm(`Supprimer le message de ${message.prenom} ${message.nom} ?`)) return;

    try {
      await api.delete(`/messages/${message.id}`);
      succes('Message supprimé.');
      charger();
    } catch (erreur) {
      notifierErreur(erreur.message);
    }
  }

  const messagesAffiches = messages.filter((message) => {
    if (filtre === 'non-lus') return !message.lu;
    if (filtre === 'lus') return message.lu;
    return true;
  });

  return (
    <div className="space-y-6">
      <Revelation className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">Messages</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            {messages.length} message{messages.length > 1 ? 's' : ''} reçu
            {messages.length > 1 ? 's' : ''}
            {nonLus > 0 && ` · ${nonLus} non lu${nonLus > 1 ? 's' : ''}`}.
          </p>
        </div>

        <div className="flex gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest p-1">
          {[
            { valeur: 'tous', libelle: 'Tous' },
            { valeur: 'non-lus', libelle: 'Non lus' },
            { valeur: 'lus', libelle: 'Lus' },
          ].map((onglet) => (
            <button
              key={onglet.valeur}
              type="button"
              onClick={() => setFiltre(onglet.valeur)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filtre === onglet.valeur
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {onglet.libelle}
            </button>
          ))}
        </div>
      </Revelation>

      {chargement ? (
        <Chargement />
      ) : messagesAffiches.length === 0 ? (
        <EtatVide
          icone="mail"
          titre="Aucun message"
          texte="Les messages envoyés depuis la page Contact apparaîtront ici."
        />
      ) : (
        <div className="space-y-3">
          {messagesAffiches.map((message, index) => (
            <Revelation
              key={message.id}
              delai={Math.min(index, 6) * 60}
              className={`rounded-2xl border p-5 transition-colors ${
                message.lu
                  ? 'border-outline-variant bg-surface-container-lowest'
                  : 'border-primary/30 bg-primary-container/20'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-sm font-bold text-on-primary-container">
                    {message.prenom.charAt(0).toUpperCase()}
                  </span>

                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-bold text-on-surface">
                      {message.prenom} {message.nom}
                      {!message.lu && (
                        <Pastille className="bg-primary text-on-primary">Nouveau</Pastille>
                      )}
                    </p>
                    <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-on-surface-variant">
                      <a href={`mailto:${message.email}`} className="hover:text-primary hover:underline">
                        {message.email}
                      </a>
                      {message.telephone && <span>{message.telephone}</span>}
                      <span>{dateHeure(message.cree_le)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => basculerLu(message)}
                    aria-label={message.lu ? 'Marquer comme non lu' : 'Marquer comme lu'}
                    title={message.lu ? 'Marquer comme non lu' : 'Marquer comme lu'}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary-container hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {message.lu ? 'mark_email_unread' : 'mark_email_read'}
                    </span>
                  </button>

                  <a
                    href={`mailto:${message.email}?subject=Re: votre message a 3MT-Shopping`}
                    aria-label="Répondre par email"
                    title="Répondre par email"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary-container hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[18px]">reply</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => supprimer(message)}
                    aria-label="Supprimer le message"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              {/* whitespace-pre-line : les retours a la ligne saisis par le
                  visiteur sont conserves a l'affichage. */}
              <p className="mt-4 whitespace-pre-line border-t border-outline-variant/60 pt-4 text-sm leading-relaxed text-on-surface-variant">
                {message.contenu}
              </p>
            </Revelation>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <p className="text-center">
          <Bouton variante="fantome" icone="refresh" onClick={charger}>
            Actualiser
          </Bouton>
        </p>
      )}
    </div>
  );
}
