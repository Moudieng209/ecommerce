# Logos des moyens de paiement

Le composant `src/components/LogosPaiement.jsx` dessine les logos en SVG : la boutique
s'affiche donc correctement sans aucun fichier ici.

Pour utiliser les **visuels officiels** des opérateurs, déposez simplement les fichiers dans ce
dossier, sous ces noms exacts :

| Fichier attendu | Moyen de paiement |
|---|---|
| `wave.png` | Wave |
| `orange-money.png` | Orange Money |
| `carte.png` | Carte bancaire (Visa / Mastercard) |
| `especes.png` | Paiement en espèces |

Chaque fichier est repris automatiquement dès qu'il est présent, sans modifier une ligne de
code : le composant tente d'abord `/logos/<nom>.png` et ne retombe sur son dessin que si le
fichier est absent.

**Recommandations** : PNG à fond transparent, carré (par exemple 128 × 128 px), moins de 50 Ko.

**Droits d'usage** : ces logos sont des marques déposées appartenant à leurs opérateurs
respectifs. Récupérez-les depuis leur kit de marque officiel et vérifiez que les afficher comme
moyens de paiement acceptés est conforme à leurs conditions d'utilisation.

> Ce dossier n'est volontairement pas servi sous `/images`, chemin relayé vers l'API par Vite.
