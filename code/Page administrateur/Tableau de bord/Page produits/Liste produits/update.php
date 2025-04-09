<?php
include "Connexion.php";

$Produit = $_GET['id_produit'];

$categorie = $_POST['id_categorie'];
$Nom = $_POST['nom'];
$Description = $_POST['description'];
$Prix = $_POST['prix'];

// Vérifiez si une nouvelle image a été sélectionnée
if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
    $image = $_FILES['image']['name'];
    $image_path = "../../../../../images/" . $image;

    // Déplacez le fichier téléchargé vers le répertoire souhaité
    move_uploaded_file($_FILES['image']['tmp_name'], $image_path);

    // Mettez à jour la base de données avec la nouvelle image
    $requete = "UPDATE produits SET id_categorie='$categorie', nom='$Nom', `description`='$Description', `prix`='$Prix', `image`='$image' WHERE id_produit='$Produit'";
} else {
    // Mettez à jour la base de données sans changer l'image
    $requete = "UPDATE produits SET id_categorie='$categorie', nom='$Nom', `description`='$Description', `prix`='$Prix' WHERE id_produit='$Produit'";
}

$resultat = mysqli_query($connection, $requete);

if (!$resultat) {
    echo "Erreur lors de la mise à jour : " . mysqli_error($connection);
} else {
    header("Location:index.php");
}
?>
