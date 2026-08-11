export function exporterCSV(donnees, entetes, nomFichier) {
  if (!donnees || !donnees.length) return;

  // Création du contenu CSV
  const lignes = [
    entetes.map(e => `"${e.libelle}"`).join(','), // Ligne d'en-tête
    ...donnees.map(item =>
      entetes
        .map(e => {
          let valeur = e.valeur(item);
          // Gérer les guillemets existants et forcer en chaîne
          valeur = String(valeur ?? '').replace(/"/g, '""');
          return `"${valeur}"`;
        })
        .join(',')
    )
  ];

  const contenuCSV = lignes.join('\n');
  const blob = new Blob(['\ufeff' + contenuCSV], { type: 'text/csv;charset=utf-8;' }); // BOM pour Excel
  const url = URL.createObjectURL(blob);
  
  const lien = document.createElement('a');
  lien.href = url;
  lien.setAttribute('download', `${nomFichier}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
}
