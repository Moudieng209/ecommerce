import { Link } from 'react-router-dom';
import Revelation from '../components/Revelation';
import { Bouton } from '../components/ui';

export default function APropos() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      {/* Hero Section */}
      <Revelation className="max-w-3xl mx-auto text-center mb-16">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3.5 py-1 text-xs font-bold text-on-primary-container mb-3">
          <span className="material-symbols-outlined text-[16px]">info</span> NOTRE HISTOIRE
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface sm:text-5xl">
          À Propos de <span className="text-primary">3MT-Shopping</span>
        </h1>
        <p className="mt-4 text-xs sm:text-base text-on-surface-variant leading-relaxed">
          Fondée en 2024 à Dakar, 3MT-Shopping est une boutique e-commerce sénégalaise engagée à offrir des vêtements, chaussures et accessoires de haute qualité avec un service irréprochable.
        </p>
      </Revelation>

      {/* Grid Chiffres Clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 text-center shadow-sm">
          <span className="text-3xl font-extrabold text-primary">15 000+</span>
          <span className="block text-xs font-bold text-on-surface mt-1">Clients Satisfaits</span>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 text-center shadow-sm">
          <span className="text-3xl font-extrabold text-primary">100%</span>
          <span className="block text-xs font-bold text-on-surface mt-1">Paiement Réception</span>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 text-center shadow-sm">
          <span className="text-3xl font-extrabold text-primary">48h</span>
          <span className="block text-xs font-bold text-on-surface mt-1">Livraison Dakar</span>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 text-center shadow-sm">
          <span className="text-3xl font-extrabold text-primary">4.9 ★</span>
          <span className="block text-xs font-bold text-on-surface mt-1">Note Moyenne</span>
        </div>
      </div>

      {/* Story & Mission */}
      <div className="grid gap-12 lg:grid-cols-2 items-center mb-16">
        <Revelation variante="gauche">
          <div className="relative overflow-hidden rounded-3xl border border-outline-variant bg-surface-container shadow-xl">
            <img src="/images/home17.jpg" alt="Notre équipe 3MT" className="w-full h-80 object-cover" />
          </div>
        </Revelation>

        <Revelation variante="droite" className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Notre Mission</span>
          <h2 className="text-2xl font-extrabold text-on-surface sm:text-3xl">
            Rendre le shopping en ligne simple, rapide et sans risque
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Nous avons créé 3MT-Shopping pour répondre à une attente forte : pouvoir commander les meilleures tendances mode depuis son téléphone ou son ordinateur, tout en bénéficiant de la garantie du paiement à la livraison.
          </p>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Chaque article présent sur notre site est rigoureusement contrôlé par notre équipe à Dakar avant d'être expédié. Nous croyons en un commerce de proximité digitalisé, axé sur la confiance et l'excellence du service client.
          </p>

          <div className="pt-4">
            <Link to="/produits">
              <Bouton iconeApres="arrow_forward">Découvrir le catalogue</Bouton>
            </Link>
          </div>
        </Revelation>
      </div>

      {/* Nos Valeurs */}
      <section className="rounded-3xl border border-outline-variant bg-surface-container-low/60 p-8 sm:p-12 mb-16">
        <h2 className="text-center text-2xl font-extrabold text-on-surface mb-8">Nos Engagements Au Quotidien</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <span className="material-symbols-outlined text-[32px] text-primary mb-3">verified</span>
            <h3 className="text-sm font-bold text-on-surface">Qualité Garantie</h3>
            <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
              Sélection stricte des tissus, finitions et matières pour vous garantir des produits esthétiques et durables.
            </p>
          </div>
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <span className="material-symbols-outlined text-[32px] text-primary mb-3">speed</span>
            <h3 className="text-sm font-bold text-on-surface">Rapidité de Service</h3>
            <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
              Traitement des commandes en moins de 24h et livraison directe à votre domicile ou lieu de travail.
            </p>
          </div>
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <span className="material-symbols-outlined text-[32px] text-primary mb-3">handshake</span>
            <h3 className="text-sm font-bold text-on-surface">Transparence Totale</h3>
            <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
              Aucun frais caché, tarifs affichés en FCFA clairs et paiement direct lors de la remise en main propre.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
