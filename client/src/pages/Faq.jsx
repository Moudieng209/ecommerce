import { useState } from 'react';
import { Link } from 'react-router-dom';
import Revelation from '../components/Revelation';
import { Bouton } from '../components/ui';

const QUESTIONS_CATEGORIE = [
  {
    categorie: 'Livraison & Expédition',
    icone: 'local_shipping',
    items: [
      {
        q: 'Quels sont les délais de livraison à Dakar et dans les régions ?',
        r: 'Les commandes sont expédiées sous 24h. La livraison s’effectue sous 48h maximum à Dakar, et entre 48h et 72h pour les régions du Sénégal.',
      },
      {
        q: 'Combien coûte la livraison ?',
        r: 'La livraison est proposée au tarif unique de 500 FCFA à Dakar. Elle est offerte pour toute commande à partir de 50 000 FCFA.',
      },
      {
        q: 'Puis-je suivre l’acheminement de mon colis ?',
        r: 'Oui, dès la validation de votre commande, un numéro de suivi vous est attribué dans votre espace client sur la page "Mes commandes".',
      },
    ],
  },
  {
    categorie: 'Paiement & Sécurité',
    icone: 'payments',
    items: [
      {
        q: 'Comment s’effectue le paiement ?',
        r: 'Vous ne payez qu’à la réception de votre colis. Vous pouvez régler en espèces au livreur ou via Wave et Orange Money.',
      },
      {
        q: 'Le paiement à la livraison comporte-t-il des frais supplémentaires ?',
        r: 'Absolument aucun. Vous ne payez que le montant exact affiché sur votre récapitulatif de commande.',
      },
    ],
  },
  {
    categorie: 'Retours & Échanges',
    icone: 'sync',
    items: [
      {
        q: 'Quelle est la politique de retour ?',
        r: 'Vous disposez de 7 jours après réception pour demander un échange ou un retour si la taille ne convient pas ou si l’article présente un défaut.',
      },
      {
        q: 'Comment faire une demande d’échange ?',
        r: 'Contactez notre service client via notre formulaire de contact ou directement sur WhatsApp avec votre numéro de commande.',
      },
    ],
  },
];

export default function Faq() {
  const [questionOuverte, setQuestionOuverte] = useState(null);
  const [recherche, setRecherche] = useState('');

  const toggleQuestion = (id) => {
    setQuestionOuverte((prev) => (prev === id ? null : id));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
      <Revelation className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
          <span className="material-symbols-outlined text-[16px]">help</span> Centre d'Aide
        </span>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          Foire Aux Questions (FAQ)
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-on-surface-variant">
          Trouvez des réponses immédiates à toutes vos questions sur la livraison, le paiement et vos commandes.
        </p>

        {/* Search FAQ */}
        <div className="mt-6 relative max-w-md mx-auto">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            type="text"
            placeholder="Rechercher une question (ex: livraison, paiement...)"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest py-3 pl-10 pr-4 text-xs text-on-surface focus:border-primary focus:outline-none shadow-sm"
          />
        </div>
      </Revelation>

      <div className="space-y-8">
        {QUESTIONS_CATEGORIE.map((cat, cIdx) => (
          <Revelation key={cIdx} delai={cIdx * 90}>
            <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-outline-variant/60">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-primary">
                  <span className="material-symbols-outlined text-[20px]">{cat.icone}</span>
                </span>
                <h2 className="text-lg font-bold text-on-surface">{cat.categorie}</h2>
              </div>

              <div className="space-y-3">
                {cat.items
                  .filter(
                    (item) =>
                      !recherche ||
                      item.q.toLowerCase().includes(recherche.toLowerCase()) ||
                      item.r.toLowerCase().includes(recherche.toLowerCase()),
                  )
                  .map((item, qIdx) => {
                    const idUnique = `${cIdx}-${qIdx}`;
                    const ouverte = questionOuverte === idUnique;

                    return (
                      <div
                        key={qIdx}
                        className="rounded-2xl border border-outline-variant/60 bg-surface-container-low/50 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleQuestion(idUnique)}
                          className="flex w-full items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-on-surface"
                        >
                          <span>{item.q}</span>
                          <span
                            className={`material-symbols-outlined text-[20px] text-primary transition-transform ${
                              ouverte ? 'rotate-180' : ''
                            }`}
                          >
                            expand_more
                          </span>
                        </button>

                        {ouverte && (
                          <div className="px-4 pb-4 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/40 pt-3">
                            {item.r}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </Revelation>
        ))}
      </div>

      {/* Besoins d'aide complementaire */}
      <div className="mt-12 text-center rounded-3xl bg-primary-container/40 border border-primary/30 p-8">
        <h3 className="text-base font-bold text-on-surface">Vous avez une question spécifique ?</h3>
        <p className="mt-1 text-xs text-on-surface-variant">Notre équipe vous répond sur WhatsApp ou par e-mail dans la journée.</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link to="/contact">
            <Bouton iconeApres="arrow_forward">Formulaire de contact</Bouton>
          </Link>
        </div>
      </div>
    </div>
  );
}
