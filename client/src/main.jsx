import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { FournisseurAuth } from './contexts/AuthContext';
import { FournisseurNotifications } from './contexts/NotificationContext';
import { FournisseurPanier } from './contexts/PanierContext';
import './index.css';

// Ordre des fournisseurs : le panier depend de la session et des notifications.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FournisseurNotifications>
        <FournisseurAuth>
          <FournisseurPanier>
            <App />
          </FournisseurPanier>
        </FournisseurAuth>
      </FournisseurNotifications>
    </BrowserRouter>
  </StrictMode>,
);
