import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePanier } from '../contexts/PanierContext';

// En-tete commun a toutes les pages publiques : navigation, panier et compte.
// Reprend le comportement de la vitrine SenBus (fond translucide qui gagne une
// ombre au defilement) avec l'identite de la boutique.

const LIENS = [
  { to: '/', libelle: 'Accueil', icone: 'home', exact: true },
  { to: '/produits', libelle: 'Produits', icone: 'storefront' },
  { to: '/contact', libelle: 'Contact', icone: 'mail' },
];

export default function EnTete() {
  const { utilisateur, estConnecte, estAdmin, deconnexion } = useAuth();
  const { nombreArticles } = usePanier();
  const navigate = useNavigate();
  const emplacement = useLocation();

  const [menuOuvert, setMenuOuvert] = useState(false);
  const [compteOuvert, setCompteOuvert] = useState(false);
  const [pageDefilee, setPageDefilee] = useState(false);
  const [pulsation, setPulsation] = useState(false);

  useEffect(() => {
    function surDefilement() {
      setPageDefilee(window.scrollY > 8);
    }

    surDefilement();
    window.addEventListener('scroll', surDefilement, { passive: true });
    return () => window.removeEventListener('scroll', surDefilement);
  }, []);

  // Les menus se referment a chaque changement de page.
  useEffect(() => {
    setMenuOuvert(false);
    setCompteOuvert(false);
  }, [emplacement.pathname]);

  // La pastille tressaute quand le nombre d'articles change : le retour visuel
  // remplace le rechargement de page du site PHP.
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

  const classeLien = ({ isActive }) =>
    `group relative text-sm font-medium transition-colors ${
      isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur transition-[background-color,box-shadow,border-color] duration-300 ${
        pageDefilee
          ? 'border-outline-variant/60 bg-surface/95 shadow-md shadow-on-surface/5'
          : 'border-transparent bg-surface/85'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <span className="material-symbols-outlined text-[20px] text-on-primary">shopping_bag</span>
          </span>
          <span className="text-lg font-extrabold tracking-tight text-on-surface">
            <span className="text-primary">3MT-</span>Shopping
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LIENS.map((lien) => (
            <NavLink key={lien.to} to={lien.to} end={lien.exact} className={classeLien}>
              {({ isActive }) => (
                <>
                  {lien.libelle}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 w-full origin-center rounded-full bg-primary transition-transform duration-300 motion-reduce:transition-none ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}

          {estConnecte && (
            <NavLink to="/commandes" className={classeLien}>
              {({ isActive }) => (
                <>
                  Mes commandes
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 w-full origin-center rounded-full bg-primary transition-transform duration-300 motion-reduce:transition-none ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </>
              )}
            </NavLink>
          )}

          {estAdmin && (
            <NavLink to="/admin" className={classeLien}>
              Administration
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/panier"
            aria-label={`Panier, ${nombreArticles} article(s)`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant text-on-surface transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-surface-container-low"
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

          {estConnecte ? (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setCompteOuvert((ouvert) => !ouvert)}
                aria-expanded={compteOuvert}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-outline-variant px-3 text-sm font-semibold text-on-surface transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-surface-container-low"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary-container text-[11px] font-bold text-on-primary-container">
                  {utilisateur.prenom.charAt(0).toUpperCase()}
                </span>
                {utilisateur.prenom}
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>

              {compteOuvert && (
                <>
                  {/* Voile transparent : un clic n'importe ou referme le menu. */}
                  <button
                    type="button"
                    aria-hidden
                    tabIndex={-1}
                    onClick={() => setCompteOuvert(false)}
                    className="fixed inset-0 z-10 cursor-default"
                  />
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xl">
                    <div className="border-b border-outline-variant/60 px-4 py-3">
                      <p className="text-sm font-bold text-on-surface">
                        {utilisateur.prenom} {utilisateur.nom}
                      </p>
                      <p className="truncate text-xs text-on-surface-variant">{utilisateur.email}</p>
                    </div>
                    <Link
                      to="/profil"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low"
                    >
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                        person
                      </span>
                      Mon profil
                    </Link>
                    <Link
                      to="/commandes"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low"
                    >
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                        receipt_long
                      </span>
                      Mes commandes
                    </Link>
                    {estAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low"
                      >
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                          dashboard
                        </span>
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
              className="hidden h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary shadow-sm shadow-primary/25 transition-[transform,opacity,box-shadow] hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md hover:shadow-primary/30 md:inline-flex"
            >
              Connexion
              <span className="material-symbols-outlined text-[18px]">login</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOuvert}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant text-on-surface md:hidden"
          >
            <span className="material-symbols-outlined">{menuOuvert ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {menuOuvert && (
        <div className="space-y-1 border-t border-outline-variant/60 bg-surface px-4 py-4 md:hidden">
          {LIENS.map((lien) => (
            <NavLink
              key={lien.to}
              to={lien.to}
              end={lien.exact}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[20px]">{lien.icone}</span>
              {lien.libelle}
            </NavLink>
          ))}

          {estConnecte ? (
            <>
              <NavLink
                to="/commandes"
                className="flex items-center gap-2.5 rounded-lg px-2 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                Mes commandes
              </NavLink>
              <NavLink
                to="/profil"
                className="flex items-center gap-2.5 rounded-lg px-2 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                Mon profil
              </NavLink>
              {estAdmin && (
                <NavLink
                  to="/admin"
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
                >
                  <span className="material-symbols-outlined text-[20px]">dashboard</span>
                  Administration
                </NavLink>
              )}
              <button
                type="button"
                onClick={seDeconnecter}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-error hover:bg-error-container/40"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Déconnexion
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
  );
}
