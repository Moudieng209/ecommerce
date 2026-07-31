import { useEffect, useState } from 'react';
import CarteProduit from '../components/CarteProduit';
import Revelation from '../components/Revelation';
import { PRODUITS_ENRICHIS } from '../data/produitsData';

export default function Offres() {
  const [produitsPromo, setProduitsPromo] = useState([]);
  const [tempsRestant, setTempsRestant] = useState({ heures: 12, minutes: 44, secondes: 18 });

  useEffect(() => {
    // Filtrer produits avec ancienPrix
    const promos = PRODUITS_ENRICHIS.filter((p) => p.ancienPrix && p.ancienPrix > p.prix);
    setProduitsPromo(promos);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTempsRestant((prev) => {
        if (prev.secondes > 0) return { ...prev, secondes: prev.secondes - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, secondes: 59 };
        if (prev.heures > 0) return { heures: prev.heures - 1, minutes: 59, secondes: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      {/* Hero Offres & Ventes Flash */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-secondary via-[#a87000] to-primary p-8 md:p-12 text-on-secondary shadow-xl mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-on-secondary/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider backdrop-blur">
              <span className="material-symbols-outlined text-[18px]">bolt</span> VENTES FLASH DU MOMENT
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Offres Exclusives & Remises d'Exception
            </h1>
            <p className="max-w-xl text-xs sm:text-sm text-on-secondary/90 leading-relaxed">
              Jusqu'à -50% de réduction sur une sélection d'articles limités. Premier arrivé, premier servi !
            </p>
          </div>

          {/* Horloge compte a rebours */}
          <div className="flex flex-col items-center rounded-2xl bg-surface/90 p-4 backdrop-blur text-on-surface shadow-md">
            <span className="text-xs font-bold text-outline uppercase mb-2">Fin de la vente flash dans :</span>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center justify-center rounded-xl bg-primary-container px-3 py-2 min-w-[50px]">
                <span className="text-xl font-extrabold text-on-primary-container">
                  {String(tempsRestant.heures).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-bold text-outline">HEURES</span>
              </div>
              <span className="text-xl font-bold text-primary">:</span>
              <div className="flex flex-col items-center justify-center rounded-xl bg-primary-container px-3 py-2 min-w-[50px]">
                <span className="text-xl font-extrabold text-on-primary-container">
                  {String(tempsRestant.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-bold text-outline">MINUTES</span>
              </div>
              <span className="text-xl font-bold text-primary">:</span>
              <div className="flex flex-col items-center justify-center rounded-xl bg-primary-container px-3 py-2 min-w-[50px]">
                <span className="text-xl font-extrabold text-on-primary-container">
                  {String(tempsRestant.secondes).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-bold text-outline">SECONDES</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des produits en promo */}
      <Revelation className="mb-6">
        <h2 className="text-2xl font-extrabold text-on-surface">
          Articles actuellement en promotion ({produitsPromo.length})
        </h2>
      </Revelation>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {produitsPromo.map((produit, index) => (
          <Revelation key={produit.id} delai={(index % 4) * 70}>
            <CarteProduit produit={produit} />
          </Revelation>
        ))}
      </div>
    </div>
  );
}
