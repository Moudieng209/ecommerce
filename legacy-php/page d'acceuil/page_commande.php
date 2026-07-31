<?php
require_once 'connexion.php';

$search = '';
$results = [];
if (isset($_GET['search'])) {
    $search = $_GET['search'];
    $sql = "SELECT c.id_commande, cl.prenom, cl.nom, c.prix_total, c.status, c.dateajout FROM commandes c
            JOIN clients cl ON c.id_client = cl.id_client WHERE cl.nom LIKE '%$search%' ORDER BY c.id_commande ASC";
    $results = $conn->query($sql);
} else {
    $sql = "SELECT c.id_commande, cl.prenom, cl.nom, c.prix_total, c.status, c.dateajout FROM commandes c 
            JOIN clients cl ON c.id_client = cl.id_client ORDER BY c.id_commande ASC";
    $results = $conn->query($sql);
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="../../images/cart.png">
    <link rel="stylesheet" href="panier.css">
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://kit.fontawesome.com/b99e675b6e.js"></script>
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <title>Commandes</title>
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
    display:flex;
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
    margin-right: 20px;
}

.navbar a {
    font-size: 20px;
    color: #f5f5f5;
    text-decoration: none;
    font-weight: 500;
    margin-left: 20px;
    padding-left: 0;
    transition: .3s;
}

.navbar a:hover {
    color: #83e2b6;
}
.prix_total{
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
        <a href="panier.php"><i class="fa fa-cart-plus" style="color:#f5f5f5;">Panier</i></a>
        <a href="#"><i class="bx bx-cart-download" style="color:#f5f5f5; color:#83e2b6;">Commandes</i></a>
        
    </nav>
</header>

<main>
    <div class="petit_conteneur carte_page" style="padding-right: 11px; padding-top: 80px">
    <span style="font-weight: bold; font-size: 20px;"><p style="text-align: center;"><i class="fa fa-check-circle">Vos Commandes</i></p></span>

    <form action="vider_commande.php" method="POST">
    <button type="submit" style="border: 2px solid; color: black; background: #83e2b6;" onclick ="return confirm('êtes vous sûre de vouloir vider vos commandes ?')"> <i class="bx bxs-trash">Vider commandes</i></button>
    </form>
    <table class="table table-bordered table-hover">
            <thead class="thead" style="background: #83e2b6;">
            <tr>
                <th>Id_commande</th>
                <th>Prenom</th>
                <th>Nom</th>
                <th>Prix à payer</th>
                <th>Status</th>
                <th>Dateajout</th>
                <th>Annulation</th>
            </tr>
            </thead>
            <?php while ($row = $results->fetch_assoc()): ?>
            <tr>
                <td><?php echo htmlspecialchars($row['id_commande']); ?></td>
                <td><?php echo htmlspecialchars($row['prenom']); ?></td>
                <td><?php echo htmlspecialchars($row['nom']); ?></td>
                <td><?php echo htmlspecialchars($row['prix_total']); ?> cfa</td>
                <td><?php echo htmlspecialchars($row['status']); ?></td>
                <td><?php echo htmlspecialchars($row['dateajout']); ?></td>
			    <td><a href="supprimer_commande.php?id_commande=<?php echo $row['id_commande']; ?>" class="btn btn-danger" onclick ="return confirm('êtes vous sûre de vouloir annuler cette commande ?')">Annuler</a></td>
            </tr>
            <?php endwhile; ?>
        </table>
    </div>
</main>
</body>
</html>
