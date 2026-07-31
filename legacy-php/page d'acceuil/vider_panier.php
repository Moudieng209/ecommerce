<?php
require_once 'connexion.php';

$id_client = 1; 


$sql = "DELETE FROM panier WHERE id_client = $id_client";
if ($conn->query($sql) === TRUE) {
    header("location:panier.php");
} else {
    echo "Erreur de suppression: " . $conn->error;
}
?>
