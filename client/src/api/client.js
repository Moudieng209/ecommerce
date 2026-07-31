// Client HTTP unique de l'application.
// En developpement, Vite relaie /api vers le serveur Express : l'origine est
// donc la meme et le cookie de session voyage sans configuration. En
// production, VITE_API_URL pointe vers l'API deployee.

const BASE = import.meta.env.VITE_API_URL ?? '';

export class ErreurApi extends Error {
  constructor(message, statut, details) {
    super(message);
    this.name = 'ErreurApi';
    this.statut = statut;
    this.details = details ?? null;
  }
}

async function requete(chemin, { methode = 'GET', corps, formData } = {}) {
  const options = {
    method: methode,
    // Indispensable : sans cela le navigateur n'envoie pas le cookie httpOnly.
    credentials: 'include',
    headers: {},
  };

  if (formData) {
    // Le navigateur doit poser lui-meme le Content-Type avec la limite multipart.
    options.body = formData;
  } else if (corps !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(corps);
  }

  let reponse;
  try {
    reponse = await fetch(`${BASE}/api${chemin}`, options);
  } catch {
    throw new ErreurApi('Serveur injoignable. Verifiez que l API est demarree.', 0);
  }

  // 204 et corps vide : rien a analyser.
  const texte = await reponse.text();
  const donnees = texte ? JSON.parse(texte) : null;

  if (!reponse.ok) {
    throw new ErreurApi(donnees?.erreur ?? 'Une erreur est survenue.', reponse.status, donnees?.details);
  }

  return donnees;
}

export const api = {
  get: (chemin) => requete(chemin),
  post: (chemin, corps) => requete(chemin, { methode: 'POST', corps }),
  patch: (chemin, corps) => requete(chemin, { methode: 'PATCH', corps }),
  delete: (chemin) => requete(chemin, { methode: 'DELETE' }),
  envoyerFormulaire: (chemin, formData, methode = 'POST') => requete(chemin, { methode, formData }),
};

/** URL absolue d'une image (catalogue historique ou fichier televerse). */
export function urlMedia(chemin) {
  if (!chemin) return null;
  if (chemin.startsWith('http')) return chemin;
  return `${BASE}${chemin}`;
}
