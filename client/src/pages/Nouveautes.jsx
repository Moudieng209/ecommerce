import { useEffect, useState } from 'react';
import CarteProduit from '../components/CarteProduit';
import Revelation from '../components/Revelation';
import { PRODUITS_ENRICHIS } from '../data/produitsData';

export default function Nouveautes() {
  const [nouveautes, setNouveautes] = useState([]);

  useEffect(() => {
    // Filtrer les articles marques isNew ou recents
    const items = PRODUITS_ENRICHIS.filter((p) => p.isNew || p.badge === 'Nouveau' || p.badge === 'Coup de Cœur');
    setNouveautes(items.length > 0 ? items : PRODUITS_ENRICHIS.slice(0, 6));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <Revelation className="max-w-2xl mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-on-primary-container mb-2">
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span> ARRIVAGES 2026
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          Les Dernières Nouveautés En Boutique
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-on-surface-variant">
          Découvrez en avant-première nos nouvelles collections de vêtements, sneakers et accessoires fraîchement arrivés à Dakar.
        </p>
      </Revelation>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {nouveautes.map((produit, index) => (
          <Revelation key={produit.id} delai={(index % 4) * 70}>
            <CarteProduit produit={produit} />
          </Revelation>
        ))}
      </div>
    </div>
  );
}
