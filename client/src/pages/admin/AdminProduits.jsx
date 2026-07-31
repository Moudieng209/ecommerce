import { useCallback, useEffect, useState } from 'react';
import { api, urlMedia } from '../../api/client';
import Modale from '../../components/Modale';
import Revelation from '../../components/Revelation';
import { Bouton, Champ, CLASSES_SAISIE, Chargement, EtatVide, ImageProduit, Pastille } from '../../components/ui';
import { useNotifications } from '../../contexts/NotificationContext';
import { prix as formaterPrix } from '../../utils/format';

// CRUD des produits, avec televersement d'image. Le formulaire part en
// multipart : le fichier accompagne les champs texte dans la meme requete.

const FORMULAIRE_VIDE = {
  nom: '',
  description: '',
  prix: '',
  stock: '0',
  categorieId: '',
  actif: true,
};

export default function AdminProduits() {
  const { succes, erreur: notifierErreur } = useNotifications();

  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');

  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [enEdition, setEnEdition] = useState(null);
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [fichier, setFichier] = useState(null);
  const [apercu, setApercu] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreurs, setErreurs] = useState({});

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const requete = new URLSearchParams({ parPage: '60', inclureInactifs: 'true', tri: 'recent' });
      if (recherche) requete.set('recherche', recherche);

      const [reponseProduits, reponseCategories] = await Promise.all([
        api.get(`/produits?${requete}`),
        api.get('/categories'),
      ]);

      setProduits(reponseProduits.produits);
      setCategories(reponseCategories.categories);
    } catch (erreur) {
      notifierErreur(erreur.message);
    } finally {
      setChargement(false);
    }
  }, [recherche, notifierErreur]);

  useEffect(() => {
    const minuterie = setTimeout(charger, 300);
    return () => clearTimeout(minuterie);
  }, [charger]);

  function ouvrirCreation() {
    setEnEdition(null);
    setFormulaire(FORMULAIRE_VIDE);
    setFichier(null);
    setApercu(null);
    setErreurs({});
    setModaleOuverte(true);
  }

  function ouvrirEdition(produit) {
    setEnEdition(produit);
    setFormulaire({
      nom: produit.nom,
      description: produit.description ?? '',
      prix: String(produit.prix),
      stock: String(produit.stock),
      categorieId: produit.categorie_id ? String(produit.categorie_id) : '',
      actif: produit.actif,
    });
    setFichier(null);
    setApercu(produit.image ? urlMedia(produit.image) : null);
    setErreurs({});
    setModaleOuverte(true);
  }

  function choisirFichier(evenement) {
    const selection = evenement.target.files?.[0] ?? null;
    setFichier(selection);
    // URL locale temporaire : l'apercu s'affiche sans attendre l'envoi.
    setApercu(selection ? URL.createObjectURL(selection) : null);
  }

  async function enregistrer(evenement) {
    evenement.preventDefault();
    setEnvoi(true);
    setErreurs({});

    const donnees = new FormData();
    donnees.append('nom', formulaire.nom);
    donnees.append('description', formulaire.description);
    donnees.append('prix', formulaire.prix);
    donnees.append('stock', formulaire.stock);
    donnees.append('categorieId', formulaire.categorieId);
    donnees.append('actif', String(formulaire.actif));
    if (fichier) donnees.append('image', fichier);

    try {
      if (enEdition) {
        await api.envoyerFormulaire(`/produits/${enEdition.id}`, donnees, 'PATCH');
        succes('Produit mis à jour.');
      } else {
        await api.envoyerFormulaire('/produits', donnees);
        succes('Produit ajouté au catalogue.');
      }

      setModaleOuverte(false);
      charger();
    } catch (erreur) {
      if (erreur.details) setErreurs(Object.fromEntries(erreur.details.map((d) => [d.champ, d.message])));
      else notifierErreur(erreur.message);
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer(produit) {
    if (!window.confirm(`Supprimer définitivement « ${produit.nom} » ?`)) return;

    try {
      await api.delete(`/produits/${produit.id}`);
      succes('Produit supprimé.');
      charger();
    } catch (erreur) {
      notifierErreur(erreur.message);
    }
  }

  return (
    <div className="space-y-6">
      <Revelation className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">Produits</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            {produits.length} article{produits.length > 1 ? 's' : ''} au catalogue.
          </p>
        </div>

        <Bouton icone="add" onClick={ouvrirCreation}>
          Nouveau produit
        </Bouton>
      </Revelation>

      <div className="relative max-w-sm">
        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
          search
        </span>
        <input
          type="search"
          value={recherche}
          onChange={(evenement) => setRecherche(evenement.target.value)}
          placeholder="Rechercher un produit…"
          aria-label="Rechercher un produit"
          className="h-11 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-3 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none"
        />
      </div>

      {chargement ? (
        <Chargement />
      ) : produits.length === 0 ? (
        <EtatVide
          icone="inventory_2"
          titre="Aucun produit"
          texte="Ajoutez votre premier article pour qu’il apparaisse dans la boutique."
          action={<Bouton onClick={ouvrirCreation}>Ajouter un produit</Bouton>}
        />
      ) : (
        <Revelation className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
          {/* overflow-x-auto : le tableau defile horizontalement sur mobile
              plutot que d'elargir la page entiere. */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead className="border-b border-outline-variant bg-surface-container-low/60 text-left">
                <tr className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                  <th className="px-4 py-3">Produit</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Prix</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">État</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/60">
                {produits.map((produit) => (
                  <tr key={produit.id} className="transition-colors hover:bg-surface-container-low/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ImageProduit
                          chemin={produit.image}
                          alt={produit.nom}
                          className="h-11 w-11 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-on-surface">{produit.nom}</p>
                          <p className="max-w-xs truncate text-xs text-on-surface-variant">
                            {produit.description || '—'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-on-surface-variant">
                      {produit.categorie_nom ?? '—'}
                    </td>

                    <td className="px-4 py-3 font-bold text-primary">{formaterPrix(produit.prix)}</td>

                    <td className="px-4 py-3">
                      <Pastille
                        className={
                          produit.stock === 0
                            ? 'bg-error-container text-on-error-container'
                            : produit.stock <= 5
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-surface-container-low text-on-surface-variant'
                        }
                      >
                        {produit.stock}
                      </Pastille>
                    </td>

                    <td className="px-4 py-3">
                      <Pastille
                        className={
                          produit.actif
                            ? 'bg-succes-container text-succes'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }
                      >
                        {produit.actif ? 'En ligne' : 'Masqué'}
                      </Pastille>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => ouvrirEdition(produit)}
                          aria-label={`Modifier ${produit.nom}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary-container hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => supprimer(produit)}
                          aria-label={`Supprimer ${produit.nom}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Revelation>
      )}

      <Modale
        ouverte={modaleOuverte}
        surFermeture={() => setModaleOuverte(false)}
        titre={enEdition ? 'Modifier le produit' : 'Nouveau produit'}
        sousTitre={enEdition ? enEdition.nom : 'Renseignez les informations de l’article.'}
      >
        <form onSubmit={enregistrer} className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-outline-variant bg-surface-container">
              {apercu ? (
                <img src={apercu} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <span className="material-symbols-outlined text-[28px] text-outline">image</span>
                </span>
              )}
            </span>

            <label className="flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                Image du produit
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={choisirFichier}
                className="mt-1.5 w-full text-xs text-on-surface-variant file:mr-3 file:rounded-lg file:border-0 file:bg-primary-container file:px-3 file:py-2 file:text-xs file:font-semibold file:text-on-primary-container hover:file:bg-primary hover:file:text-on-primary"
              />
              <span className="mt-1 block text-[11px] text-on-surface-variant">
                JPEG, PNG, WebP ou AVIF — 2 Mo maximum.
              </span>
            </label>
          </div>

          <Champ
            label="Nom"
            required
            placeholder="Chemise classique"
            erreur={erreurs.nom}
            value={formulaire.nom}
            onChange={(evenement) =>
              setFormulaire((precedent) => ({ ...precedent, nom: evenement.target.value }))
            }
          />

          <Champ label="Description" erreur={erreurs.description}>
            <textarea
              rows={3}
              placeholder="Matière, coupe, conseils d’entretien…"
              value={formulaire.description}
              onChange={(evenement) =>
                setFormulaire((precedent) => ({ ...precedent, description: evenement.target.value }))
              }
              className={`${CLASSES_SAISIE} resize-y`}
            />
          </Champ>

          <div className="grid gap-4 sm:grid-cols-3">
            <Champ
              label="Prix (cfa)"
              type="number"
              min="0"
              step="1"
              required
              erreur={erreurs.prix}
              value={formulaire.prix}
              onChange={(evenement) =>
                setFormulaire((precedent) => ({ ...precedent, prix: evenement.target.value }))
              }
            />

            <Champ
              label="Stock"
              type="number"
              min="0"
              step="1"
              required
              indication="0 = rupture"
              erreur={erreurs.stock}
              value={formulaire.stock}
              onChange={(evenement) =>
                setFormulaire((precedent) => ({ ...precedent, stock: evenement.target.value }))
              }
            />

            <Champ label="Catégorie" erreur={erreurs.categorieId}>
              <select
                value={formulaire.categorieId}
                onChange={(evenement) =>
                  setFormulaire((precedent) => ({ ...precedent, categorieId: evenement.target.value }))
                }
                className={`${CLASSES_SAISIE} h-11 py-0`}
              >
                <option value="">Sans catégorie</option>
                {categories.map((categorie) => (
                  <option key={categorie.id} value={categorie.id}>
                    {categorie.nom}
                  </option>
                ))}
              </select>
            </Champ>
          </div>

          <label className="flex items-center gap-3 rounded-xl bg-surface-container-low/60 px-4 py-3">
            <input
              type="checkbox"
              checked={formulaire.actif}
              onChange={(evenement) =>
                setFormulaire((precedent) => ({ ...precedent, actif: evenement.target.checked }))
              }
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            <span className="text-sm">
              <span className="block font-semibold text-on-surface">Visible dans la boutique</span>
              <span className="block text-xs text-on-surface-variant">
                Décochez pour retirer l’article du catalogue sans le supprimer.
              </span>
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Bouton type="button" variante="secondaire" onClick={() => setModaleOuverte(false)}>
              Annuler
            </Bouton>
            <Bouton type="submit" disabled={envoi} icone={envoi ? 'progress_activity' : 'save'}>
              {envoi ? 'Enregistrement…' : 'Enregistrer'}
            </Bouton>
          </div>
        </form>
      </Modale>
    </div>
  );
}
