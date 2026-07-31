import { Link } from 'react-router-dom';
import Revelation from '../components/Revelation';
import { CATEGORIES_ENRICHIES } from '../data/produitsData';

export default function CategoriesHub() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <Revelation className="max-w-2xl mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Répertoire Rayons</span>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          Toutes Nos Catégories
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-on-surface-variant">
          Parcourez nos rayons spécialisés et trouvez rapidement exactement ce dont vous avez besoin.
        </p>
      </Revelation>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES_ENRICHIES.map((cat, idx) => (
          <Revelation key={cat.id} delai={idx * 80}>
            <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest transition-all hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl">
              <div className="relative h-48 overflow-hidden bg-surface-container">
                <img
                  src={cat.image}
                  alt={cat.nom}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 right-4 rounded-full bg-surface-container-lowest/90 px-3 py-1 text-xs font-bold text-on-surface backdrop-blur">
                  {cat.badge}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-primary">
                    <span className="material-symbols-outlined text-[22px]">{cat.icone}</span>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">{cat.nom}</h3>
                    <span className="text-[11px] text-outline">{cat.nombreArticles} articles disponibles</span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">{cat.description}</p>

                {/* Sous-categories */}
                {cat.sousCategories && (
                  <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-outline-variant/40">
                    {cat.sousCategories.map((sub, sIdx) => (
                      <span key={sIdx} className="rounded-lg bg-surface-container-low px-2 py-1 text-[10px] font-semibold text-on-surface-variant">
                        {sub}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  to={`/produits?categorie=${cat.id}`}
                  className="mt-6 inline-flex items-center justify-between rounded-xl bg-primary-container px-4 py-2.5 text-xs font-bold text-on-primary-container transition-all hover:bg-primary hover:text-on-primary"
                >
                   Explorer le rayon
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </Revelation>
        ))}
      </div>
    </div>
  );
}
