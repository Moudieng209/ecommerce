import { useState } from 'react';
import { urlMedia } from '../api/client';

// Petits blocs d'interface partages par toutes les pages : ils tiennent dans
// un fichier unique tant qu'ils restent de simples habillages sans logique.

const VARIANTES_BOUTON = {
  primaire:
    'bg-primary text-on-primary hover:opacity-90 hover:-translate-y-0.5 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30',
  secondaire:
    'border border-outline-variant text-on-surface hover:bg-surface-container-low hover:-translate-y-0.5',
  doux: 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary',
  danger: 'bg-error text-on-error hover:opacity-90 hover:-translate-y-0.5',
  fantome: 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
};

const TAILLES_BOUTON = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-sm',
};

export function Bouton({
  variante = 'primaire',
  taille = 'md',
  icone = null,
  iconeApres = null,
  className = '',
  children,
  ...reste
}) {
  return (
    <button
      className={`group inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-[transform,opacity,background-color,color,box-shadow] active:scale-[0.98]
        disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0
        ${VARIANTES_BOUTON[variante]} ${TAILLES_BOUTON[taille]} ${className}`}
      {...reste}
    >
      {icone && <span className="material-symbols-outlined text-[18px]">{icone}</span>}
      {children}
      {iconeApres && (
        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1 motion-reduce:transition-none">
          {iconeApres}
        </span>
      )}
    </button>
  );
}

export function Champ({ label, indication, erreur, className = '', children, ...reste }) {
  const classesSaisie = `mt-1.5 w-full rounded-xl border bg-surface-container-low/50 px-3 text-sm
    text-on-surface placeholder:text-outline focus:outline-none transition-colors
    ${erreur ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'}`;

  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
        {label}
      </span>

      {children ? (
        // Cas d'un <select> ou d'un <textarea> fourni par l'appelant.
        <span className="block">{children}</span>
      ) : (
        <input className={`${classesSaisie} h-11`} {...reste} />
      )}

      {erreur && <span className="mt-1 block text-xs font-medium text-error">{erreur}</span>}
      {!erreur && indication && (
        <span className="mt-1 block text-xs text-on-surface-variant">{indication}</span>
      )}
    </label>
  );
}

/** Classes communes aux <select> et <textarea> poses dans un Champ. */
export const CLASSES_SAISIE =
  'mt-1.5 w-full rounded-xl border border-outline-variant bg-surface-container-low/50 px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors';

export function Pastille({ className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${className}`}
    >
      {children}
    </span>
  );
}

export function Chargement({ libelle = 'Chargement…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-on-surface-variant">
      <span className="material-symbols-outlined animate-spin text-[32px] text-primary motion-reduce:animate-none">
        progress_activity
      </span>
      <p className="text-sm">{libelle}</p>
    </div>
  );
}

export function EtatVide({ icone = 'inbox', titre, texte, action = null }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-outline-variant bg-surface-container-low/40 px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container">
        <span className="material-symbols-outlined text-[32px] text-outline">{icone}</span>
      </span>
      <h3 className="mt-5 text-lg font-bold text-on-surface">{titre}</h3>
      {texte && <p className="mt-2 max-w-md text-sm text-on-surface-variant">{texte}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/**
 * Image de produit avec repli : une fiche dont le fichier a disparu affiche
 * une vignette neutre plutot qu'une icone d'image cassee.
 */
export function ImageProduit({ chemin, alt, className = '' }) {
  const [echec, setEchec] = useState(false);
  const source = urlMedia(chemin);

  if (!source || echec) {
    return (
      <div className={`flex items-center justify-center bg-surface-container ${className}`}>
        <span className="material-symbols-outlined text-[32px] text-outline">image</span>
      </div>
    );
  }

  return (
    <img src={source} alt={alt} loading="lazy" onError={() => setEchec(true)} className={className} />
  );
}
