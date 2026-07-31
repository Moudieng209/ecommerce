/**
 * Erreur applicative portant un code HTTP.
 * Toute erreur non issue de cette classe est traitee comme une 500
 * et son detail n'est jamais renvoye au client en production.
 */
export class ErreurHttp extends Error {
  constructor(statut, message, details = null) {
    super(message);
    this.name = 'ErreurHttp';
    this.statut = statut;
    this.details = details;
  }

  static requeteInvalide(message = 'Requete invalide', details = null) {
    return new ErreurHttp(400, message, details);
  }

  static nonAuthentifie(message = 'Vous devez etre connecte.') {
    return new ErreurHttp(401, message);
  }

  static interdit(message = 'Acces refuse.') {
    return new ErreurHttp(403, message);
  }

  static introuvable(message = 'Ressource introuvable.') {
    return new ErreurHttp(404, message);
  }

  static conflit(message = 'Conflit avec l etat actuel de la ressource.') {
    return new ErreurHttp(409, message);
  }
}
