import { Link } from 'react-router-dom';
import Revelation from '../components/Revelation';
import { useNotifications } from '../contexts/NotificationContext';
import { usePanier } from '../contexts/PanierContext';
import { PACKS_ENRICHIS, PRODUITS_ENRICHIS } from '../data/produitsData';

export default function Packs() {
  const { ajouter } = usePanier();
  const { succes } = useNotifications();

  const ajouterPack = async (pack) => {
    for (const id of pack.produitIds) {
      await ajouter(id, 1);
    }
    succes(`Pack ${pack.nom} ajouté à votre panier !`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <Revelation className="max-w-2xl mb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3.5 py-1 text-xs font-extrabold text-on-secondary-container mb-2">
          <span className="material-symbols-outlined text-[16px]">inventory_2</span> OFFRES LOTS ASSORTIS
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          Packs & Ensembles Thématiques
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-on-surface-variant">
          Économisez jusqu'à 25% en achetant vos tenues et équipements complets regroupés en un seul clic !
        </p>
      </Revelation>

      <div className="space-y-8">
        {PACKS_ENRICHIS.map((pack, idx) => (
          <Revelation key={pack.id} delai={idx * 90}>
            <div className="grid gap-6 rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 md:grid-cols-12 md:p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="md:col-span-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-extrabold text-on-secondary-container">
                    {pack.reduction}
                  </span>
                  <span className="text-xs font-bold text-primary">{pack.badge}</span>
                </div>

                <h2 className="text-2xl font-extrabold text-on-surface">{pack.nom}</h2>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">{pack.description}</p>

                {/* Produits inclus dans le pack */}
                <div>
                  <span className="block text-xs font-bold text-on-surface mb-3">Articles inclus dans ce pack :</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {pack.produitIds.map((pId) => {
                      const p = PRODUITS_ENRICHIS.find((item) => item.id === pId);
                      return (
                        p && (
                          <Link
                            key={pId}
                            to={`/produits/${p.id}`}
                            className="flex items-center gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low p-2.5 hover:bg-surface-container"
                          >
                            <img src={p.image} alt={p.nom} className="h-12 w-12 rounded-xl object-cover" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-on-surface truncate">{p.nom}</p>
                              <p className="text-[11px] font-extrabold text-primary">
                                {p.prix.toLocaleString('fr-FR')} FCFA
                              </p>
                            </div>
                          </Link>
                        )
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Prix pack & CTA */}
              <div className="md:col-span-4 flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-outline-variant/60 pt-6 md:pt-0 md:pl-8 space-y-4 text-center md:text-right">
                <div>
                  <span className="text-xs text-outline line-through block">
                    Valeur individuelle : {pack.prixOriginal.toLocaleString('fr-FR')} FCFA
                  </span>
                  <span className="text-3xl font-extrabold text-primary">
                    {pack.prixPack.toLocaleString('fr-FR')} FCFA
                  </span>
                  <span className="block text-xs font-bold text-succes mt-1">
                    Économisez {(pack.prixOriginal - pack.prixPack).toLocaleString('fr-FR')} FCFA !
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => ajouterPack(pack)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text.xs sm:text-sm font-extrabold text-on-primary shadow-lg shadow-primary/25 transition-transform active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                  Ajouter le pack complet
                </button>
              </div>
            </div>
          </Revelation>
        ))}
      </div>
    </div>
  );
}
