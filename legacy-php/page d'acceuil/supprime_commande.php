<?php
include "connexion.php";
$id_cl = $_GET['id_commande'];

$requete = "DELETE from commandes WHERE id_commande = '$id_cl' ";
$result = mysqli_query($conn,$requete);
if(!$result){
    echo "Enregistrement non supprimé";
}else{

     // Réinitialiser l'auto-incrémentation
     $req_reset_auto_increment = "ALTER TABLE commandes AUTO_INCREMENT = 1";
     mysqli_query($conn, $req_reset_auto_increment);
    header("Location:page_commande.php");
}

?>