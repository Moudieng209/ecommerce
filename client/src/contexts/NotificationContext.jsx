import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Bandeaux de retour (succes, erreur, information) affiches en haut a droite.
// Remplace les « alert() » et les redirections avec ?error=... du code PHP.

const NotificationContext = createContext(null);

const ICONES = {
  succes: 'check_circle',
  erreur: 'error',
  info: 'info',
};

const STYLES = {
  succes: 'bg-succes-container text-succes border-succes/20',
  erreur: 'bg-error-container text-on-error-container border-error/20',
  info: 'bg-primary-container text-on-primary-container border-primary/20',
};

export function FournisseurNotifications({ children }) {
  const [notifications, setNotifications] = useState([]);

  const retirer = useCallback((id) => {
    setNotifications((precedentes) => precedentes.filter((n) => n.id !== id));
  }, []);

  const notifier = useCallback(
    (message, type = 'succes', duree = 4000) => {
      const id = crypto.randomUUID();
      setNotifications((precedentes) => [...precedentes, { id, message, type }]);
      setTimeout(() => retirer(id), duree);
    },
    [retirer],
  );

  const valeur = useMemo(
    () => ({
      notifier,
      succes: (message) => notifier(message, 'succes'),
      erreur: (message) => notifier(message, 'erreur', 6000),
      info: (message) => notifier(message, 'info'),
    }),
    [notifier],
  );

  return (
    <NotificationContext.Provider value={valeur}>
      {children}

      {/* aria-live : le lecteur d'ecran annonce les messages qui apparaissent
          sans que l'utilisateur ait a les chercher. */}
      <div
        aria-live="polite"
        className="fixed top-20 right-4 z-100 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`entree-notification flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ${
              STYLES[notification.type]
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{ICONES[notification.type]}</span>
            <p className="flex-1 text-sm font-medium">{notification.message}</p>
            <button
              type="button"
              onClick={() => retirer(notification.id)}
              aria-label="Fermer"
              className="material-symbols-outlined text-[18px] opacity-60 hover:opacity-100"
            >
              close
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const contexte = useContext(NotificationContext);
  if (!contexte) throw new Error('useNotifications doit etre utilise dans FournisseurNotifications.');
  return contexte;
}
