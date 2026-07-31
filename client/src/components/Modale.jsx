import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Fenetre modale des formulaires d'administration.
 * Rendue par portail a la racine du document : sinon, un parent en
 * `overflow: hidden` ou avec un `transform` la rognerait.
 */
export default function Modale({ titre, sousTitre, ouverte, surFermeture, taille = 'md', children }) {
  // Echap ferme la fenetre, et le defilement de la page est bloque tant
  // qu'elle est ouverte.
  useEffect(() => {
    if (!ouverte) return undefined;

    function surTouche(evenement) {
      if (evenement.key === 'Escape') surFermeture();
    }

    document.addEventListener('keydown', surTouche);
    const debordementInitial = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', surTouche);
      document.body.style.overflow = debordementInitial;
    };
  }, [ouverte, surFermeture]);

  if (!ouverte) return null;

  const largeurs = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <button
        type="button"
        aria-label="Fermer"
        onClick={surFermeture}
        className="fixed inset-0 cursor-default bg-on-surface/40 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        className={`entree-notification relative w-full ${largeurs[taille]} rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant px-6 py-5">
          <div>
            <h2 className="text-lg font-extrabold text-on-surface">{titre}</h2>
            {sousTitre && <p className="mt-1 text-xs text-on-surface-variant">{sousTitre}</p>}
          </div>

          <button
            type="button"
            onClick={surFermeture}
            aria-label="Fermer"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
