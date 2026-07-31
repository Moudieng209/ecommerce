import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Cadre du back-office : barre laterale fixe sur grand ecran, tiroir sur mobile.
// Remplace le tableau de bord Bootstrap de la version PHP.

const LIENS = [
  { to: '/admin', libelle: 'Tableau de bord', icone: 'dashboard', exact: true },
  { to: '/admin/produits', libelle: 'Produits', icone: 'inventory_2' },
  { to: '/admin/categories', libelle: 'Catégories', icone: 'category' },
  { to: '/admin/commandes', libelle: 'Commandes', icone: 'receipt_long' },
  { to: '/admin/utilisateurs', libelle: 'Utilisateurs', icone: 'group' },
  { to: '/admin/messages', libelle: 'Messages', icone: 'mail' },
];

export default function DispositionAdmin() {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();
  const emplacement = useLocation();

  const [tiroirOuvert, setTiroirOuvert] = useState(false);

  useEffect(() => setTiroirOuvert(false), [emplacement.pathname]);

  async function seDeconnecter() {
    await deconnexion();
    navigate('/');
  }

  const classeLien = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-primary text-on-primary shadow-sm shadow-primary/25'
        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
    }`;

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Voile du tiroir mobile */}
      {tiroirOuvert && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setTiroirOuvert(false)}
          className="fixed inset-0 z-40 bg-on-surface/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-outline-variant bg-surface-container-lowest transition-transform duration-300 lg:translate-x-0 ${
          tiroirOuvert ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-outline-variant px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <span className="material-symbols-outlined text-[20px] text-on-primary">shopping_bag</span>
          </span>
          <span className="text-base font-extrabold tracking-tight">
            <span className="text-primary">3MT-</span>Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {LIENS.map((lien) => (
            <NavLink key={lien.to} to={lien.to} end={lien.exact} className={classeLien}>
              <span className="material-symbols-outlined text-[20px]">{lien.icone}</span>
              {lien.libelle}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-outline-variant p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            Voir la boutique
          </Link>

          <button
            type="button"
            onClick={seDeconnecter}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-error transition-colors hover:bg-error-container/40"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-outline-variant bg-surface/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setTiroirOuvert(true)}
            aria-label="Ouvrir le menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant lg:hidden"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <p className="hidden text-sm text-on-surface-variant sm:block">
            Espace d’administration de la boutique
          </p>

          <div className="flex items-center gap-2.5">
            <span className="text-right leading-tight">
              <span className="block text-xs font-bold text-on-surface">
                {utilisateur.prenom} {utilisateur.nom}
              </span>
              <span className="block text-[11px] text-on-surface-variant">Administrateur</span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container text-sm font-bold text-on-primary-container">
              {utilisateur.prenom.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
