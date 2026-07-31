import { useEffect, useRef, useState } from 'react';

// Revele son contenu a l'entree dans le viewport.
// Props : `as`, `delai`, `variante` ; animations definies dans index.css.

export default function Revelation({
  as: Balise = 'div',
  delai = 0,
  variante = 'bas',
  className = '',
  children,
  ...reste
}) {
  const ref = useRef(null);
  const [revelee, setRevelee] = useState(false);

  useEffect(() => {
    const noeud = ref.current;
    if (!noeud) return undefined;

    // Navigateur sans IntersectionObserver : le contenu est affiche tel quel, jamais masque.
    if (typeof IntersectionObserver === 'undefined') {
      queueMicrotask(() => setRevelee(true));
      return undefined;
    }

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return;
        setRevelee(true);
        // Une seule fois : le bloc ne doit pas rejouer son entree a chaque passage.
        observateur.disconnect();
      },
      // Le bloc se revele un peu avant d'etre pleinement visible, pour que
      // l'animation accompagne le defilement au lieu de le suivre.
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );

    observateur.observe(noeud);
    return () => observateur.disconnect();
  }, []);

  return (
    <Balise
      ref={ref}
      style={{ '--delai-revelation': `${delai}ms` }}
      className={`revelation revelation-${variante} ${revelee ? 'revelee' : ''} ${className}`}
      {...reste}
    >
      {children}
    </Balise>
  );
}
