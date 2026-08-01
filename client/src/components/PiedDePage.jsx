import { useState } from 'react';
import { Link } from 'react-router-dom';
import LogoPaiement from './LogosPaiement';

export const EMAIL_CONTACT = 'contact@3mt-shopping.sn';
export const TELEPHONE_CONTACT = '+221 77 000 00 00';

export default function PiedDePage() {
  const [emailNewsletter, setEmailNewsletter] = useState('');
  const [inscrit, setInscrit] = useState(false);

  const gererNewsletter = (e) => {
    e.preventDefault();
    if (emailNewsletter) {
      setInscrit(true);
      setEmailNewsletter('');
    }
  };

  return (
    <footer className="mt-20 border-t border-outline-variant/60 bg-surface-container-lowest text-on-surface">
      {/* Section Newsletter Top */}
      <div className="border-b border-outline-variant/40 bg-gradient-to-r from-primary-container/40 via-surface-container-low to-secondary-container/30 px-4 py-12 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
              <span className="material-symbols-outlined text-[16px]">mail</span> Newsletter 3MT-Shopping
            </span>
            <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Restez informé de nos ventes flash & nouveautés
            </h3>
            <p className="mt-1 text-xs text-on-surface-variant max-w-xl">
              Inscrivez-vous pour recevoir nos offres exclusives, codes promos réservés aux abonnés et alertes sur les nouveaux produits.
            </p>
          </div>

          <form onSubmit={gererNewsletter} className="flex w-full max-w-md gap-2">
            {inscrit ? (
              <div className="w-full rounded-2xl bg-succes-container p-3 text-center text-xs font-bold text-succes">
                ✓ Merci ! Vous êtes désormais inscrit à notre newsletter.
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  placeholder="Entrez votre adresse email..."
                  value={emailNewsletter}
                  onChange={(e) => setEmailNewsletter(e.target.value)}
                  className="flex-1 rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-xs text-on-surface focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 shrink-0 rounded-2xl bg-primary px-5 py-3 text-xs font-extrabold text-on-primary transition-all hover:bg-primary/90 shadow-md shadow-primary/20"
                >
                  S'inscrire
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Grille principale Footer */}
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Col 1: Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-accent shadow-md">
                <span className="material-symbols-outlined text-[22px] text-on-primary">shopping_bag</span>
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-primary">3MT-</span>Shopping
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-on-surface-variant max-w-sm">
              Votre destination shopping de référence au Sénégal. Découvrez des vêtements de qualité, des chaussures tendance, des parfums rares et des accessoires exclusifs avec livraison rapide.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant text-on-surface transition-colors hover:bg-primary hover:text-on-primary hover:border-primary"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant text-on-surface transition-colors hover:bg-primary hover:text-on-primary hover:border-primary"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant text-on-surface transition-colors hover:bg-primary hover:text-on-primary hover:border-primary"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-on-surface mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-xs text-on-surface-variant">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/produits" className="hover:text-primary transition-colors">
                  Tous les Produits
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-primary transition-colors">
                  Hub des Catégories
                </Link>
              </li>
              <li>
                <Link to="/offres" className="hover:text-primary transition-colors flex items-center gap-1">
                  Ventes Flash <span className="rounded bg-secondary-container px-1 py-0.2 text-[9px] font-bold text-on-secondary-container">-50%</span>
                </Link>
              </li>
              <li>
                <Link to="/nouveautes" className="hover:text-primary transition-colors">
                  Nouveautés 2026
                </Link>
              </li>
              <li>
                <Link to="/packs" className="hover:text-primary transition-colors">
                  Packs & Ensembles
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Aide & Service Clients */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-on-surface mb-4">Service Client</h4>
            <ul className="space-y-2.5 text-xs text-on-surface-variant">
              <li>
                <Link to="/panier" className="hover:text-primary transition-colors">
                  Mon Panier
                </Link>
              </li>
              <li>
                <Link to="/favoris" className="hover:text-primary transition-colors">
                  Mes Favoris
                </Link>
              </li>
              <li>
                <Link to="/commandes" className="hover:text-primary transition-colors">
                  Suivi de Commandes
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">
                  Faq & Foire Aux Questions
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="hover:text-primary transition-colors">
                  À Propos de Nous
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Nous Contacter
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Moyens de paiement */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-on-surface mb-4">Contact Direct</h4>
            <ul className="space-y-2.5 text-xs text-on-surface-variant">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                <span>Dakar, Sénégal</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">call</span>
                <span>+221 77 000 00 00</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                <span>Lun - Sam: 8h30 - 20h00</span>
              </li>
            </ul>

            <div className="mt-5 pt-4 border-t border-outline-variant/40">
              <p className="text-[11px] font-bold text-on-surface mb-2">Paiements Sécurisés :</p>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-on-surface-variant">
                {[
                  { cle: 'wave', libelle: 'Wave' },
                  { cle: 'orange-money', libelle: 'Orange Money' },
                  { cle: 'carte', libelle: 'Carte Bancaire' },
                  { cle: 'especes', libelle: 'À la livraison' },
                ].map((moyen) => (
                  <span
                    key={moyen.cle}
                    className="inline-flex items-center gap-1.5 rounded bg-surface-container-high py-1 pl-1 pr-2"
                  >
                    <LogoPaiement cle={moyen.cle} className="h-5 w-5" />
                    {moyen.libelle}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-outline-variant/60 pt-6 text-xs text-outline sm:flex-row">
          <p>© 2026 3MT-Shopping. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <Link to="/faq" className="hover:underline">Mentions Légales</Link>
            <Link to="/faq" className="hover:underline">CGV</Link>
            <Link to="/faq" className="hover:underline">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
