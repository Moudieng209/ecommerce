<?php
include "Connexion.php";
$id = $_POST['id_categorie'];
$Nom = $_POST['nom_categorie'];
$Description = $_POST['description'];


$requete ="UPDATE categories SET nom_categorie='$Nom', `description`='$Description' where id_client ='$id'";
$requete = mysqli_query($connection,$requete);

if (!$resultat) {
	header("Location:modification.php");
}else{
	header("Location:index.php");
}
?>

