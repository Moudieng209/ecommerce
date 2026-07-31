<?php
include "Connexion.php";
$id = $_GET['id_client'];

$Prenom = $_POST['prenom'];
$nom = $_POST['nom'];
$email = $_POST['email'];
$password = $_POST['password'];
$confirm = $_POST['confirmation'];

$requete ="UPDATE clients SET prenom='$prenom',nom='$nom',email='$email', `password`='$password', confirmation='$confirm' where id_client ='$id'";
$requete = mysqli_query($connection,$requete);

if (!$resultat) {
	header("Location:modification.php");
}else{
	header("Location:index.php");
}
?>

