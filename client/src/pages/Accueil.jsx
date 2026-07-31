import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, urlMedia } from '../api/client';
import CarteProduit from '../components/CarteProduit';
import Revelation from '../components/Revelation';
import { Bouton } from '../components/ui';
import { EMAIL_CONTACT, TELEPHONE_CONTACT } from '../components/PiedDePage';
import { useAuth } from '../contexts/AuthContext';

// Vitrine de la boutique. La mise en page reprend le systeme de la vitrine
// SenBus Pro : hero anime a l'ouverture, sections revelees au defilement,
// cartes Material 3, FAQ en accordeon et bandeau d'appel a l'action.

const STATS = [
  { valeur: '24/7', libelle: 'Commande en ligne' },
  { valeur: '48h', libelle: 'Livraison à Dakar' },
  { valeur: '100%', libelle: 'Paiement à la livraison' },
];

const ENGAGEMENTS = [
  {
    icone: 'verified',
    titre: 'Qualité vérifiée',
    texte: 'Chaque article est sélectionné et contrôlé avant d’entrer au catalogue de la boutique.',
  },
  {
    icone: 'local_shipping',
    titre: 'Livraison rapide',
    texte: 'Vos commandes partent sous 24h et vous sont livrées partout à Dakar en 48h maximum.',
  },
  {
    icone: 'payments',
    titre: 'Paiement à la livraison',
    texte: 'Vous réglez au moment de recevoir votre colis : aucune avance, aucun risque.',
  },
  {
    icone: 'support_agent',
    titre: 'Service client dédié',
    texte: 'Une question sur une taille ou une commande ? Notre équipe vous répond dans la journée.',
  },
  {
    icone: 'sync',
    titre: 'Échange facilité',
    texte: 'Un article ne convient pas ? Vous disposez de 7 jours pour demander un échange.',
  },
  {
    icone: 'lock',
    titre: 'Compte sécurisé',
    texte: 'Vos données et votre historique de commandes sont protégés par un compte personnel.',
  },
];

const ETAPES = [
  {
    numero: '01',
    titre: 'Vous créez votre compte',
    texte: 'Une inscription en quelques secondes suffit pour retrouver votre panier sur tous vos appareils.',
  },
  {
    numero: '02',
    titre: 'Vous remplissez le panier',
    texte: 'Parcourez le catalogue, filtrez par catégorie ou par prix, et ajoutez vos articles en un clic.',
  },
  {
    numero: '03',
    titre: 'Vous validez la commande',
    texte: 'Indiquez votre adresse de livraison : la commande est enregistrée et son suivi commence.',
  },
  {
    numero: '04',
    titre: 'Vous êtes livré',
    texte: 'Votre colis est préparé, expédié puis livré. Vous réglez à la réception, en toute confiance.',
  },
];

const QUESTIONS = [
  {
    question: 'Comment passer une commande sur 3MT-Shopping ?',
    reponse:
      'Créez un compte, ajoutez les articles souhaités à votre panier puis validez la commande en indiquant votre adresse de livraison et votre numéro de téléphone. Vous recevez immédiatement une référence de commande, consultable à tout moment depuis « Mes commandes ».',
  },
  {
    question: 'Quels sont les délais et les frais de livraison ?',
    reponse:
      'Les commandes sont préparées sous 24h et livrées à Dakar sous 48h. Les frais de livraison sont de 500 cfa, quel que soit le nombre d’articles de votre panier.',
  },
  {
    question: 'Comment se passe le paiement ?',
    reponse:
      'Le paiement se fait à la livraison, directement au livreur. Vous ne réglez donc rien avant d’avoir votre colis entre les mains.',
  },
  {
    question: 'Puis-je annuler une commande ?',
    reponse:
      'Oui, tant que la commande est encore au statut « En attente », vous pouvez l’annuler depuis la page « Mes commandes ». Les articles retournent alors automatiquement en stock.',
  },
  {
    question: 'Mon panier est-il conservé si je me déconnecte ?',
    reponse:
      'Oui. Votre panier est enregistré sur votre compte et non dans le navigateur : vous le retrouvez intact à votre prochaine connexion, même depuis un autre appareil.',
  },
  {
    question: 'Comment vous contacter en cas de problème ?',
    reponse:
      'Utilisez le formulaire de la page Contact, écrivez-nous par email ou appelez-nous directement. Notre équipe traite les demandes dans la journée, du lundi au samedi.',
  },
];

