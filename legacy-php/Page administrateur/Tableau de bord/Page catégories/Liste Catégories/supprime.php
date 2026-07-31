<?php
include "connexion.php";
$id_cl = $_GET['id_categorie'];

$requete = "DELETE from categories WHERE id_categorie = '$id_cl' ";
$result = mysqli_query($connection,$requete);
if(!$result){
    echo "Enregistrement non supprimé";
}else{

     // Réinitialiser l'auto-incrémentation
     $req_reset_auto_increment = "ALTER TABLE categories AUTO_INCREMENT = 1";
     mysqli_query($connection, $req_reset_auto_increment);
    header("Location:index.php");//message redirection vers l'affichage en cas de reussite
}

?>