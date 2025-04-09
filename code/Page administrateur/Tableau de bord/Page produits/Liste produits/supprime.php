
<?php

include "connexion.php";

$id_cl = $_GET['id_produit'];

$requete = "DELETE FROM produits WHERE id_produit = '$id_cl'";
$result = mysqli_query($connection, $requete);

if (!$result) {
    echo "Enregistrement non supprimé";
} else {
    
    // Réinitialiser l'auto-incrémentation
    $req_reset_auto_increment = "ALTER TABLE produits AUTO_INCREMENT = 1";
    mysqli_query($connection, $req_reset_auto_increment);

    header("Location:index.php"); // redirection
}
?>


