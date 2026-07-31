import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import DispositionBoutique from './layouts/DispositionBoutique';
import DispositionAdmin from './layouts/DispositionAdmin';
import RouteProtegee from './components/RouteProtegee';
import Accueil from './pages/Accueil';
import Produits from './pages/Produits';
import ProduitDetail from './pages/ProduitDetail';
import Panier from './pages/Panier';
import Commandes from './pages/Commandes';
import Contact from './pages/Contact';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import Profil from './pages/Profil';
import NonTrouvee from './pages/NonTrouvee';
import TableauDeBord from './pages/admin/TableauDeBord';
import AdminProduits from './pages/admin/AdminProduits';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCommandes from './pages/admin/AdminCommandes';
import AdminUtilisateurs from './pages/admin/AdminUtilisateurs';
import AdminMessages from './pages/admin/AdminMessages';

// Chaque navigation replace la vue en haut : sans cela, arriver sur une fiche
// produit depuis le bas d'une liste conserve la position de defilement.
function RetourEnHaut() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <RetourEnHaut />

      <Routes>
        {/* --- Boutique --- */}
        <Route element={<DispositionBoutique />}>
          <Route index element={<Accueil />} />
          <Route path="produits" element={<Produits />} />
          <Route path="produits/:id" element={<ProduitDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="connexion" element={<Connexion />} />
          <Route path="inscription" element={<Inscription />} />

          <Route
            path="panier"
            element={
              <RouteProtegee>
                <Panier />
              </RouteProtegee>
            }
          />
          <Route
            path="commandes"
            element={
              <RouteProtegee>
                <Commandes />
              </RouteProtegee>
            }
          />
          <Route
            path="profil"
            element={
              <RouteProtegee>
                <Profil />
              </RouteProtegee>
            }
          />
        </Route>

        {/* --- Administration --- */}
        <Route
          path="/admin"
          element={
            <RouteProtegee admin>
              <DispositionAdmin />
            </RouteProtegee>
          }
        >
          <Route index element={<TableauDeBord />} />
          <Route path="produits" element={<AdminProduits />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="commandes" element={<AdminCommandes />} />
          <Route path="utilisateurs" element={<AdminUtilisateurs />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>

        {/* Ancienne adresse du site PHP, conservee pour ne pas casser les liens. */}
        <Route path="/index.php" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NonTrouvee />} />
      </Routes>
    </>
  );
}
