<?php
require_once 'connexion.php';

if (isset($_GET['id'])) {
    $id_produit = intval($_GET['id']);
    $id_client = 1; 

    // Vérifiez si le produit est déjà dans le panier
    $sql = "SELECT * FROM panier WHERE id_client = $id_client AND id_produit = $id_produit";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // Si le produit est déjà dans le panier, mettez à jour la quantité
        $sql = "UPDATE panier SET quantite = quantite + 1 WHERE id_client = $id_client AND id_produit = $id_produit";
    } else {
        // Sinon, ajoutez le produit au panier
        $sql = "INSERT INTO panier (id_client, id_produit, quantite) VALUES ($id_client, $id_produit, 1)";
    }

    if ($conn->query($sql) === TRUE) {
        // Récupérez le nombre total d'articles dans le panier
        $sql = "SELECT SUM(quantite) AS total_items FROM panier WHERE id_client = $id_client";
        $result = $conn->query($sql);
        $row = $result->fetch_assoc();
        $total_items = $row['total_items'];

        // Réponse JSON
        echo json_encode(['in_cart' => 'Ajouté', 'total_items' => $total_items]);
    } else {
        echo json_encode(['error' => 'Erreur lors de l\'ajout au panier']);
    }
} else {
    echo json_encode(['error' => 'ID produit manquant']);
}
?>
