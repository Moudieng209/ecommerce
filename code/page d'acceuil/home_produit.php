<?php
require_once 'connexion.php';

$search = '';
if (isset($_GET['search'])) { 
    $search = $_GET['search'];
    $sql = "SELECT * FROM produits WHERE nom LIKE '%$search%' ORDER BY id_produit ASC";
} else {
    $sql = "SELECT * FROM produits ORDER BY id_produit ASC";
}
$tous_produits = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="../../images/produits.png">
    <link rel="stylesheet" href="home_produit.css">
    <link rel="stylesheet" href="accueil.css">
    <script src="https://kit.fontawesome.com/b99e675b6e.js"></script>
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <title>Produits</title>
</head>
<body>
<header class="header">
    <a class="logo"><i class='bx bx-shopping-bag' ></i><span style="color: #83e2b6;">3MT-</span>shopping</a>
    <nav class="navbar">
        <form method="GET" action="">
            <input type="search" name="search" class="input" placeholder="rechercher..." value="<?php echo htmlspecialchars($search); ?>" style="border: none; outline: none; padding: 8px; border-radius: 30px; background:#f3f3f3">
        </form>
        <a href="accueil.php"><i class="fas fa-home" style="color: #f5f5f5;">Acceuil</i></a>
        <a href="#"><i class="fas fa-shopping-basket" style="color: #f5f5f5; color: #83e2b6;">Produits</i></a>
        <a href="panier.php"><i class="fa fa-cart-plus" style="color: #f5f5f5;">Panier</i></a>
        <a href="page_commande.php"><i class="bx bx-cart-download" style="color: #f5f5f5;">Commande</i></a>
    </nav>
</header>

<main>
    <?php
    while($row = mysqli_fetch_assoc($tous_produits)){
        $imageData = $row['image']; 
    ?>
    <div class="card">
        <div class="image">
            <img src="../../images/<?php echo $row["image"]; ?>" >
        </div>
        <div class="caption">
            <p class="rate">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
            </p>
            <p class="product_name"><b><del>Nom:</del></b><?php echo $row["nom"]; ?></p>
            <p class="price"><b><del>Prix:</del><?php echo $row["prix"]; ?></b></p>
            <p class="discount"><b><del>Détails:</del><?php echo $row["description"]; ?></b></p>
        </div>
        <button class="add" data-id="<?php echo $row["id_produit"]; ?>" style="margin-top: 50px;"><i class='bx bxs-cart-add' style="font-size: 20px;">Ajouter au panier</i></button>
    </div>
    <?php } ?>
</main>
<script>
    // Cette ligne sélectionne tous les éléments HTML ayant la classe add et les stocke dans la variable id_produit
   var id_produit = document.getElementsByClassName("add");
//    parcourt tous les éléments de id_produit et ajoute un écouteur d’événements click à chacun d’eux
for (var i = 0; i < id_produit.length; i++) {
    id_produit[i].addEventListener("click", function(event) {
// Lorsque l’élément est cliqué, l’ID du produit est récupéré à partir de l’attribut data-id de l’élément cliqué.
        var target = event.currentTarget;
        var id = target.getAttribute("data-id");
// Création une nouvelle requête XMLHttpRequest.
        var xml = new XMLHttpRequest();
        xml.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var response = JSON.parse(this.responseText);
                target.innerHTML = response.in_cart;
                document.getElementById("badge").innerText = response.total_items;
            }
        };
        xml.open("GET", "ajouter_au_panier.php?id=" + id, true);
        xml.send();
    });
}
</script>
</body>
<section style=" margin-top: 0px;">
<span style="font-weight: bold; font-size: 20px;"><p style="text-align: center;"><i class="bx bx-shopping-bag">Nos Produits</i></p></span>
</section>
<!-- script pour animation des cards lors du défilement -->
<script>
document.addEventListener("DOMContentLoaded", function() {
    const cards = document.querySelectorAll('.card');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.2 
    });

    cards.forEach(card => {
        observer.observe(card);
    });
});
</script>

</html>

