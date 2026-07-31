import { useState } from 'react';

// Logos des moyens de paiement, dessines en SVG : aucune requete reseau, donc
// rien qui casse hors ligne, et un rendu net a toutes les tailles.
//
// Pour utiliser les visuels officiels d'un operateur a la place, deposez le
// fichier dans client/public/logos/ sous le nom de la cle (wave.png,
// orange-money.png, carte.png, especes.png) : il est alors prefere au dessin.
// Ce dossier n'est pas relaye vers l'API, contrairement a /images.

function LogoWave() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className="h-full w-full">
      <rect width="32" height="32" rx="8" fill="#1DC8FF" />
      {/* Deux vagues, en rappel du nom de l'operateur */}
      <path
        d="M5 19.5c2.6 0 2.6-3 5.2-3s2.6 3 5.2 3 2.6-3 5.2-3 2.6 3 5.2 3"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M5 13.5c2.6 0 2.6-3 5.2-3s2.6 3 5.2 3 2.6-3 5.2-3 2.6 3 5.2 3"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
}

function LogoOrangeMoney() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className="h-full w-full">
      {/* Carre orange de l'operateur, avec le libelle en reserve blanche */}
      <rect width="32" height="32" rx="8" fill="#FF7900" />
      <rect x="6" y="18.5" width="20" height="7" rx="1.5" fill="#fff" />
      <text
        x="16"
        y="24"
        textAnchor="middle"
        fontSize="5.2"
        fontWeight="700"
        fill="#FF7900"
        fontFamily="Inter, system-ui, sans-serif"
      >
        money
      </text>
      <circle cx="16" cy="11.5" r="4.5" fill="#fff" />
      <path d="M16 8.6v5.8M14 10.1h3a1.45 1.45 0 0 1 0 2.9h-3" stroke="#FF7900" strokeWidth="1.1" fill="none" />
    </svg>
  );
}

function LogoCarte() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className="h-full w-full">
      <rect width="32" height="32" rx="8" fill="#F4F6F8" />
      {/* Les deux disques entrelaces des cartes de paiement internationales */}
      <circle cx="13" cy="16" r="6.6" fill="#EB001B" />
      <circle cx="19" cy="16" r="6.6" fill="#F79E1B" />
      <path
        d="M16 11.1a6.6 6.6 0 0 0 0 9.8 6.6 6.6 0 0 0 0-9.8z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function LogoEspeces() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className="h-full w-full">
      <rect width="32" height="32" rx="8" fill="#E8F5EC" />
      <rect x="5.5" y="10" width="21" height="12" rx="2" fill="#1B6B3A" />
      <circle cx="16" cy="16" r="3.4" fill="#E8F5EC" />
      <circle cx="9.5" cy="13" r="1.1" fill="#E8F5EC" opacity="0.8" />
      <circle cx="22.5" cy="19" r="1.1" fill="#E8F5EC" opacity="0.8" />
    </svg>
  );
}

const LOGOS = {
  wave: { composant: LogoWave, nom: 'Wave' },
  'orange-money': { composant: LogoOrangeMoney, nom: 'Orange Money' },
  carte: { composant: LogoCarte, nom: 'Carte bancaire' },
  especes: { composant: LogoEspeces, nom: 'Especes' },
};

/**
 * Affiche le logo d'un moyen de paiement.
 * `cle` : wave | orange-money | carte | especes
 */
export default function LogoPaiement({ cle, className = 'h-7 w-7' }) {
  const [fichierAbsent, setFichierAbsent] = useState(false);

  const entree = LOGOS[cle];
  if (!entree) return null;

  const Dessin = entree.composant;

  // Pastille blanche commune : les boutons de paiement ont des fonds colores
  // (bleu Wave, orange Orange Money) sur lesquels un logo de meme teinte se
  // fondrait. Le liseré blanc le detache dans tous les cas.
  const pastille = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 shadow-sm ${className}`;

  // Le fichier officiel prime tant qu'il est present ; sinon on retombe sur le
  // dessin, sans laisser d'image cassee a l'ecran.
  if (!fichierAbsent) {
    return (
      <span className={pastille}>
        <img
          src={`/logos/${cle}.png`}
          alt={entree.nom}
          onError={() => setFichierAbsent(true)}
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  return (
    <span className={pastille} title={entree.nom}>
      <Dessin />
    </span>
  );
}

/** Bandeau des moyens acceptes, pour le pied du recapitulatif. */
export function MoyensAcceptes({ className = '' }) {
  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      {Object.keys(LOGOS).map((cle) => (
        <LogoPaiement key={cle} cle={cle} className="h-6 w-6" />
      ))}
    </span>
  );
}
