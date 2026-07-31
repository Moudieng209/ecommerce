import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { ErreurHttp } from '../utils/ErreurHttp.js';

// Images de produits deposees par l'administration.
// Le nom du fichier est regenere : un nom fourni par le client pourrait
// contenir « ../ » et ecrire hors du dossier prevu.

const racineServeur = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DOSSIER_TELEVERSEMENTS = join(racineServeur, 'uploads');

if (!existsSync(DOSSIER_TELEVERSEMENTS)) {
  mkdirSync(DOSSIER_TELEVERSEMENTS, { recursive: true });
}

const TYPES_AUTORISES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

const stockage = multer.diskStorage({
  destination: (req, fichier, callback) => callback(null, DOSSIER_TELEVERSEMENTS),
  filename: (req, fichier, callback) => {
    const extension = extname(fichier.originalname).toLowerCase().slice(0, 10);
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

export const televersementImage = multer({
  storage: stockage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, fichier, callback) => {
    if (!TYPES_AUTORISES.has(fichier.mimetype)) {
      return callback(ErreurHttp.requeteInvalide('Format d image non supporte (jpeg, png, webp, gif ou avif).'));
    }
    return callback(null, true);
  },
}).single('image');
