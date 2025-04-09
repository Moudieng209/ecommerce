<?php
require_once 'connexion.php';

$id_client = 1;

// Calculer le total du panier
$sql = "SELECT SUM(p.prix * pa.quantite) AS total
        FROM panier pa JOIN produits p ON pa.id_produit = p.id_produit WHERE pa.id_client = $id_client";
$result = $conn->query($sql);
$row = $result->fetch_assoc();
$total = $row['total'];
$somme_a_payer = $total + 500; 


if ($somme_a_payer <= 500) {
        // header("Location: panier.php");
        echo "Veuillez ajouter un produit.";
}else{
        $sql = "INSERT INTO commandes (id_client, prix_total, `status`, dateajout) VALUES ($id_client, $somme_a_payer, 'En attente', NOW())";
        $conn->query($sql);
        
header("Location: page_commande.php");
exit();
}
?>
