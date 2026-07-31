<?php
include "Connexion.php";

$id = $_GET['id_utilisateur'];
$req_delete = "DELETE FROM utilisateurs WHERE id_utilisateur='$id'";

$resultat = mysqli_query($connection, $req_delete);

if (!$resultat) {
    echo "Erreur de suppression";
} else {
    // Réinitialiser l'auto-incrémentation
    $req_reset_auto_increment = "ALTER TABLE utilisateurs AUTO_INCREMENT = 1";
    mysqli_query($connection, $req_reset_auto_increment);

    header("location:index.php"); // redirection
}
?>
