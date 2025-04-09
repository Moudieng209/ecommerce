<?php
include "Connexion.php";
$Prenom = $_POST['prenom'];
$Nom = $_POST['nom'];
$Email = $_POST['email'];
$Password = $_POST['password'];


$request = "INSERT INTO `utilisateurs`(`prenom`, `nom`, `email`, `password`, `dateajout`) VALUES ('$Prenom','$Nom','$Email','$Password',now())";

$resultat = mysqli_query($connection,$request);  

	if ($resultat) {
		header("Location:index.php");
	}else {
		echo "insertion echouée";
	}

?>