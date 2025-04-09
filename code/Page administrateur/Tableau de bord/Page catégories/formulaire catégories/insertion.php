<?php
include "Connexion.php";
$Nom = $_POST['nom_categorie'];
$Description = $_POST['description'];


$request = "INSERT INTO `categories`( `nom_categorie`, `description`, `dateajout`) VALUES('$Nom','$Description', now())";

$resultat = mysqli_query($connection,$request);  

	if ($resultat) {
		header("Location:index.html");
	}else {
		echo "insertion echouée";
	}

?>

