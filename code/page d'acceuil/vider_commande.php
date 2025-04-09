<?php
include "connexion.php";

// Supprimer toutes les commandes
$requete = "DELETE FROM commandes";
$result = mysqli_query($conn, $requete);
if (!$result) {
    echo "Enregistrement non supprimé: " . mysqli_error($conn);
} else {
    // Réinitialiser l'auto-incrémentation
    $req_reset_auto_increment = "ALTER TABLE commandes AUTO_INCREMENT = 1";
    mysqli_query($conn, $req_reset_auto_increment);
    header("Location:page_commande.php"); // Redirection en cas de réussite
}
?>
