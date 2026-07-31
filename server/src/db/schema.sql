-- =====================================================================
--  3MT-Shopping — schema PostgreSQL
--  Reprise du modele MySQL d'origine avec les corrections suivantes :
--   * une seule table "utilisateurs" (colonne role) au lieu de
--     clients + utilisateurs, ce qui evite deux systemes de connexion ;
--   * cles etrangeres reelles + contraintes d'integrite ;
--   * lignes de commande (le modele PHP ne stockait que le montant) ;
--   * horodatages en timestamptz et montants en numeric (pas de float).
--  Ce fichier est idempotent : il peut etre rejoue sans risque.
-- =====================================================================

CREATE TABLE IF NOT EXISTS utilisateurs (
    id            SERIAL PRIMARY KEY,
    prenom        TEXT        NOT NULL,
    nom           TEXT        NOT NULL,
    email         TEXT        NOT NULL,
    mot_de_passe  TEXT        NOT NULL,
    telephone     TEXT,
    role          TEXT        NOT NULL DEFAULT 'client'
                              CHECK (role IN ('client', 'admin')),
    actif         BOOLEAN     NOT NULL DEFAULT TRUE,
    cree_le       TIMESTAMPTZ NOT NULL DEFAULT now(),
    maj_le        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unicite de l'email insensible a la casse (impossible en MySQL d'origine)
CREATE UNIQUE INDEX IF NOT EXISTS utilisateurs_email_key
    ON utilisateurs (lower(email));

CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    nom         TEXT        NOT NULL,
    description TEXT        NOT NULL DEFAULT '',
    cree_le     TIMESTAMPTZ NOT NULL DEFAULT now(),
    maj_le      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS categories_nom_key
    ON categories (lower(nom));

CREATE TABLE IF NOT EXISTS produits (
    id           SERIAL PRIMARY KEY,
    categorie_id INTEGER      REFERENCES categories (id) ON DELETE SET NULL,
    nom          TEXT         NOT NULL,
    description  TEXT         NOT NULL DEFAULT '',
    prix         NUMERIC(12, 2) NOT NULL CHECK (prix >= 0),
    image        TEXT,
    stock        INTEGER      NOT NULL DEFAULT 0 CHECK (stock >= 0),
    actif        BOOLEAN      NOT NULL DEFAULT TRUE,
    cree_le      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    maj_le       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS produits_categorie_idx ON produits (categorie_id);
CREATE INDEX IF NOT EXISTS produits_nom_idx       ON produits (lower(nom));

-- Panier persistant, rattache a l'utilisateur connecte
-- (la version PHP utilisait un id_client code en dur a 1).
CREATE TABLE IF NOT EXISTS panier_lignes (
    id              SERIAL PRIMARY KEY,
    utilisateur_id  INTEGER     NOT NULL REFERENCES utilisateurs (id) ON DELETE CASCADE,
    produit_id      INTEGER     NOT NULL REFERENCES produits (id)     ON DELETE CASCADE,
    quantite        INTEGER     NOT NULL DEFAULT 1 CHECK (quantite > 0),
    cree_le         TIMESTAMPTZ NOT NULL DEFAULT now(),
    maj_le          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (utilisateur_id, produit_id)
);

CREATE TABLE IF NOT EXISTS commandes (
    id                SERIAL PRIMARY KEY,
    reference         TEXT           NOT NULL UNIQUE,
    utilisateur_id    INTEGER        NOT NULL REFERENCES utilisateurs (id) ON DELETE CASCADE,
    statut            TEXT           NOT NULL DEFAULT 'En attente'
                                     CHECK (statut IN ('En attente', 'Validee', 'Expediee', 'Livree', 'Annulee')),
    sous_total        NUMERIC(12, 2) NOT NULL CHECK (sous_total >= 0),
    frais_livraison   NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (frais_livraison >= 0),
    total             NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    adresse_livraison TEXT,
    telephone         TEXT,
    cree_le           TIMESTAMPTZ    NOT NULL DEFAULT now(),
    maj_le            TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS commandes_utilisateur_idx ON commandes (utilisateur_id);
CREATE INDEX IF NOT EXISTS commandes_statut_idx      ON commandes (statut);

-- Detail des commandes : le nom et le prix sont recopies pour que
-- l'historique reste juste meme si le produit change ou disparait.
CREATE TABLE IF NOT EXISTS commande_lignes (
    id            SERIAL PRIMARY KEY,
    commande_id   INTEGER        NOT NULL REFERENCES commandes (id) ON DELETE CASCADE,
    produit_id    INTEGER        REFERENCES produits (id) ON DELETE SET NULL,
    nom_produit   TEXT           NOT NULL,
    image         TEXT,
    prix_unitaire NUMERIC(12, 2) NOT NULL CHECK (prix_unitaire >= 0),
    quantite      INTEGER        NOT NULL CHECK (quantite > 0),
    sous_total    NUMERIC(12, 2) GENERATED ALWAYS AS (prix_unitaire * quantite) STORED
);

CREATE INDEX IF NOT EXISTS commande_lignes_commande_idx ON commande_lignes (commande_id);

CREATE TABLE IF NOT EXISTS messages (
    id        SERIAL PRIMARY KEY,
    prenom    TEXT        NOT NULL,
    nom       TEXT        NOT NULL,
    email     TEXT        NOT NULL,
    telephone TEXT,
    contenu   TEXT        NOT NULL,
    lu        BOOLEAN     NOT NULL DEFAULT FALSE,
    cree_le   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_lu_idx ON messages (lu, cree_le DESC);

-- Mise a jour automatique de la colonne maj_le
CREATE OR REPLACE FUNCTION touch_maj_le() RETURNS trigger AS $$
BEGIN
    NEW.maj_le := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['utilisateurs', 'categories', 'produits', 'panier_lignes', 'commandes']
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', t || '_touch', t);
        EXECUTE format(
            'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION touch_maj_le()',
            t || '_touch', t
        );
    END LOOP;
END;
$$;
