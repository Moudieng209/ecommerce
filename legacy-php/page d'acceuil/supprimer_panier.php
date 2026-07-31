<?php
require_once 'connexion.php';

if (isset($_GET['id'])) {
    $id_produit = $_GET['id'];
    $id_client = 1;

    // Supprimer le produit du panier
    $sql = "DELETE FROM panier WHERE id_produit = $id_produit AND id_client = $id_client";
    if ($conn->query($sql) === TRUE) {
        header("location:panier.php");
    } else {
        echo ("erreur de suppression");
    }
}
?>
