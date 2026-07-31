import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import CarteProduit from '../components/CarteProduit';
import Revelation from '../components/Revelation';
import { Bouton, CLASSES_SAISIE, EtatVide } from '../components/ui';

// Catalogue : recherche, filtre par categorie et par prix, tri et pagination.
// Tous les criteres vivent dans l'URL, ce qui rend chaque resultat partageable
// et rejouable par le bouton « precedent » du navigateur.

const TRIS = [
  { valeur: 'recent', libelle: 'Plus récents' },
  { valeur: 'prix-croissant', libelle: 'Prix croissant' },
  { valeur: 'prix-decroissant', libelle: 'Prix décroissant' },
  { valeur: 'nom', libelle: 'Nom (A-Z)' },
];

export default function Produits() {
  const [parametres, setParametres] = useSearchParams();

  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [chargement, setChargement] = useState(true);

  const recherche = parametres.get('recherche') ?? '';
  const categorie = parametres.get('categorie') ?? '';
  const tri = parametres.get('tri') ?? 'recent';
  const page = Number(parametres.get('page') ?? 1);

  // Champ de recherche non controle par l'URL : il se met a jour a chaque frappe
  // alors que l'URL n'est modifiee qu'apres une pause (anti-rebond plus bas).
  const [saisie, setSaisie] = useState(recherche);

  const majParametre = useCallback(
    (modifications) => {
      setParametres((precedents) => {
        const suivants = new URLSearchParams(precedents);

        for (const [cle, valeur] of Object.entries(modifications)) {
          if (valeur === '' || valeur === null || valeur === undefined) suivants.delete(cle);
          else suivants.set(cle, String(valeur));
        }

        // Changer un filtre doit ramener a la premiere page, sinon on atterrit
        // sur une page vide.
        if (!('page' in modifications)) suivants.delete('page');

        return suivants;
      });
    },
    [setParametres],
  );

  // Anti-rebond : on attend 350 ms de silence avant de lancer la recherche,
  // plutot qu'une requete par caractere tape.
  useEffect(() => {
    const minuterie = setTimeout(() => {
      if (saisie !== recherche) majParametre({ recherche: saisie });
    }, 350);

    return () => clearTimeout(minuterie);
  }, [saisie, recherche, majParametre]);

  useEffect(() => {
    api
      .get('/categories')
      .then((donnees) => setCategories(donnees.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let annule = false;
    setChargement(true);

    const requete = new URLSearchParams({ page: String(page), parPage: '12', tri });
    if (recherche) requete.set('recherche', recherche);
    if (categorie) requete.set('categorie', categorie);

    api
      .get(`/produits?${requete}`)
      .then((donnees) => {
        if (annule) return;
        setProduits(donnees.produits);
        setPagination(donnees.pagination);
      })
      .catch(() => {
        if (!annule) setProduits([]);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => {
      annule = true;
    };
  }, [recherche, categorie, tri, page]);

  const filtresActifs = Boolean(recherche || categorie);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <Revelation className="max-w-2xl">
        <span className="text-sm font-bold uppercase tracking-wider text-primary">Notre catalogue</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
          Tous nos produits
        </h1>
        <p className="mt-4 text-lg text-on-surface-variant">
          {pagination.total} article{pagination.total > 1 ? 's' : ''} disponible
          {pagination.total > 1 ? 's' : ''} — filtrez par rayon, prix ou mot-clé.
        </p>
      </Revelation>

      {/* --- Barre de filtres --- */}
      <div className="mt-10 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr_auto]">
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
              search
            </span>
            <input
              type="search"
              value={saisie}
              onChange={(evenement) => setSaisie(evenement.target.value)}
              placeholder="Rechercher un article…"
              aria-label="Rechercher un article"
              className="h-11 w-full rounded-xl border border-outline-variant bg-surface-container-low/50 pl-10 pr-3 text-sm text-on-surface placeholder:text-outline transition-colors focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={categorie}
            onChange={(evenement) => majParametre({ categorie: evenement.target.value })}
            aria-label="Filtrer par catégorie"
            className={`${CLASSES_SAISIE} mt-0 h-11 py-0`}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((element) => (
              <option key={element.id} value={element.id}>
                {element.nom} ({element.nombre_produits})
              </option>
            ))}
          </select>

          <select
            value={tri}
            onChange={(evenement) => majParametre({ tri: evenement.target.value })}
            aria-label="Trier les résultats"
            className={`${CLASSES_SAISIE} mt-0 h-11 py-0`}
          >
            {TRIS.map((option) => (
              <option key={option.valeur} value={option.valeur}>
                {option.libelle}
              </option>
            ))}
          </select>

          {filtresActifs && (
            <Bouton
              variante="secondaire"
              icone="filter_alt_off"
              onClick={() => {
                setSaisie('');
                setParametres(new URLSearchParams());
              }}
            >
              Réinitialiser
            </Bouton>
          )}
        </div>
      </div>

      {/* --- Resultats --- */}
      {chargement ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="squelette h-80 rounded-2xl border border-outline-variant" aria-hidden />
          ))}
        </div>
      ) : produits.length === 0 ? (
        <div className="mt-10">
          <EtatVide
            icone="search_off"
            titre="Aucun article ne correspond"
            texte="Essayez avec d’autres mots-clés, ou retirez les filtres appliqués pour voir tout le catalogue."
            action={
              filtresActifs && (
                <Bouton
                  onClick={() => {
                    setSaisie('');
                    setParametres(new URLSearchParams());
                  }}
                >
                  Voir tout le catalogue
                </Bouton>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {produits.map((produit, index) => (
              <Revelation key={produit.id} delai={(index % 4) * 80}>
                <CarteProduit produit={produit} />
              </Revelation>
            ))}
          </div>

          {pagination.pages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
              <Bouton
                variante="secondaire"
                taille="sm"
                icone="chevron_left"
                disabled={page <= 1}
                onClick={() => majParametre({ page: page - 1 })}
              >
                Précédent
              </Bouton>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.pages }, (_, index) => index + 1)
                  // Fenetre glissante autour de la page courante : au-dela de
                  // sept pages, tout afficher deborderait sur mobile.
                  .filter(
                    (numero) =>
                      numero === 1 ||
                      numero === pagination.pages ||
                      Math.abs(numero - page) <= 1,
                  )
                  .map((numero, index, liste) => (
                    <span key={numero} className="flex items-center gap-1">
                      {index > 0 && liste[index - 1] !== numero - 1 && (
                        <span className="px-1 text-on-surface-variant">…</span>
                      )}
                      <button
                        type="button"
                        onClick={() => majParametre({ page: numero })}
                        aria-current={numero === page ? 'page' : undefined}
                        className={`h-9 w-9 rounded-xl text-sm font-semibold transition-colors ${
                          numero === page
                            ? 'bg-primary text-on-primary'
                            : 'border border-outline-variant text-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        {numero}
                      </button>
                    </span>
                  ))}
              </div>

              <Bouton
                variante="secondaire"
                taille="sm"
                iconeApres="chevron_right"
                disabled={page >= pagination.pages}
                onClick={() => majParametre({ page: page + 1 })}
              >
                Suivant
              </Bouton>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
