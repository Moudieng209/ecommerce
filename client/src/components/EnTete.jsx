import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePanier } from '../contexts/PanierContext';
import { useWishlist } from '../contexts/WishlistContext';
import { PRODUITS_ENRICHIS } from '../data/produitsData';

const LIENS = [
  { to: '/', libelle: 'Accueil', icone: 'home', exact: true },
  { to: '/produits', libelle: 'Produits', icone: 'storefront' },
  { to: '/categories', libelle: 'Catégories', icone: 'category' },
  { to: '/offres', libelle: 'Offres Flash', icone: 'bolt', badge: '-50%' },
  { to: '/nouveautes', libelle: 'Nouveautés', icone: 'auto_awesome' },
  { to: '/packs', libelle: 'Packs & Combinés', icone: 'inventory_2', badge: 'Éco' },
  { to: '/contact', libelle: 'Contact', icone: 'mail' },
];

export default function EnTete() {
  const { utilisateur, estConnecte, estAdmin, deconnexion } = useAuth();
  const { nombreArticles } = usePanier();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const emplacement = useLocation();

  const [menuOuvert, setMenuOuvert] = useState(false);
  const [compteOuvert, setCompteOuvert] = useState(false);
  const [pageDefilee, setPageDefilee] = useState(false);
  const [pulsation, setPulsation] = useState(false);

  // Recherche rapide
  const [rechercheTerme, setRechercheTerme] = useState('');
  const [rechercheOuverte, setRechercheOuverte] = useState(false);

  const resultatsRecherche = rechercheTerme.trim()
    ? PRODUITS_ENRICHIS.filter(
        (p) =>
          p.nom.toLowerCase().includes(rechercheTerme.toLowerCase()) ||
          p.categorie.toLowerCase().includes(rechercheTerme.toLowerCase()),
      ).slice(0, 5)
    : [];

  useEffect(() => {
    function surDefilement() {
      setPageDefilee(window.scrollY > 8);
    }
    surDefilement();
    window.addEventListener('scroll', surDefilement, { passive: true });
    return () => window.removeEventListener('scroll', surDefilement);
  }, []);

  useEffect(() => {
    setMenuOuvert(false);
    setCompteOuvert(false);
    setRechercheOuverte(false);
    setRechercheTerme('');
  }, [emplacement.pathname]);

  useEffect(() => {
    if (nombreArticles === 0) return undefined;
    setPulsation(true);
    const minuterie = setTimeout(() => setPulsation(false), 450);
    return () => clearTimeout(minuterie);
  }, [nombreArticles]);

  async function seDeconnecter() {
    await deconnexion();
    navigate('/');
  }

  const soumettreRecherche = (e) => {
    e.preventDefault();
    if (rechercheTerme.trim()) {
      navigate(`/produits?q=${encodeURIComponent(rechercheTerme.trim())}`);
      setRechercheOuverte(false);
    }
  };

  const classeLien = ({ isActive }) =>
    `group relative inline-flex items-center gap-1 text-sm font-medium transition-colors ${
      isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
    }`;

  return (
    <>
      {/* Bandeau supérieur d'annonces */}
      <div className="bg-primary px-4 py-1.5 text-center text-xs font-semibold text-on-primary">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="hidden sm:inline">✨ BIENVENUE SUR 3MT-SHOPPING — L'ÉLÉGANCE AU MEILLEUR PRIX</span>
          <span className="mx-auto sm:mx-0">🚚 Livraison rapide & offerte dès 50 000 FCFA d'achats</span>
          <div className="hidden items-center gap-4 md:flex">
            <Link to="/faq" className="hover:underline">
              Besoin d'aide ?
            </Link>
            <Link to="/a-propos" className="hover:underline">
              Notre Histoire
            </Link>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b backdrop-blur transition-[background-color,box-shadow,border-color] duration-300 ${
          pageDefilee
            ? 'border-outline-variant/60 bg-surface/95 shadow-md shadow-on-surface/5'
            : 'border-transparent bg-surface/90'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo Brand */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-accent shadow-md shadow-primary/20">
              <span className="material-symbols-outlined text-[22px] text-on-primary">shopping_bag</span>
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-on-surface leading-none">
                <span className="text-primary">3MT-</span>Shopping
              </span>
              <span className="text-[10px] font-semibold text-outline tracking-wider uppercase">Boutique Officielle</span>
            </div>
          </Link>

          {/* Nav Links Desktop */}
          <nav className="hidden items-center gap-6 lg:flex">
            {LIENS.map((lien) => (
              <NavLink key={lien.to} to={lien.to} end={lien.exact} className={classeLien}>
                {({ isActive }) => (
                  <>
                    <span>{lien.libelle}</span>
                    {lien.badge && (
                      <span className="rounded-full bg-secondary-container px-1.5 py-0.2 text-[10px] font-bold text-on-secondary-container">
                        {lien.badge}
                      </span>
                    )}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 w-full origin-center rounded-full bg-primary transition-transform duration-300 ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Actions Droite (Recherche, Wishlist, Panier, User) */}
          <div className="flex items-center gap-2">
            {/* Bouton Recherche Quick */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRechercheOuverte(!rechercheOuverte)}
                aria-label="Recherche"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>

              {/* Modal / Dropdown recherche live */}
              {rechercheOuverte && (
                <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-outline-variant bg-surface-container-lowest p-3 shadow-2xl">
                  <form onSubmit={soumettreRecherche} className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Chercher une chemise, des sneakers, un parfum..."
                      value={rechercheTerme}
                      onChange={(e) => setRechercheTerme(e.target.value)}
                      autoFocus
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-sm pr-9 text-on-surface focus:border-primary focus:outline-none"
                    />
                    <button type="submit" className="absolute right-2 text-primary">
                      <span className="material-symbols-outlined text-[20px]">search</span>
                    </button>
                  </form>

                  {resultatsRecherche.length > 0 && (
                    <div className="mt-3 space-y-1.5 border-t border-outline-variant/60 pt-2">
                      <p className="px-2 text-[11px] font-bold text-outline uppercase tracking-wider">Résultats suggérés</p>
                      {resultatsRecherche.map((p) => (
                        <Link
                          key={p.id}
                          to={`/produits/${p.id}`}
                          onClick={() => setRechercheOuverte(false)}
                          className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-container-low transition-colors"
                        >
                          <img src={p.image} alt={p.nom} className="h-10 w-10 rounded-lg object-cover bg-surface-container" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-bold text-on-surface">{p.nom}</p>
                            <p className="text-[11px] text-outline">{p.categorie}</p>
                          </div>
                          <span className="text-xs font-extrabold text-primary">{p.prix.toLocaleString('fr-FR')} FCFA</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Favoris Wishlist */}
            <Link
              to="/favoris"
              aria-label={`Favoris, ${wishlistCount} article(s)`}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              {wishlistCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-on-secondary">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Panier */}
            <Link
              to="/panier"
              aria-label={`Panier, ${nombreArticles} article(s)`}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              {nombreArticles > 0 && (
                <span
                  className={`absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary ${
                    pulsation ? 'pulsation-panier' : ''
                  }`}
                >
                  {nombreArticles > 99 ? '99+' : nombreArticles}
                </span>
              )}
            </Link>

            {/* Compte / Auth */}
            {estConnecte ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setCompteOuvert((ouvert) => !ouvert)}
                  aria-expanded={compteOuvert}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-outline-variant px-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary-container text-[11px] font-bold text-on-primary-container">
                    {utilisateur.prenom.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[80px] truncate">{utilisateur.prenom}</span>
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </button>

                {compteOuvert && (
                  <>
                    <button
                      type="button"
                      aria-hidden
                      tabIndex={-1}
                      onClick={() => setCompteOuvert(false)}
                      className="fixed inset-0 z-10 cursor-default"
                    />
                    <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xl">
                      <div className="border-b border-outline-variant/60 px-4 py-3 bg-surface-container-low/50">
                        <p className="text-sm font-bold text-on-surface">
                          {utilisateur.prenom} {utilisateur.nom}
                        </p>
                        <p className="truncate text-xs text-on-surface-variant">{utilisateur.email}</p>
                      </div>
                      <Link
                        to="/profil"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low"
                      >
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                        Mon profil
                      </Link>
                      <Link
                        to="/commandes"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low"
                      >
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">receipt_long</span>
                        Mes commandes
                      </Link>
                      <Link
                        to="/favoris"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low"
                      >
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">favorite</span>
                        Mes favoris ({wishlistCount})
                      </Link>
                      {estAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low"
                        >
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">dashboard</span>
                          Administration
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={seDeconnecter}
                        className="flex w-full items-center gap-2.5 border-t border-outline-variant/60 px-4 py-2.5 text-left text-sm text-error hover:bg-error-container/40"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/connexion"
                className="hidden h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary shadow-sm shadow-primary/25 transition-transform hover:-translate-y-0.5 hover:opacity-90 md:inline-flex"
              >
                Connexion
                <span className="material-symbols-outlined text-[18px]">login</span>
              </Link>
            )}

            {/* Menu Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMenuOuvert((ouvert) => !ouvert)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOuvert}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant text-on-surface lg:hidden"
            >
              <span className="material-symbols-outlined">{menuOuvert ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {menuOuvert && (
          <div className="space-y-1.5 border-t border-outline-variant/60 bg-surface px-4 py-4 lg:hidden">
            {LIENS.map((lien) => (
              <NavLink
                key={lien.to}
                to={lien.to}
                end={lien.exact}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">{lien.icone}</span>
                  <span>{lien.libelle}</span>
                </div>
                {lien.badge && (
                  <span className="rounded-full bg-secondary-container px-2 py-0.5 text-xs font-bold text-on-secondary-container">
                    {lien.badge}
                  </span>
                )}
              </NavLink>
            ))}

            <NavLink
              to="/favoris"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              <span>Mes favoris ({wishlistCount})</span>
            </NavLink>

            {estConnecte ? (
              <>
                <NavLink
                  to="/commandes"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
                >
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  <span>Mes commandes</span>
                </NavLink>
                <NavLink
                  to="/profil"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
                >
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  <span>Mon profil</span>
                </NavLink>
                {estAdmin && (
                  <NavLink
                    to="/admin"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
                  >
                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    <span>Administration</span>
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={seDeconnecter}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-error hover:bg-error-container/40"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/connexion"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-on-primary"
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-outline-variant text-sm font-semibold text-on-surface"
                >
                  Créer un compte
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