// Visuels du carrousel, repris des ressources du projet d'origine.
const VISUELS_HERO = ['/images/home8.jpg', '/images/home9.jpg', '/images/home16.jpg', '/images/home10.jpg'];

const DUREE_VISUEL = 4500;

export default function Accueil() {
  const { estConnecte } = useAuth();

  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [visuel, setVisuel] = useState(0);
  const [questionOuverte, setQuestionOuverte] = useState(null);
  const [pageDefilee, setPageDefilee] = useState(false);

  useEffect(() => {
    let annule = false;

    Promise.all([api.get('/produits?parPage=8&tri=recent'), api.get('/categories')])
      .then(([reponseProduits, reponseCategories]) => {
        if (annule) return;
        setProduits(reponseProduits.produits);
        setCategories(reponseCategories.categories);
      })
      .catch(() => {
        // La vitrine reste lisible meme si l'API ne repond pas : les sections
        // dynamiques disparaissent simplement.
        if (!annule) setProduits([]);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => {
      annule = true;
    };
  }, []);

  useEffect(() => {
    const minuterie = setInterval(() => {
      setVisuel((precedent) => (precedent + 1) % VISUELS_HERO.length);
    }, DUREE_VISUEL);

    return () => clearInterval(minuterie);
  }, []);

  useEffect(() => {
    function surDefilement() {
      setPageDefilee(window.scrollY > 400);
    }

    window.addEventListener('scroll', surDefilement, { passive: true });
    return () => window.removeEventListener('scroll', surDefilement);
  }, []);

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24 lg:grid-cols-2">
          <div>
            <span
              style={{ '--delai-entree': '0ms' }}
              className="entree-hero inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-1 text-xs font-semibold text-on-primary-container"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
              Boutique en ligne sénégalaise
            </span>

            <h1
              style={{ '--delai-entree': '90ms' }}
              className="entree-hero mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-on-surface md:text-5xl xl:text-6xl"
            >
              Vos essentiels mode, <span className="text-primary">livrés chez vous</span>
            </h1>

            <p
              style={{ '--delai-entree': '180ms' }}
              className="entree-hero mt-5 max-w-xl text-lg leading-relaxed text-on-surface-variant"
            >
              Vêtements, chaussures, accessoires et parfums sélectionnés avec soin. Commandez en
              quelques clics, payez à la livraison, partout à Dakar.
            </p>

            <div style={{ '--delai-entree': '270ms' }} className="entree-hero mt-8 flex flex-wrap gap-3">
              <Link to="/produits">
                <Bouton taille="lg" iconeApres="arrow_forward">
                  Découvrir le catalogue
                </Bouton>
              </Link>
              {!estConnecte && (
                <Link to="/inscription">
                  <Bouton taille="lg" variante="secondaire">
                    Créer un compte
                  </Bouton>
                </Link>
              )}
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4">
              {STATS.map((stat, index) => (
                <div
                  key={stat.libelle}
                  style={{ '--delai-entree': `${360 + index * 90}ms` }}
                  className="entree-hero border-l-2 border-outline-variant pl-3"
                >
                  <dt className="text-xl font-extrabold text-on-surface">{stat.valeur}</dt>
                  <dd className="mt-0.5 text-xs text-on-surface-variant">{stat.libelle}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Carrousel : les visuels se succedent en fondu dans un cadre unique. */}
          <div style={{ '--delai-entree': '220ms' }} className="entree-hero relative">
            <div className="flottement rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 shadow-2xl sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-on-surface">Nouveautés de la saison</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-2.5 py-1 text-xs font-semibold text-on-primary-container">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
                  En ligne
                </span>
              </div>

              <div className="relative h-64 overflow-hidden rounded-2xl bg-surface-container sm:h-72">
                {VISUELS_HERO.map((source, index) => (
                  <img
                    key={source}
                    src={urlMedia(source)}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                      visuel === index ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}

                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 pb-3">
                  {VISUELS_HERO.map((source, index) => (
                    <button
                      key={source}
                      type="button"
                      aria-label={`Visuel ${index + 1}`}
                      onClick={() => setVisuel(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        visuel === index ? 'w-6 bg-on-primary' : 'w-1.5 bg-on-primary/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {[
                  { icone: 'local_shipping', libelle: 'Livraison à Dakar', valeur: '500 cfa' },
                  { icone: 'inventory_2', libelle: 'Articles au catalogue', valeur: `${produits.length || '—'}+` },
                ].map((ligne) => (
                  <div
                    key={ligne.libelle}
                    className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2.5"
                  >
                    <span className="flex items-center gap-2.5 text-sm font-medium text-on-surface">
                      <span className="material-symbols-outlined text-[20px] text-primary">
                        {ligne.icone}
                      </span>
                      {ligne.libelle}
                    </span>
                    <span className="text-xs font-bold text-primary">{ligne.valeur}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      {categories.length > 0 && (
        <section
          id="categories"
          className="border-y border-outline-variant/50 bg-surface-container-low/60 py-20 md:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Revelation className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-bold uppercase tracking-wider text-primary">Le catalogue</span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
                Trouvez ce qu’il vous faut, par rayon
              </h2>
            </Revelation>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((categorie, index) => (
                <Revelation key={categorie.id} delai={index * 90}>
                  <Link
                    to={`/produits?categorie=${categorie.id}`}
                    className="group flex h-full flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container transition-[transform,background-color] duration-300 group-hover:scale-110 group-hover:bg-primary motion-reduce:transition-none motion-reduce:group-hover:transform-none">
                      <span className="material-symbols-outlined text-[26px] text-primary transition-colors duration-300 group-hover:text-on-primary">
                        {ICONES_CATEGORIE[categorie.nom] ?? 'sell'}
                      </span>
                    </span>

                    <h3 className="mt-5 text-lg font-bold text-on-surface">{categorie.nom}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant">
                      {categorie.description}
                    </p>

                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      {categorie.nombre_produits} article{categorie.nombre_produits > 1 ? 's' : ''}
                      <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1 motion-reduce:transition-none">
                        arrow_forward
                      </span>
                    </span>
                  </Link>
                </Revelation>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Produits en vedette ---------- */}
      <section id="produits" className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Revelation className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="text-sm font-bold uppercase tracking-wider text-primary">Nos produits</span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
                Les dernières arrivées
              </h2>
              <p className="mt-4 text-lg text-on-surface-variant">
                Une sélection renouvelée régulièrement, pensée pour le quotidien comme pour les
                grandes occasions.
              </p>
            </div>

            <Link to="/produits">
              <Bouton variante="secondaire" iconeApres="arrow_forward">
                Tout voir
              </Bouton>
            </Link>
          </Revelation>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {chargement
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="squelette h-80 rounded-2xl border border-outline-variant"
                    aria-hidden
                  />
                ))
              : produits.slice(0, 8).map((produit, index) => (
                  <Revelation key={produit.id} delai={(index % 4) * 90}>
                    <CarteProduit produit={produit} />
                  </Revelation>
                ))}
          </div>
        </div>
      </section>

      {/* ---------- Engagements ---------- */}
      <section
        id="engagements"
        className="border-y border-outline-variant/50 bg-surface-container-low/60 py-20 md:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Revelation className="max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">Nos engagements</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
              Une boutique où acheter reste simple
            </h2>
            <p className="mt-4 text-lg text-on-surface-variant">
              De la sélection des articles jusqu’à la livraison, chaque étape est pensée pour vous
              faire gagner du temps.
            </p>
          </Revelation>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ENGAGEMENTS.map((engagement, index) => (
              <Revelation
                key={engagement.titre}
                delai={index * 90}
                className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container transition-[transform,background-color] duration-300 group-hover:scale-110 group-hover:bg-primary motion-reduce:transition-none motion-reduce:group-hover:transform-none">
                  <span className="material-symbols-outlined text-[26px] text-primary transition-colors duration-300 group-hover:text-on-primary">
                    {engagement.icone}
                  </span>
                </span>
                <h3 className="mt-5 text-lg font-bold text-on-surface">{engagement.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{engagement.texte}</p>
              </Revelation>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Notre histoire ---------- */}
      <section id="apropos" className="py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <Revelation variante="gauche" className="relative">
            <video
              src={urlMedia('/images/video1.mp4')}
              poster={urlMedia('/images/home17.jpg')}
              className="aspect-4/3 w-full rounded-3xl object-cover shadow-2xl"
              loop
              autoPlay
              muted
              playsInline
            />

            <div className="flottement absolute -top-4 left-4 flex items-center gap-2.5 rounded-2xl bg-surface-container-lowest px-4 py-3 shadow-lg sm:left-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container">
                <span className="material-symbols-outlined text-[20px] text-primary">storefront</span>
              </span>
              <span className="leading-tight">
                <span className="block text-[11px] text-on-surface-variant">Boutique fondée en</span>
                <span className="block text-sm font-extrabold text-on-surface">2024, à Dakar</span>
              </span>
            </div>
          </Revelation>

          <Revelation variante="droite">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">Notre histoire</span>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-on-surface md:text-4xl">
              Le commerce local, <span className="text-primary">à portée de clic</span>
            </h2>

            <p className="mt-5 leading-relaxed text-on-surface-variant">
              <strong className="text-on-surface">3MT-Shopping</strong> est née en 2024 d’une idée
              simple : rendre accessible en ligne une sélection de produits de qualité, sans
              intermédiaire inutile et sans mauvaise surprise sur les délais.
            </p>
            <p className="mt-4 leading-relaxed text-on-surface-variant">
              Nous sélectionnons chaque article, nous préparons chaque commande à la main et nous
              suivons chaque livraison. C’est cette attention qui fait revenir nos clients.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icone: 'diamond', titre: 'Qualité', texte: 'Des articles choisis pour durer.' },
                { icone: 'schedule', titre: 'Réactivité', texte: 'Une commande traitée sous 24h.' },
                { icone: 'handshake', titre: 'Confiance', texte: 'Vous payez à la réception.' },
              ].map((valeur, index) => (
                <Revelation
                  key={valeur.titre}
                  delai={150 + index * 110}
                  className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 motion-reduce:transition-none motion-reduce:group-hover:transform-none">
                    <span className="material-symbols-outlined text-[22px] text-on-primary">
                      {valeur.icone}
                    </span>
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-on-surface">{valeur.titre}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">{valeur.texte}</p>
                </Revelation>
              ))}
            </div>
          </Revelation>
        </div>
      </section>

      {/* ---------- Comment ca marche ---------- */}
      <section
        id="etapes"
        className="border-y border-outline-variant/50 bg-surface-container-low/60 py-20 md:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Revelation className="max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              Comment ça marche
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
              De votre panier à votre porte, en quatre étapes
            </h2>
          </Revelation>

          {/* Fil conducteur decoratif : il se remplit quand la section apparait. */}
          <Revelation
            aria-hidden
            className="mt-12 hidden h-0.5 overflow-hidden rounded-full bg-outline-variant/50 lg:block"
          >
            <span className="barre-etapes block h-full w-full bg-primary" />
          </Revelation>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ETAPES.map((etape, index) => (
              <Revelation
                key={etape.numero}
                delai={index * 140}
                className="group relative rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <span className="text-3xl font-extrabold text-primary/25 transition-colors duration-300 group-hover:text-primary">
                  {etape.numero}
                </span>
                <h3 className="mt-3 text-lg font-bold text-on-surface">{etape.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{etape.texte}</p>
              </Revelation>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Revelation className="text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">FAQ</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
              Les questions fréquentes
            </h2>
          </Revelation>

          <div className="mt-12 space-y-3">
            {QUESTIONS.map((question, index) => {
              const ouverte = questionOuverte === index;

              return (
                <Revelation
                  key={question.question}
                  delai={index * 70}
                  className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest"
                >
                  <button
                    type="button"
                    onClick={() => setQuestionOuverte(ouverte ? null : index)}
                    aria-expanded={ouverte}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        ouverte ? 'bg-primary text-on-primary' : 'bg-primary-container text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">help</span>
                    </span>

                    <span className="flex-1 text-sm font-bold text-on-surface">{question.question}</span>

                    <span
                      className={`material-symbols-outlined text-[20px] text-on-surface-variant transition-transform duration-300 motion-reduce:transition-none ${
                        ouverte ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* grid-rows anime la hauteur sans la connaitre a l'avance. */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                      ouverte ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <p className="overflow-hidden px-5 pl-17 text-sm leading-relaxed text-on-surface-variant">
                      <span className="block pb-5">{question.reponse}</span>
                    </p>
                  </div>
                </Revelation>
              );
            })}
          </div>

          <Revelation
            variante="zoom"
            className="mt-8 rounded-2xl border border-dashed border-primary/40 bg-primary-container/40 px-6 py-6 text-center"
          >
            <p className="text-sm text-on-surface-variant">Vous ne trouvez pas votre réponse ?</p>
            <Link to="/contact" className="mt-4 inline-block">
              <Bouton iconeApres="arrow_forward">Contactez-nous</Bouton>
            </Link>
          </Revelation>
        </div>
      </section>

      {/* ---------- Appel a l'action ---------- */}
      <section className="border-t border-outline-variant/50 bg-surface-container-low/60 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Revelation
            variante="zoom"
            className="degrade-anime relative overflow-hidden rounded-3xl bg-linear-to-r from-primary via-[#15996a] to-primary px-6 py-14 text-center text-on-primary sm:px-14"
          >
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Prêt à faire vos achats ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-on-primary/80">
              Créez votre compte en quelques secondes et recevez vos articles préférés directement
              chez vous.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/produits">
                <Bouton
                  taille="lg"
                  className="bg-on-primary text-primary shadow-none hover:opacity-90 hover:shadow-lg"
                  iconeApres="arrow_forward"
                >
                  Voir le catalogue
                </Bouton>
              </Link>
              <a href={`mailto:${EMAIL_CONTACT}`}>
                <Bouton
                  taille="lg"
                  variante="secondaire"
                  className="border-on-primary/30 text-on-primary hover:bg-on-primary/10"
                  icone="mail"
                >
                  {TELEPHONE_CONTACT}
                </Bouton>
              </a>
            </div>
          </Revelation>
        </div>
      </section>

      {/* Retour en haut : apparait une fois la vitrine parcourue. */}
      {pageDefilee && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Revenir en haut de la page"
          className="fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/30 transition-transform hover:-translate-y-1 active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_upward</span>
        </button>
      )}
    </div>
  );
}

// Icone associee a chaque rayon ; « sell » sert de repli pour une categorie
// creee depuis le back-office.
const ICONES_CATEGORIE = {
  Vêtements: 'checkroom',
  Chaussures: 'footprint',
  Accessoires: 'diamond',
  Parfums: 'local_florist',
};
