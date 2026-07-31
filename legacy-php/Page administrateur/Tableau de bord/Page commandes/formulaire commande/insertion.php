<?php
include "Connexion.php";
$Client = $_POST['id_client'];
$Prix = $_POST['prix_total'];
$Status = $_POST['status'];



$requête = "INSERT INTO `commandes`(`id_client`, `prix_total`, `status`, `dateajout`) VALUES('$Client','$Prix','$Status', now())";

$resultat = mysqli_query($connection,$requête);  

	if ($resultat) {
		header("Location:index.html");
	}else {
		echo "insertion echouée";
	}

?>

