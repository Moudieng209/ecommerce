<?php
include "Connexion.php";
$idi = $_GET['id_utilisateur'];

$Prenom = $_POST['prenom'];
$nom = $_POST['nom'];
$email = $_POST['email'];
$password = $_POST['password'];
$confirm = $_POST['confirmation'];

$requete ="UPDATE utilisateurs SET prenom='$prenom',nom='$nom',email='$email', `password`='$password', confirmation='$confirm' where id_utilisateur ='$idi'";
$requete = mysqli_query($connection,$requete);

if (!$requete) {
	header("Location:modification.php");
}else{
	header("Location:index.php");
}
?>

