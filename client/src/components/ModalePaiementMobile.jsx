import { useState } from 'react';
import LogoPaiement from './LogosPaiement';

export default function ModalePaiementMobile({
  ouvert,
  surFermer,
  surSuccesPaiement,
  montantTotal,
  methodeChoisie = 'wave',
}) {
  const [methode, setMethode] = useState(methodeChoisie);
  const [telephone, setTelephone] = useState('');
  const [numeroCarte, setNumeroCarte] = useState('');
  const [expCarte, setExpCarte] = useState('');
  const [cvcCarte, setCvcCarte] = useState('');
  const [codeOTP, setCodeOTP] = useState('');
  const [etape, setEtape] = useState('saisie'); // 'saisie' | 'traitement' | 'otp' | 'succes'
  const [refTransaction, setRefTransaction] = useState('');

  if (!ouvert) return null;

  const lancerPaiement = (e) => {
    e.preventDefault();
    setEtape('traitement');

    // Simulation de traitement paiement sécurisé
    setTimeout(() => {
      if (methode === 'wave' || methode === 'om' || methode === 'free') {
        const genRef = `${methode.toUpperCase()}-SN-${Math.floor(100000 + Math.random() * 900000)}`;
        setRefTransaction(genRef);
        setEtape('otp');
      } else if (methode === 'cb') {
        const genRef = `CB-VISA-${Math.floor(100000 + Math.random() * 900000)}`;
        setRefTransaction(genRef);
        setEtape('succes');
        setTimeout(() => {
          surSuccesPaiement({ methode, refTransaction: genRef, telephone });
        }, 1500);
      } else {
        // Cash
        const genRef = `CASH-DELIVERY-${Math.floor(100000 + Math.random() * 900000)}`;
        setRefTransaction(genRef);
        setEtape('succes');
        setTimeout(() => {
          surSuccesPaiement({ methode: 'cash', refTransaction: genRef, telephone });
        }, 1200);
      }
    }, 1500);
  };

  const validerOTP = (e) => {
    e.preventDefault();
    setEtape('traitement');
    setTimeout(() => {
      setEtape('succes');
      setTimeout(() => {
        surSuccesPaiement({ methode, refTransaction, telephone, codeOTP });
      }, 1500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-2xl transition-all">
        {/* Header Modale */}
        <div className="flex items-center justify-between border-b border-outline-variant/60 bg-surface-container-low px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-primary">lock</span>
            <h3 className="text-base font-extrabold text-on-surface">Paiement Sécurisé Mobile</h3>
          </div>
          <button
            type="button"
            onClick={surFermer}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-outline hover:bg-surface-container hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Corps Modale */}
        <div className="p-6">
          {/* Montant a regler */}
          <div className="mb-6 text-center rounded-2xl bg-primary-container/40 p-4 border border-primary/20">
            <span className="text-xs font-bold text-outline">Montant total de votre commande :</span>
            <span className="block text-3xl font-extrabold text-primary">
              {montantTotal ? montantTotal.toLocaleString('fr-FR') : 0} FCFA
            </span>
          </div>

          {/* Etape 1: Choix methode et saisie */}
          {etape === 'saisie' && (
            <form onSubmit={lancerPaiement} className="space-y-4">
              {/* Selecteur de methode de paiement */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface">Choisissez votre moyen de paiement :</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethode('wave')}
                    className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all ${
                      methode === 'wave'
                        ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-sm font-bold'
                        : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <LogoPaiement cle="wave" className="h-9 w-9" />
                    <div>
                      <span className="block text-xs">Wave</span>
                      <span className="block text-[10px] text-outline">Paiement QR 1-clic</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethode('om')}
                    className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all ${
                      methode === 'om'
                        ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-sm font-bold'
                        : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <LogoPaiement cle="orange-money" className="h-9 w-9" />
                    <div>
                      <span className="block text-xs">Orange Money</span>
                      <span className="block text-[10px] text-outline">#144# Sénégal</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethode('cb')}
                    className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all ${
                      methode === 'cb'
                        ? 'border-primary bg-primary-container/40 text-on-primary-container shadow-sm font-bold'
                        : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <LogoPaiement cle="carte" className="h-9 w-9" />
                    <div>
                      <span className="block text-xs">Carte Bancaire</span>
                      <span className="block text-[10px] text-outline">Visa / Mastercard</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethode('cash')}
                    className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all ${
                      methode === 'cash'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm font-bold'
                        : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <LogoPaiement cle="especes" className="h-9 w-9" />
                    <div>
                      <span className="block text-xs">À la livraison</span>
                      <span className="block text-[10px] text-outline">Espèces au livreur</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Formulatires specifiques par methode */}
              {(methode === 'wave' || methode === 'om' || methode === 'free') && (
                <div className="space-y-3 pt-2">
                  <div className="rounded-2xl bg-surface-container-low p-4 text-center space-y-2 border border-outline-variant/60">
                    <p className="text-xs text-on-surface font-semibold">
                      {methode === 'wave'
                        ? 'Scannez le QR code Wave ou entrez votre numéro téléphone pour valider dans l\'application Wave :'
                        : 'Entrez votre numéro Orange Money. Vous recevrez un prompt de confirmation #144# sur votre téléphone :'}
                    </p>

                    {/* Faux QR Code Wave */}
                    {methode === 'wave' && (
                      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl border-2 border-sky-400 bg-white p-2 shadow-inner">
                        <div className="flex flex-col items-center">
                          <LogoPaiement cle="wave" className="h-12 w-12" />
                          <span className="text-[10px] font-extrabold text-sky-600 mt-1">SCAN WAVE PAY</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <label className="block">
                    <span className="block text-xs font-bold text-on-surface mb-1">Numéro Téléphone Mobile Money :</span>
                    <input
                      type="tel"
                      required
                      placeholder="+221 77 000 00 00"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-xs text-on-surface focus:border-primary focus:outline-none"
                    />
                  </label>
                </div>
              )}

              {methode === 'cb' && (
                <div className="space-y-3 pt-2">
                  <label className="block">
                    <span className="block text-xs font-bold text-on-surface mb-1">Numéro de Carte Bancaire :</span>
                    <input
                      type="text"
                      required
                      placeholder="4532 •••• •••• 8921"
                      value={numeroCarte}
                      onChange={(e) => setNumeroCarte(e.target.value)}
                      className="w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-xs text-on-surface focus:border-primary focus:outline-none"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="block text-xs font-bold text-on-surface mb-1">Date Exp :</span>
                      <input
                        type="text"
                        required
                        placeholder="MM/AA"
                        value={expCarte}
                        onChange={(e) => setExpCarte(e.target.value)}
                        className="w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-xs text-on-surface focus:border-primary focus:outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-bold text-on-surface mb-1">CVC / CVC2 :</span>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        maxLength={4}
                        value={cvcCarte}
                        onChange={(e) => setCvcCarte(e.target.value)}
                        className="w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-xs text-on-surface focus:border-primary focus:outline-none"
                      />
                    </label>
                  </div>
                </div>
              )}

              {methode === 'cash' && (
                <div className="rounded-2xl bg-succes-container/40 p-4 text-xs text-succes font-medium border border-succes/30">
                  ✓ Vous réglerez la somme exacte de {montantTotal ? montantTotal.toLocaleString('fr-FR') : 0} FCFA directement au livreur lors de la réception de votre colis à Dakar.
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-primary px-6 py-3.5 text-xs font-extrabold text-on-primary shadow-lg shadow-primary/25 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Valider et Payer {montantTotal ? montantTotal.toLocaleString('fr-FR') : 0} FCFA</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          )}

          {/* Etape 2: Loader de traitement */}
          {etape === 'traitement' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <span className="material-symbols-outlined text-[48px] text-primary animate-spin">progress_activity</span>
              <div>
                <p className="text-sm font-bold text-on-surface">Traitement sécurisé du paiement...</p>
                <p className="text-xs text-outline">Connexion aux serveurs de {methode.toUpperCase()} Sénégal</p>
              </div>
            </div>
          )}

          {/* Etape 3: Saisie Code OTP Mobile Money */}
          {etape === 'otp' && (
            <form onSubmit={validerOTP} className="space-y-4 text-center">
              <div className="rounded-2xl bg-sky-50 p-4 border border-sky-200">
                <span className="text-3xl">📱</span>
                <p className="mt-2 text-xs font-bold text-sky-900">
                  Un code de confirmation SMS a été envoyé au {telephone || '+221 77 ••• •• ••'}.
                </p>
                <p className="text-[11px] text-sky-700 mt-1">Référence transaction : {refTransaction}</p>
              </div>

              <label className="block text-left">
                <span className="block text-xs font-bold text-on-surface mb-1">Entrez le code OTP reçu par SMS :</span>
                <input
                  type="text"
                  required
                  placeholder="Ex: 849201"
                  maxLength={6}
                  value={codeOTP}
                  onChange={(e) => setCodeOTP(e.target.value)}
                  className="w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-center text-base font-extrabold text-on-surface tracking-widest focus:border-primary focus:outline-none"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl bg-primary px-6 py-3.5 text-xs font-extrabold text-on-primary shadow-lg shadow-primary/25"
              >
                Confirmer le paiement Mobile Money
              </button>
            </form>
          )}

          {/* Etape 4: Succès */}
          {etape === 'succes' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-succes-container text-succes text-3xl">
                ✓
              </div>
              <h4 className="text-lg font-extrabold text-on-surface">Paiement Accepté !</h4>
              <p className="text-xs text-outline">
                Votre référence de paiement {refTransaction} a été enregistrée avec succès.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
