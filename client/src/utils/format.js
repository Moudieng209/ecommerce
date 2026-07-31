// Formatage partage par toute l'application.

const FORMAT_NOMBRE = new Intl.NumberFormat('fr-FR');

/** 30500 -> « 30 500 cfa » */
export function prix(montant, devise = 'cfa') {
  const valeur = Number(montant ?? 0);
  return `${FORMAT_NOMBRE.format(valeur)} ${devise}`;
}

/** Date ISO -> « 31 juillet 2026 » */
export function date(valeur) {
  if (!valeur) return '';
  return new Date(valeur).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Date ISO -> « 31/07/2026 a 16:07 » */
export function dateHeure(valeur) {
  if (!valeur) return '';
  const instant = new Date(valeur);
  return `${instant.toLocaleDateString('fr-FR')} a ${instant.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

/** Couleurs associees aux statuts de commande, pour les pastilles. */
export const COULEURS_STATUT = {
  'En attente': 'bg-secondary-container text-on-secondary-container',
  Validee: 'bg-primary-container text-on-primary-container',
  Expediee: 'bg-surface-container-high text-on-surface',
  Livree: 'bg-succes-container text-succes',
  Annulee: 'bg-error-container text-on-error-container',
};

/** Libelles affiches : la base stocke des valeurs sans accent. */
export const LIBELLES_STATUT = {
  'En attente': 'En attente',
  Validee: 'Validée',
  Expediee: 'Expédiée',
  Livree: 'Livrée',
  Annulee: 'Annulée',
};
