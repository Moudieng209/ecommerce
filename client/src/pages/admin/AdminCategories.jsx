import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/client';
import Modale from '../../components/Modale';
import Revelation from '../../components/Revelation';
import { Bouton, Champ, CLASSES_SAISIE, Chargement, EtatVide, Pastille } from '../../components/ui';
import { useNotifications } from '../../contexts/NotificationContext';
import { date } from '../../utils/format';

export default function AdminCategories() {
  const { succes, erreur: notifierErreur } = useNotifications();

  const [categories, setCategories] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [enEdition, setEnEdition] = useState(null);
  const [formulaire, setFormulaire] = useState({ nom: '', description: '' });
  const [envoi, setEnvoi] = useState(false);
  const [erreurs, setErreurs] = useState({});

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const donnees = await api.get('/categories');
      setCategories(donnees.categories);
    } catch (erreur) {
      notifierErreur(erreur.message);
    } finally {
      setChargement(false);
    }
  }, [notifierErreur]);

  useEffect(() => {
    charger();
  }, [charger]);

  function ouvrir(categorie = null) {
    setEnEdition(categorie);
    setFormulaire({ nom: categorie?.nom ?? '', description: categorie?.description ?? '' });
    setErreurs({});
    setModaleOuverte(true);
  }

  async function enregistrer(evenement) {
    evenement.preventDefault();
    setEnvoi(true);
    setErreurs({});

    try {
      if (enEdition) {
        await api.patch(`/categories/${enEdition.id}`, formulaire);
        succes('Catégorie mise à jour.');
      } else {
        await api.post('/categories', formulaire);
        succes('Catégorie créée.');
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

  async function supprimer(categorie) {
    const message =
      categorie.nombre_produits > 0
        ? `« ${categorie.nom} » contient ${categorie.nombre_produits} produit(s). Ils resteront au catalogue, sans catégorie. Continuer ?`
        : `Supprimer la catégorie « ${categorie.nom} » ?`;

    if (!window.confirm(message)) return;

    try {
      await api.delete(`/categories/${categorie.id}`);
      succes('Catégorie supprimée.');
      charger();
    } catch (erreur) {
      notifierErreur(erreur.message);
    }
  }

  return (
    <div className="space-y-6">
      <Revelation className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">Catégories</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            Organisez le catalogue en rayons pour faciliter la navigation.
          </p>
        </div>

        <Bouton icone="add" onClick={() => ouvrir()}>
          Nouvelle catégorie
        </Bouton>
      </Revelation>

      {chargement ? (
        <Chargement />
      ) : categories.length === 0 ? (
        <EtatVide
          icone="category"
          titre="Aucune catégorie"
          texte="Créez des rayons pour regrouper vos articles."
          action={<Bouton onClick={() => ouvrir()}>Créer une catégorie</Bouton>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((categorie, index) => (
            <Revelation
              key={categorie.id}
              delai={index * 70}
              className="group flex flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container">
                  <span className="material-symbols-outlined text-[22px] text-primary">category</span>
                </span>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => ouvrir(categorie)}
                    aria-label={`Modifier ${categorie.nom}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary-container hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => supprimer(categorie)}
                    aria-label={`Supprimer ${categorie.nom}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              <h2 className="mt-4 font-bold text-on-surface">{categorie.nom}</h2>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-on-surface-variant">
                {categorie.description || 'Aucune description.'}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <Pastille className="bg-surface-container-low text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                  {categorie.nombre_produits} produit{categorie.nombre_produits > 1 ? 's' : ''}
                </Pastille>
                <span className="text-[11px] text-on-surface-variant">{date(categorie.cree_le)}</span>
              </div>
            </Revelation>
          ))}
        </div>
      )}

      <Modale
        ouverte={modaleOuverte}
        surFermeture={() => setModaleOuverte(false)}
        titre={enEdition ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        taille="sm"
      >
        <form onSubmit={enregistrer} className="space-y-4">
          <Champ
            label="Nom"
            required
            placeholder="Vêtements"
            erreur={erreurs.nom}
            value={formulaire.nom}
            onChange={(evenement) =>
              setFormulaire((precedent) => ({ ...precedent, nom: evenement.target.value }))
            }
          />

          <Champ label="Description" erreur={erreurs.description}>
            <textarea
              rows={3}
              placeholder="Ce que regroupe ce rayon…"
              value={formulaire.description}
              onChange={(evenement) =>
                setFormulaire((precedent) => ({ ...precedent, description: evenement.target.value }))
              }
              className={`${CLASSES_SAISIE} resize-y`}
            />
          </Champ>

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
