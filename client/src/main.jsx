import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { FournisseurAuth } from './contexts/AuthContext';
import { FournisseurConfirmation } from './contexts/ConfirmationContext';
import { FournisseurNotifications } from './contexts/NotificationContext';
import { FournisseurPanier } from './contexts/PanierContext';
import { FournisseurWishlist } from './contexts/WishlistContext';
import './index.css';

// Ordre des fournisseurs : le panier et favoris dépendent de la session et des notifications.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FournisseurNotifications>
        <FournisseurConfirmation>
          <FournisseurAuth>
            <FournisseurPanier>
              <FournisseurWishlist>
                <App />
              </FournisseurWishlist>
            </FournisseurPanier>
          </FournisseurAuth>
        </FournisseurConfirmation>
      </FournisseurNotifications>
    </BrowserRouter>
  </StrictMode>,
);
