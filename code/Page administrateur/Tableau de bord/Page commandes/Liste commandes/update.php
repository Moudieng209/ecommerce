<?php
include "Connexion.php";

$id_cm = $_GET['id_commande'];

$client = $_POST['id_client'];
$Prix = $_POST['prix_total'];
$Status = $_POST['status'];


$requete ="UPDATE commandes SET id_client='$client',prix_total='$Prix',`status`='$Status' where id_commande ='$id_cm'";
$requete = mysqli_query($connection,$requete);

if (!$resultat) {
	header("Location:modification.php");
}else{
	header("Location:index.php");
}
?>

