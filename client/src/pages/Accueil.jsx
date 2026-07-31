import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, urlMedia } from '../api/client';
import CarteProduit from '../components/CarteProduit';
import Revelation from '../components/Revelation';
import { Bouton } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { usePanier } from '../contexts/PanierContext';
import {
  AVIS_CLIENTS,
  CATEGORIES_ENRICHIES,
  PACKS_ENRICHIS,
  PRODUITS_ENRICHIS,
} from '../data/produitsData';

const STATS = [
  { valeur: '24/7', libelle: 'Commande en ligne' },
  { valeur: '48h', libelle: 'Livraison à Dakar' },
  { valeur: '100%', libelle: 'Paiement à la livraison' },
  { valeur: '15 000+', libelle: 'Clients satisfaits' },
];

const ENGAGEMENTS = [
  {
    icone: 'verified',
    titre: 'Qualité 100% Vérifiée',
    texte: 'Chaque vêtement, chaussure et accessoire est contrôlé avec soin avant expédition.',
  },
  {
    icone: 'local_shipping',
    titre: 'Livraison Éclair 48h',
    texte: 'Expédition sous 24h et livraison à domicile partout à Dakar et régions.',
  },
  {
    icone: 'payments',
    titre: 'Paiement à la Livraison',
    texte: 'Payer en liquide ou via Wave / Orange Money à la réception du colis.',
  },
  {
    icone: 'support_agent',
    titre: 'Support WhatsApp 7j/7',
    texte: 'Une question sur les tailles ou un suivi ? Notre équipe vous répond immédiatement.',
  },
  {
    icone: 'sync',
    titre: 'Échange Gratuit 7 Jours',
    texte: 'Taille trop grande ou couleur non conforme ? Échange simple en 7 jours.',
  },
  {
    icone: 'military_tech',
    titre: 'Garantie Authenticité',
    texte: 'Produits authentiques de grandes marques certifiées et créateurs locaux.',
  },
];

const VISUELS_HERO = ['/images/home8.jpg', '/images/home9.jpg', '/images/home16.jpg', '/images/home10.jpg'];

