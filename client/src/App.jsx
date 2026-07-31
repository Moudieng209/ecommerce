import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import RouteProtegee from './components/RouteProtegee';
import DispositionAdmin from './layouts/DispositionAdmin';
import DispositionBoutique from './layouts/DispositionBoutique';
import APropos from './pages/APropos';
import Accueil from './pages/Accueil';
import CategoriesHub from './pages/CategoriesHub';
import Commandes from './pages/Commandes';
import Connexion from './pages/Connexion';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import Favoris from './pages/Favoris';
import Inscription from './pages/Inscription';
import NonTrouvee from './pages/NonTrouvee';
import Nouveautes from './pages/Nouveautes';
import Offres from './pages/Offres';
import Packs from './pages/Packs';
import Panier from './pages/Panier';
import ProduitDetail from './pages/ProduitDetail';
import Produits from './pages/Produits';
import Profil from './pages/Profil';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCommandes from './pages/admin/AdminCommandes';
import AdminMessages from './pages/admin/AdminMessages';
import AdminProduits from './pages/admin/AdminProduits';
import AdminUtilisateurs from './pages/admin/AdminUtilisateurs';
import TableauDeBord from './pages/admin/TableauDeBord';

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
          <Route path="categories" element={<CategoriesHub />} />
          <Route path="offres" element={<Offres />} />
          <Route path="nouveautes" element={<Nouveautes />} />
          <Route path="packs" element={<Packs />} />
          <Route path="favoris" element={<Favoris />} />
          <Route path="faq" element={<Faq />} />
          <Route path="a-propos" element={<APropos />} />
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

        {/* Ancienne adresse du site PHP */}
        <Route path="/index.php" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NonTrouvee />} />
      </Routes>
    </>
  );
}
