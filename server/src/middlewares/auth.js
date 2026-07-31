import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { uneLigne } from '../config/db.js';
import { ErreurHttp } from '../utils/ErreurHttp.js';

/**
 * Le jeton est transporte par un cookie httpOnly : contrairement au localStorage,
 * il reste inaccessible au JavaScript de la page, donc a une injection XSS.
 * L'en-tete Authorization reste accepte pour les tests (curl, Postman).
 */
function lireJeton(req) {
  const cookie = req.cookies?.[config.jwt.nomCookie];
  if (cookie) return cookie;

  const entete = req.headers.authorization;
  if (entete?.startsWith('Bearer ')) return entete.slice(7);

  return null;
}

export function signerJeton(utilisateur) {
  return jwt.sign({ sub: utilisateur.id, role: utilisateur.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiration,
  });
}

export function poserCookie(res, jeton) {
  res.cookie(config.jwt.nomCookie, jeton, {
    httpOnly: true,
    secure: config.production,
    sameSite: config.production ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function retirerCookie(res) {
  res.clearCookie(config.jwt.nomCookie, {
    httpOnly: true,
    secure: config.production,
    sameSite: config.production ? 'none' : 'lax',
    path: '/',
  });
}

/**
 * Renseigne req.utilisateur si un jeton valide est present, sans jamais bloquer :
 * les routes publiques peuvent ainsi adapter leur reponse a l'utilisateur connecte.
 */
export async function identifier(req, res, next) {
  const jeton = lireJeton(req);
  if (!jeton) return next();

  try {
    const charge = jwt.verify(jeton, config.jwt.secret);
    // On relit l'utilisateur en base : un compte desactive ou supprime doit
    // perdre l'acces immediatement, sans attendre l'expiration du jeton.
    const utilisateur = await uneLigne(
      'SELECT id, prenom, nom, email, telephone, role, actif FROM utilisateurs WHERE id = $1',
      [charge.sub],
    );

    if (utilisateur?.actif) req.utilisateur = utilisateur;
  } catch {
    // Jeton expire ou falsifie : on poursuit en visiteur anonyme.
    retirerCookie(res);
  }

  return next();
}

export function exigerConnexion(req, res, next) {
  if (!req.utilisateur) return next(ErreurHttp.nonAuthentifie());
  return next();
}

export function exigerAdmin(req, res, next) {
  if (!req.utilisateur) return next(ErreurHttp.nonAuthentifie());
  if (req.utilisateur.role !== 'admin') {
    return next(ErreurHttp.interdit('Cette action est reservee aux administrateurs.'));
  }
  return next();
}
