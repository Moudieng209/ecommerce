<?php
include "Connexion.php";
$Prenom = $_POST['prenom'];
$Nom = $_POST['nom'];
$Email = $_POST['email'];
$Password = $_POST['password'];
$confirm = $_POST['confirmation'];


$request = "INSERT INTO `clients`(`prenom`, `nom`, `email`, `password`, `confirmation`, `dateajout`) VALUES('$Prenom','$Nom','$Email',md5('$Password'), md5('$confirm'), now())";

$resultat = mysqli_query($connection,$request);  

	if ($resultat) {
		header("Location:index.html");
	}else {
		echo "insertion echouée";
	}

?>

