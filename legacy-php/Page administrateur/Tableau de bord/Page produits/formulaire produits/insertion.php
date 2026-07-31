<?php
include "Connexion.php";
$Id = $_POST['id_categorie'];
$Nom = $_POST['nom'];
$Description = $_POST['description'];
$Prix = $_POST['prix'];
$Image = $_POST['image'];


$request = "INSERT INTO `produits`(`id_categorie`, `nom`, `description`, `prix`, `image`, `dateajout`) VALUES('$Id','$Nom','$Description','$Prix', '$Image', now())";

$resultat = mysqli_query($connection,$request);  

	if ($resultat) {
		header("Location:index.html");
	}else {
		echo "insertion echouée";
	}

?>

