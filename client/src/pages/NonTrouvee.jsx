import { Link } from 'react-router-dom';
import { Bouton } from '../components/ui';

export default function NonTrouvee() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-container">
        <span className="material-symbols-outlined text-[40px] text-primary">travel_explore</span>
      </span>

      <p className="mt-8 text-6xl font-extrabold tracking-tight text-primary">404</p>
      <h1 className="mt-3 text-2xl font-extrabold text-on-surface">Cette page n’existe pas</h1>
      <p className="mt-3 max-w-md text-on-surface-variant">
        Le lien que vous avez suivi est peut-être erroné, ou la page a été déplacée depuis
        l’ancienne version du site.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/">
          <Bouton icone="home">Retour à l’accueil</Bouton>
        </Link>
        <Link to="/produits">
          <Bouton variante="secondaire" iconeApres="arrow_forward">
            Voir le catalogue
          </Bouton>
        </Link>
      </div>
    </div>
  );
}
