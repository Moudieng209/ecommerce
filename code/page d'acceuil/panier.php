<?php
require_once 'connexion.php';

$id_client = 1;
$search = '';
if (isset($_GET['search'])) {
    $search = $_GET['search'];
    $sql = "SELECT * FROM panier WHERE nom LIKE '%$search%' ORDER BY id_panier DESC";
} else {
    $sql = "SELECT p.nom, p.prix, p.image, pa.quantite, (p.prix * pa.quantite) AS somme, pa.id_produit
            FROM panier pa JOIN produits p ON pa.id_produit = p.id_produit WHERE pa.id_client = $id_client";
}

$result = $conn->query($sql);
$total = 0;
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="../../images/cart.png">
    <link rel="stylesheet" href="panier.css">
    <script src="https://kit.fontawesome.com/b99e675b6e.js"></script>
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <title>Panier</title>
</head>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

    * {
        box-sizing: border-box;
        font-family: 'Poppins', sans-serif;
        margin: 5px;
        padding: 0;
        scroll-padding-top: 2rem;
        scroll-behavior: smooth;
        list-style: none;
        text-decoration: none;
    }

    body {
        color: #081b29;
        text-decoration: none;
    }

    .header {
        position: fixed;
        width: 98.1%;
        padding: 5px 10%;
        margin-left: 0;
        margin-top: -85px;
        background: black;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header a:hover {
        color: #83e2b6;
    }

    .navbar a:hover {
        color: #83e2b6;
    }

    .logo {
        font-size: 25px;
        color: #f5f5f5;
        text-decoration: none;
        font-weight: 700;
    }

    .navbar {
        display: flex;
        align-items: center;
    }

    .navbar form {
        margin-right: 25px;
    }

    .navbar a {
        font-size: 20px;
        color: #f5f5f5;
        text-decoration: none;
        font-weight: 500;
        margin-left: 20px;
        transition: .3s;
    }

    .navbar a:hover {
        color: #83e2b6;
    }

    .prix_total {
        margin-left: 75%;
    }
</style>
<body>
<header class="header">
    <a class="logo"><i class="bx bx-shopping-bag"></i><span style="color: #83e2b6;">3MT-</span>Shopping</a>
    <nav class="navbar">
        <form method="GET" action="">
            <input type="search" name="search" class="input" placeholder="rechercher..." value="<?php echo htmlspecialchars($search); ?>" style="border: none; outline: none; padding: 8px; border-radius: 30px; background:#f3f3f3">
        </form>
        <a href="accueil.php"><i class="fas fa-home" style="color: #f5f5f5;">Acceuil</i></a>
        <a href="home_produit.php"><i class="fas fa-shopping-basket" style="color: #f5f5f5;">Produits</i></a>
        <a href="#"><i class="fa fa-cart-plus" style="color:#f5f5f5; color:#83e2b6;">Panier</i></a>
        <a href="page_commande.php"><i class="bx bx-cart-download" style="color: #f5f5f5;">Commande</i></a>
    </nav>
</header>

<main>
    <div class="petit_conteneur carte_page" style="padding-right: 11px; margin-top: 80px">
        <span style="font-weight: bold; font-size: 20px;"><p style="text-align: center;"><i class="fa fa-cart-plus">Votre Panier</i></p></span>

        <form action="vider_panier.php" method="POST">
            <button type="submit" style="border: 2px solid; color: black; background: #83e2b6;" onclick ="return confirm('êtes vous sûre de vouloir vider votre panier?')"> <i class="bx bxs-trash">Vider le panier</i></button>
        </form>

        <table>
            <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Somme</th>
            </tr>
            <?php
            while ($row = $result->fetch_assoc()) {
                if ($row['id_produit'] !== NULL) {
                    $total += $row['somme'];
            ?>
            <tr>
                <td>
                    <div class="carte_info">
                        <img src="../../images/<?php echo htmlspecialchars($row['image']); ?>" alt="<?php echo htmlspecialchars($row['nom']); ?>">
                        <div>
                            <p><?php echo htmlspecialchars($row['nom']); ?></p>
                            <small>Prix: <?php echo htmlspecialchars($row['prix']); ?> cfa</small><br>
                            <a href="supprimer_panier.php?id=<?php echo $row['id_produit']; ?>">Supprimer</a>
                        </div>
                    </div>
                </td>
                <td><input type="number" value="<?php echo htmlspecialchars($row['quantite']); ?>" id="quantite-<?php echo $row['id_produit']; ?>" onchange="updateSum(<?php echo $row['id_produit']; ?>, <?php echo $row['prix']; ?>)"></td>
                <td id="somme-<?php echo $row['id_produit']; ?>"><?php echo htmlspecialchars($row['somme']); ?> cfa</td>
            </tr>
            <?php
                }
            }
            ?>
        </table>
    </div>

    <div class="prix_total">
        <table>
            <tr>
                <td><span>Total:</span></td>
                <td id="total"><?php echo $total; ?> cfa</td>
            </tr>
            <tr>
                <td><span>Livraison:</span></td>
                <td>500 cfa</td>
            </tr>
            <tr>
                <td><span>Somme à payer:</span></td>
                <td id="somme_a_payer"><?php echo $total + 500; ?> cfa</td>
            </tr>
        </table>
    </div>
    <form action="valider_commande.php" method="POST">
        <button type="submit" name="valider" value="<?php echo $id_client; ?>" style="margin-left: 79%; padding-left:3%; padding-right: 3%; font-size:13px; color: black; background:#83e2b6;"><i class='bx bx-check'><a href="page_commande.php" style="color: black;">Valider la commande</a></i></button>
    </form>
</main>

<script>
function updateSum(id, prix) {
    var quantite = document.getElementById('quantite-' + id).value;
    var somme = prix * quantite;
    document.getElementById('somme-' + id).innerText = somme + ' cfa';

    // Mettre à jour le total général
    var total = 0;
    var sommes = document.querySelectorAll('[id^="somme-"]');
    sommes.forEach(function(element) {
        total += parseFloat(element.innerText);
    });

    document.getElementById('total').innerText = total + ' cfa';
    document.getElementById('somme_a_payer').innerText = (total + 500) + ' cfa';
}
</script>

</body>
</html>
