import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import CarteProduit from '../components/CarteProduit';
import Revelation from '../components/Revelation';
import { Bouton, CLASSES_SAISIE, EtatVide } from '../components/ui';
import { CATEGORIES_ENRICHIES, PRODUITS_ENRICHIS } from '../data/produitsData';

const TRIS = [
  { valeur: 'recent', libelle: 'Plus récents' },
  { valeur: 'prix-croissant', libelle: 'Prix croissant' },
  { valeur: 'prix-decroissant', libelle: 'Prix décroissant' },
  { valeur: 'note', libelle: 'Meilleures notes' },
  { valeur: 'nom', libelle: 'Nom (A-Z)' },
];

export default function Produits() {
  const [parametres, setParametres] = useSearchParams();

  const [produits, setProduits] = useState(PRODUITS_ENRICHIS);
  const [categories, setCategories] = useState(CATEGORIES_ENRICHIES);
  const [chargement, setChargement] = useState(false);
  const [vueGrille, setVueGrille] = useState(true);

  const recherche = parametres.get('recherche') || parametres.get('q') || '';
  const categorieId = parametres.get('categorie') ?? '';
  const tri = parametres.get('tri') ?? 'recent';

  const [saisie, setSaisie] = useState(recherche);

  const majParametre = useCallback(
    (modifications) => {
      setParametres((precedents) => {
        const suivants = new URLSearchParams(precedents);
        for (const [cle, valeur] of Object.entries(modifications)) {
          if (valeur === '' || valeur === null || valeur === undefined) suivants.delete(cle);
          else suivants.set(cle, String(valeur));
        }
        return suivants;
      });
    },
    [setParametres],
  );

  useEffect(() => {
    const minuterie = setTimeout(() => {
      if (saisie !== recherche) majParametre({ recherche: saisie });
    }, 300);
    return () => clearTimeout(minuterie);
  }, [saisie, recherche, majParametre]);

  useEffect(() => {
    api
      .get('/categories')
      .then((donnees) => {
        if (donnees.categories && donnees.categories.length > 0) setCategories(donnees.categories);
      })
      .catch(() => {});
  }, []);

  // Filtrage local dynamique
  const produitsFiltres = PRODUITS_ENRICHIS.filter((p) => {
    if (recherche) {
      const q = recherche.toLowerCase();
      const matchNom = p.nom.toLowerCase().includes(q);
      const matchCat = p.categorie.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      if (!matchNom && !matchCat && !matchDesc) return false;
    }

    if (categorieId) {
      if (p.categorie_id !== Number(categorieId)) {
        // match fuzzy avec nom si categorieId n'est pas numerique
        const catObj = CATEGORIES_ENRICHIES.find((c) => String(c.id) === String(categorieId));
        if (!catObj || p.categorie !== catObj.nom) return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (tri === 'prix-croissant') return a.prix - b.prix;
    if (tri === 'prix-decroissant') return b.prix - a.prix;
    if (tri === 'note') return (b.note || 0) - (a.note || 0);
    if (tri === 'nom') return a.nom.localeCompare(b.nom);
    return b.id - a.id;
  });

  const filtresActifs = Boolean(recherche || categorieId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      {/* En-tete Catalogue */}
      <Revelation className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Catalogue Produit</span>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          Explorez Notre Collection
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-on-surface-variant">
          {produitsFiltres.length} article{produitsFiltres.length > 1 ? 's' : ''} trouvé
          {produitsFiltres.length > 1 ? 's' : ''} — livraison express sous 48h à Dakar & régions.
        </p>
      </Revelation>

      {/* Barre de filtres & recherche */}
      <div className="mt-8 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm space-y-3">
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr_auto_auto]">
          {/* Input recherche */}
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
              search
            </span>
            <input
              type="search"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder="Rechercher une chemise, des sneakers, du parfum..."
              className="h-11 w-full rounded-xl border border-outline-variant bg-surface-container-low pl-10 pr-3 text-xs sm:text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none"
            />
          </div>

          {/* Select categorie */}
          <select
            value={categorieId}
            onChange={(e) => majParametre({ categorie: e.target.value })}
            className={`${CLASSES_SAISIE} mt-0 h-11 py-0 text-xs sm:text-sm`}
          >
            <option value="">Toutes les catégories</option>
            {CATEGORIES_ENRICHIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nom} ({cat.nombreArticles})
              </option>
            ))}
          </select>

          {/* Select Tri */}
          <select
            value={tri}
            onChange={(e) => majParametre({ tri: e.target.value })}
            className={`${CLASSES_SAISIE} mt-0 h-11 py-0 text-xs sm:text-sm`}
          >
            {TRIS.map((t) => (
              <option key={t.valeur} value={t.valeur}>
                {t.libelle}
              </option>
            ))}
          </select>

          {/* Switcher vue grille / liste */}
          <div className="flex items-center gap-1 border border-outline-variant rounded-xl p-1 bg-surface-container-low">
            <button
              type="button"
              onClick={() => setVueGrille(true)}
              aria-label="Vue Grille"
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                vueGrille ? 'bg-primary text-on-primary shadow-sm' : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setVueGrille(false)}
              aria-label="Vue Liste"
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                !vueGrille ? 'bg-primary text-on-primary shadow-sm' : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>

          {/* Bouton reset filtres */}
          {filtresActifs && (
            <Bouton
              variante="secondaire"
              icone="filter_alt_off"
              onClick={() => {
                setSaisie('');
                setParametres(new URLSearchParams());
              }}
            >
              Effacer
            </Bouton>
          )}
        </div>

        {/* Pilules filtres actifs */}
        {filtresActifs && (
          <div className="flex flex-wrap items-center gap-2 border-t border-outline-variant/60 pt-3 text-xs">
            <span className="font-bold text-outline">Filtres actifs :</span>
            {recherche && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-container px-3 py-1 text-on-primary-container font-bold">
                "{recherche}"
                <button
                  type="button"
                  onClick={() => {
                    setSaisie('');
                    majParametre({ recherche: null, q: null });
                  }}
                  className="hover:text-error"
                >
                  ✕
                </button>
              </span>
            )}
            {categorieId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 text-on-secondary-container font-bold">
                Catégorie #{categorieId}
                <button
                  type="button"
                  onClick={() => majParametre({ categorie: null })}
                  className="hover:text-error"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grille ou Liste de produits */}
      {produitsFiltres.length === 0 ? (
        <div className="mt-10">
          <EtatVide
            icone="search_off"
            titre="Aucun produit trouvé"
            texte="Essayez avec d'autres mots-clés ou supprimez vos filtres pour réafficher le catalogue."
            action={
              <Bouton
                onClick={() => {
                  setSaisie('');
                  setParametres(new URLSearchParams());
                }}
              >
                Réinitialiser le catalogue
              </Bouton>
            }
          />
        </div>
      ) : (
        <div
          className={`mt-8 grid gap-6 ${
            vueGrille ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'
          }`}
        >
          {produitsFiltres.map((produit, index) => (
            <Revelation key={produit.id} delai={(index % 4) * 60}>
              <CarteProduit produit={produit} />
            </Revelation>
          ))}
        </div>
      )}
    </div>
  );
}
