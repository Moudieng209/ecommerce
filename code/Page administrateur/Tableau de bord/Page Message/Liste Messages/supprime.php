<?php
include "connexion.php";
$id_ms = $_GET['id_message'];

$requete = "DELETE from `message`  WHERE id_message = '$id_ms' ";
$result = mysqli_query($connection,$requete);
if(!$result){
    echo "Message non supprimé";
}else{

     // Réinitialiser l'auto-incrémentation
     $req_reset_auto_increment = "ALTER TABLE `message` AUTO_INCREMENT = 1";
     mysqli_query($connection, $req_reset_auto_increment);
    header("Location:index.php");//message redirection vers l'affichage en cas de reussite
}

?>