export default function Accueil() {
  const { estConnecte } = useAuth();
  const { ajouter } = usePanier();

  const [produits, setProduits] = useState(PRODUITS_ENRICHIS);
  const [categories, setCategories] = useState(CATEGORIES_ENRICHIES);
  const [chargement, setChargement] = useState(false);
  const [visuel, setVisuel] = useState(0);
  const [pageDefilee, setPageDefilee] = useState(false);

  // Compte a rebours Vente Flash
  const [tempsRestant, setTempsRestant] = useState({ heures: 14, minutes: 35, secondes: 22 });

  useEffect(() => {
    let annule = false;
    api
      .get('/produits?parPage=8&tri=recent')
      .then((reponse) => {
        if (!annule && reponse.produits && reponse.produits.length > 0) {
          setProduits(reponse.produits);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => {
      annule = true;
    };
  }, []);

  useEffect(() => {
    const minuterie = setInterval(() => {
      setVisuel((precedent) => (precedent + 1) % VISUELS_HERO.length);
    }, 4500);

    return () => clearInterval(minuterie);
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

  useEffect(() => {
    function surDefilement() {
      setPageDefilee(window.scrollY > 400);
    }
    window.addEventListener('scroll', surDefilement, { passive: true });
    return () => window.removeEventListener('scroll', surDefilement);
  }, []);

  const ajouterPackAuPanier = async (pack) => {
    for (const id of pack.produitIds) {
      await ajouter(id, 1);
    }
  };

  return (
    <div>
      {/* ---------- HERO SECTION ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-container-low/40 to-background pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-12">
          {/* Hero text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3.5 py-1.5 text-xs font-bold text-on-primary-container shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span>COLLECTION 2026 — DAKAR SÉNÉGAL</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
              Sublimez votre style avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#15996a] to-secondary">3MT-Shopping</span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-on-surface-variant">
              Mode élégante, chaussures d'exception, parfums de luxe et high-tech. Commandez vos articles préférés en ligne et ne payez qu'à la livraison !
            </p>

            {/* Boutons d'action hero */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/produits">
                <Bouton taille="lg" iconeApres="arrow_forward" className="shadow-lg shadow-primary/20">
                  Découvrir le catalogue
                </Bouton>
              </Link>
              <Link to="/offres">
                <Bouton taille="lg" variante="secondaire" icone="bolt" className="border-primary/30 text-primary">
                  Ventes Flash (-50%)
                </Bouton>
              </Link>
            </div>

            {/* Chiffres cles stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-outline-variant/60 pt-6">
              {STATS.map((stat) => (
                <div key={stat.libelle} className="border-l-2 border-primary pl-3">
                  <span className="block text-xl font-extrabold text-on-surface">{stat.valeur}</span>
                  <span className="block text-[11px] text-outline">{stat.libelle}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Banner Carousel visual */}
          <div className="lg:col-span-5 relative">
            <div className="flottement rounded-3xl border border-outline-variant/80 bg-surface-container-lowest p-4 sm:p-5 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">auto_awesome</span>
                  Tendance de la Semaine
                </span>
                <span className="rounded-full bg-secondary-container px-2.5 py-0.5 text-[10px] font-extrabold text-on-secondary-container">
                  PROMO -20%
                </span>
              </div>

              <div className="relative h-72 sm:h-80 overflow-hidden rounded-2xl bg-surface-container">
                {VISUELS_HERO.map((source, index) => (
                  <img
                    key={source}
                    src={urlMedia(source)}
                    alt="Visuel mode 3MT-Shopping"
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                      visuel === index ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}

                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 pb-3">
                  {VISUELS_HERO.map((source, index) => (
                    <button
                      key={source}
                      type="button"
                      aria-label={`Visuel ${index + 1}`}
                      onClick={() => setVisuel(index)}
                      className={`h-2 rounded-full transition-all ${
                        visuel === index ? 'w-8 bg-on-primary' : 'w-2 bg-on-primary/60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                <div>
                  <p className="text-xs font-bold text-on-surface">Sélection Exclusive 3MT</p>
                  <p className="text-[11px] text-outline">Plus de 50 articles en stock à Dakar</p>
                </div>
                <Link to="/nouveautes" className="text-xs font-extrabold text-primary flex items-center gap-0.5 hover:underline">
                  Voir <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- VENTES FLASH & TIMING ---------- */}
      <section className="bg-gradient-to-r from-secondary-container/40 via-surface-container-high to-primary-container/30 py-12 border-y border-outline-variant/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-secondary">
                <span className="material-symbols-outlined text-[18px]">bolt</span> Offre à Durée Limitée
              </span>
              <h2 className="text-2xl font-extrabold text-on-surface sm:text-3xl">
                ⚡ Ventes Flash de la Semaine — Jusqu'à -50%
              </h2>
              <p className="text-xs text-on-surface-variant">
                Profitez de remises exceptionnelles sur une sélection d'articles incontournables.
              </p>
            </div>

            {/* Timer compte a rebours */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-container-lowest p-3 min-w-[64px] border border-outline-variant shadow-sm">
                <span className="text-xl font-extrabold text-primary">{String(tempsRestant.heures).padStart(2, '0')}</span>
                <span className="text-[10px] text-outline uppercase font-bold">Heures</span>
              </div>
              <span className="text-xl font-extrabold text-primary">:</span>
              <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-container-lowest p-3 min-w-[64px] border border-outline-variant shadow-sm">
                <span className="text-xl font-extrabold text-primary">{String(tempsRestant.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] text-outline uppercase font-bold">Minutes</span>
              </div>
              <span className="text-xl font-extrabold text-primary">:</span>
              <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-container-lowest p-3 min-w-[64px] border border-outline-variant shadow-sm">
                <span className="text-xl font-extrabold text-primary">{String(tempsRestant.secondes).padStart(2, '0')}</span>
                <span className="text-[10px] text-outline uppercase font-bold">Secondes</span>
              </div>

              <Link to="/offres" className="ml-4 hidden sm:inline-flex">
                <Bouton iconeApres="arrow_forward">Accéder aux ventes flash</Bouton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CATÉGORIES GRID ---------- */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Revelation className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Explorer le Rayon</span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
                Nos Catégories Principales
              </h2>
            </div>
            <Link to="/categories" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Voir toutes les catégories <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </Revelation>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES_ENRICHIES.map((cat, idx) => (
              <Revelation key={cat.id} delai={idx * 70}>
                <Link
                  to={`/produits?categorie=${cat.id}`}
                  className="group flex flex-col items-center rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 text-center transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container text-primary transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-on-primary">
                    <span className="material-symbols-outlined text-[28px]">{cat.icone}</span>
                  </div>
                  <h3 className="mt-3 text-xs font-bold text-on-surface group-hover:text-primary">{cat.nom}</h3>
                  <span className="mt-1 text-[10px] text-outline font-medium">{cat.nombreArticles} articles</span>
                </Link>
              </Revelation>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PRODUITS POPULAIRES ---------- */}
      <section className="bg-surface-container-low/50 py-16 md:py-24 border-y border-outline-variant/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Revelation className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Coups de Cœur</span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
                Les Articles Les Plus Vendus
              </h2>
            </div>
            <Link to="/produits">
              <Bouton variante="secondaire" iconeApres="arrow_forward">
                Tout le catalogue
              </Bouton>
            </Link>
          </Revelation>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {produits.slice(0, 8).map((produit, index) => (
              <Revelation key={produit.id} delai={(index % 4) * 80}>
                <CarteProduit produit={produit} />
              </Revelation>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PACKS & ENSEMBLES ---------- */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Revelation className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">Économisez en Lot</span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Packs & Combinés Spéciaux
            </h2>
            <p className="mt-2 text-xs text-on-surface-variant">
              Achetez une tenue complète ou un équipement assorti en 1 seul clic et profitez de réductions exclusives.
            </p>
          </Revelation>

          <div className="grid gap-6 md:grid-cols-3">
            {PACKS_ENRICHIS.map((pack, idx) => (
              <Revelation key={pack.id} delai={idx * 100}>
                <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-md transition-all hover:shadow-xl hover:border-primary/40">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-extrabold text-on-secondary-container">
                        {pack.reduction}
                      </span>
                      <span className="text-xs font-bold text-primary">{pack.badge}</span>
                    </div>

                    <h3 className="text-lg font-bold text-on-surface">{pack.nom}</h3>
                    <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">{pack.description}</p>

                    {/* Visuels des produits du pack */}
                    <div className="mt-5 flex items-center justify-center gap-2 py-4 bg-surface-container-low rounded-2xl">
                      {pack.produitIds.map((pId) => {
                        const p = PRODUITS_ENRICHIS.find((item) => item.id === pId);
                        return (
                          p && (
                            <img
                              key={pId}
                              src={p.image}
                              alt={p.nom}
                              title={p.nom}
                              className="h-16 w-16 rounded-xl object-cover border border-outline-variant bg-surface"
                            />
                          )
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-outline-variant/60 pt-4">
                    <div>
                      <span className="text-xs text-outline line-through block">
                        {pack.prixOriginal.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className="text-xl font-extrabold text-primary">
                        {pack.prixPack.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => ajouterPackAuPanier(pack)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-on-primary transition-transform active:scale-95 shadow-md shadow-primary/20"
                    >
                      <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                      Ajouter le pack
                    </button>
                  </div>
                </div>
              </Revelation>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- AVIS CLIENTS ---------- */}
      <section className="bg-surface-container-low/60 py-16 md:py-24 border-y border-outline-variant/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Revelation className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Témoignages</span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Ce que disent nos clients
            </h2>
          </Revelation>

          <div className="grid gap-6 md:grid-cols-3">
            {AVIS_CLIENTS.map((avis, idx) => (
              <Revelation key={avis.id} delai={idx * 100}>
                <div className="flex flex-col justify-between rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-3">
                      {'★'.repeat(avis.note)}
                    </div>
                    <p className="text-xs leading-relaxed text-on-surface italic">"{avis.commentaire}"</p>
                  </div>

                  <div className="mt-6 flex items-center gap-3 border-t border-outline-variant/40 pt-4">
                    <img src={avis.avatar} alt={avis.nom} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-bold text-on-surface">{avis.nom}</p>
                      <p className="text-[10px] text-outline">{avis.role} • {avis.date}</p>
                    </div>
                  </div>
                </div>
              </Revelation>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- NOS ENGAGEMENTS ---------- */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Revelation className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Pourquoi Nous Choisir</span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Les Avantages 3MT-Shopping
            </h2>
          </Revelation>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ENGAGEMENTS.map((eng, idx) => (
              <Revelation key={eng.titre} delai={idx * 70}>
                <div className="flex gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 transition-transform hover:-translate-y-1">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-primary">
                    <span className="material-symbols-outlined text-[24px]">{eng.icone}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">{eng.titre}</h3>
                    <p className="mt-1 text-xs text-on-surface-variant leading-relaxed">{eng.texte}</p>
                  </div>
                </div>
              </Revelation>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA BANNER ---------- */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-[#15996a] to-secondary px-8 py-16 text-center text-on-primary shadow-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Rejoignez plus de 15 000 clients satisfaits !
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-on-primary/90">
              Profitez d'un catalogue riche, d'une livraison express et du paiement sécurisé à la réception.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/produits">
                <Bouton taille="lg" className="bg-on-primary text-primary hover:bg-on-primary/90 shadow-lg">
                  Voir tout le catalogue
                </Bouton>
              </Link>
              {!estConnecte && (
                <Link to="/inscription">
                  <Bouton taille="lg" variante="secondaire" className="border-on-primary/40 text-on-primary hover:bg-on-primary/10">
                    Créer mon compte
                  </Bouton>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bouton retour en haut */}
      {pageDefilee && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Revenir en haut de la page"
          className="fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg transition-transform hover:-translate-y-1"
        >
          <span className="material-symbols-outlined">arrow_upward</span>
        </button>
      )}
    </div>
  );
}
