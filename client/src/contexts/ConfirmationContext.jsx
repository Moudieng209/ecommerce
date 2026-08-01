import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Remplace window.confirm(), qui affiche une boite de dialogue du navigateur
// portant l'adresse du site (« localhost:5173 indique... »), impossible a
// styler et bloquante pour le fil d'execution.
//
// L'ergonomie reste celle de window.confirm : la fonction rend une promesse
// resolue a true ou false.
//
//   const confirmer = useConfirmation();
//   if (!(await confirmer({ titre: '...', message: '...' }))) return;

const ConfirmationContext = createContext(null);

const TONS = {
  danger: {
    icone: 'warning',
    pastille: 'bg-error-container text-error',
    bouton: 'bg-error text-on-error hover:opacity-90',
  },
  primaire: {
    icone: 'help',
    pastille: 'bg-primary-container text-primary',
    bouton: 'bg-primary text-on-primary hover:opacity-90',
  },
};

export function FournisseurConfirmation({ children }) {
  const [demande, setDemande] = useState(null);

  // La promesse ouverte est mise de cote le temps que l'utilisateur tranche.
  const resoudre = useRef(null);

  const confirmer = useCallback((options) => {
    const parametres =
      typeof options === 'string' ? { message: options } : (options ?? {});

    setDemande({
      titre: parametres.titre ?? 'Confirmer l’action',
      message: parametres.message ?? '',
      libelleConfirmer: parametres.libelleConfirmer ?? 'Confirmer',
      libelleAnnuler: parametres.libelleAnnuler ?? 'Annuler',
      ton: parametres.ton ?? 'danger',
    });

    return new Promise((terminer) => {
      resoudre.current = terminer;
    });
  }, []);

  const repondre = useCallback((reponse) => {
    resoudre.current?.(reponse);
    resoudre.current = null;
    setDemande(null);
  }, []);

  const valeur = useMemo(() => confirmer, [confirmer]);

  return (
    <ConfirmationContext.Provider value={valeur}>
      {children}
      {demande && <BoiteConfirmation demande={demande} surReponse={repondre} />}
    </ConfirmationContext.Provider>
  );
}

function BoiteConfirmation({ demande, surReponse }) {
  const ton = TONS[demande.ton] ?? TONS.danger;

  // Le bouton de confirmation recoit le focus a l'ouverture : Entree valide,
  // Echap annule, comme dans la boite native.
  const boutonConfirmer = useCallback((noeud) => noeud?.focus(), []);

  function surTouche(evenement) {
    if (evenement.key === 'Escape') surReponse(false);
  }

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onKeyDown={surTouche}
      role="presentation"
    >
      <button
        type="button"
        aria-label="Annuler"
        onClick={() => surReponse(false)}
        className="fixed inset-0 cursor-default bg-on-surface/40 backdrop-blur-sm"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="titre-confirmation"
        className="entree-notification relative w-full max-w-sm overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-2xl"
      >
        <div className="px-6 pt-6 text-center">
          <span
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${ton.pastille}`}
          >
            <span className="material-symbols-outlined text-[28px]">{ton.icone}</span>
          </span>

          <h2 id="titre-confirmation" className="mt-4 text-lg font-extrabold text-on-surface">
            {demande.titre}
          </h2>

          {demande.message && (
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{demande.message}</p>
          )}
        </div>

        <div className="flex gap-2.5 p-6">
          <button
            type="button"
            onClick={() => surReponse(false)}
            className="h-11 flex-1 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low active:scale-[0.98]"
          >
            {demande.libelleAnnuler}
          </button>

          <button
            ref={boutonConfirmer}
            type="button"
            onClick={() => surReponse(true)}
            className={`h-11 flex-1 rounded-xl text-sm font-bold shadow-md transition-[transform,opacity] active:scale-[0.98] ${ton.bouton}`}
          >
            {demande.libelleConfirmer}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function useConfirmation() {
  const contexte = useContext(ConfirmationContext);
  if (!contexte) throw new Error('useConfirmation doit etre utilise dans FournisseurConfirmation.');
  return contexte;
}
