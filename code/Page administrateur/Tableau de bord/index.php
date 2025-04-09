<?php 
session_start();

if (isset($_SESSION['id_utilisateur']) && isset($_SESSION['email'])) {
?>

<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tableau de bord</title>
    <link rel="shortcut icon" href="../../../images/tableaubord.png">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="main.css">
</head>
<style>
    .ml-2{
        color: black;
    }
    .list-group-item{
        color: black;
    }
</style>
<body>
   
    <div id="sidebar-overlay" class="overlay w-100 vh-100 position-fixed d-none"></div>

    <!-- sidebar -->
    <div class="col-md-3 col-lg-2 px-0 position-fixed h-100 bg-white shadow-sm sidebar" id="sidebar">
        <!-- <h1 class="bi bi-bootstrap text-primary d-flex my-4 justify-content-center"></h1> -->
      <div class="list-group rounded-0">
            <a href="#" class="list-group-item list-group-item-action active border-0 d-flex align-items-center" style="background-color: #83e2b6; color:black;">
                <span class="bi bi-border-all"></span>
                <span class="ml-2">Tableau de bord</span>
            </a>
            <a href="Page produits/index.html" class="list-group-item list-group-item-action border-0 align-items-center">
                <span class="bi bi-box"></span>
                <span class="ml-2">Produits</span>
            </a>
           

            <button
                class="list-group-item list-group-item-action border-0 d-flex justify-content-between align-items-center"
                data-toggle="collapse" data-target="#sale-collapse">
                <div>
                    <span class="bi bi-cart-dash"></span>
                    <span class="ml-2">Ventes</span>
                </div>
                <span class="bi bi-chevron-down small"></span>
            </button>
            <div class="collapse" id="sale-collapse" data-parent="#sidebar">
                <div class="list-group">
                    <a href="Page clients/index.html" class="list-group-item list-group-item-action border-0 pl-5">Clients</a>
                    <a href="Page commandes/index.html" class="list-group-item list-group-item-action border-0 pl-5">Commandes</a>
                </div>
            </div>

            <button
                class="list-group-item list-group-item-action border-0 d-flex justify-content-between align-items-center"
                data-toggle="collapse" data-target="#purchase-collapse">
                <div>
                    <span class="bi bi-cart-plus"></span>
                    <span class="ml-2">Achats</span>
                </div>
                <span class="bi bi-chevron-down small"></span>
            </button>
            <div class="collapse" id="purchase-collapse" data-parent="#sidebar">
                <div class="list-group">
                    <a href="#" class="list-group-item list-group-item-action border-0 pl-5">Vendeurs</a>
                    <a href="#" class="list-group-item list-group-item-action border-0 pl-5">Achats</a>
                </div>
            </div>
        </div>
    </div>



    <div class="col-md-9 col-lg-10 ml-md-auto px-0 ms-md-auto">
        <!-- Haut de la nav -->
        <nav class="w-100 d-flex px-4 py-2 mb-4 shadow-sm">
            <!-- Fermer la barre coulissante -->
            <button class="btn py-0 d-lg-none" id="open-sidebar">
                <span class="bi bi-list text-primary h3"></span>
            </button>
            <h1 style="justify-align: center;">Bienvenue, <?php echo $_SESSION['prenom']; ?></h1><br>
            <div class="dropdown ml-auto">
                <button class="btn py-0 d-flex align-items-center" id="logout-dropdown" data-toggle="dropdown"
                    aria-expanded="false">
                    <span class="bi bi-person  h4" style="color: #83e2b6;"></span>
                    <span class="bi bi-chevron-down ml-1 mb-2 small"></span>
                </button>
                <div class="dropdown-menu dropdown-menu-right border-0 shadow-sm" aria-labelledby="logout-dropdown">
                    <a class="dropdown-item" href="../../connexion page admin/logout_form_amélioré.php">Déconnexion</a>
                    <a class="dropdown-item" href="#">Paramètres</a> 
                </div>
            </div>
        </nav>

        <!-- contenu principal -->
        <main class="p-4 min-vh-100">
            <section class="row">
                <div class="col-md-6 col-lg-4">
                    <!-- carte -->
                    <article class="p-4 rounded shadow-sm border-left mb-4" style="background-color:#83e2b6;">
                        <a href="Page produits/index.html" class="d-flex align-items-center">
                            <span class="bi bi-box h5" style="color:black;"></span>
                            <h5 class="ml-2">PRODUITS</h5>
                        </a>
                    </article>
                </div>
                <div class="col-md-6 col-lg-4">
                    <article class="p-4 rounded shadow-sm border-left mb-4" style="background-color:#83e2b6;">
                        <a href="Page clients/index.html" class="d-flex align-items-center">
                            <span class="bi bi-person h5" style="color:black;"></span>
                            <h5 class="ml-2">CLIENTS</h5>
                        </a>
                    </article>
                </div>
                <div class="col-md-6 col-lg-4">
                    <article class="p-4 rounded shadow-sm border-left mb-4" style="background-color:#83e2b6;">
                        <a href="Page utilisateurs/index.html" class="d-flex align-items-center">
                            <span class="bi bi-person-check h5" style="color:black;"></span>
                            <h5 class="ml-2">UTILISATEURS</h5>
                        </a>
                    </article>
                </div>
                <div class="col-md-6 col-lg-4">
                    <article class="p-4 rounded shadow-sm border-left mb-4" style="background-color:#83e2b6;">
                        <a href="Page catégories" class="d-flex align-items-center">
                            <span class="bi bi-folder h5" style="color:black;"></span>
                            <h5 class="ml-2">CATEGORIES</h5>
                        </a>
                    </article>
                </div>
                <div class="col-md-6 col-lg-4">
                    <article class="p-4 rounded shadow-sm border-left mb-4" style="background-color:#83e2b6;">
                        <a href="Page commandes" class="d-flex align-items-center">
                            <span class="bi bi-cart-plus h5" style="color:black;"></span>
                            <h5 class="ml-2">COMMANDES</h5>
                        </a>
                    </article>
                </div>
                <div class="col-md-6 col-lg-4">
                    <article class="p-4 rounded shadow-sm border-left mb-4" style="background-color:#83e2b6;">
                        <a href="Page Message" class="d-flex align-items-center">
                            <span class="bi bi-chat-dots h5" style="color:black;"></span>
                            <h5 class="ml-2">Messages</h5>
                        </a>
                    </article>
                </div>
            </section>

            <div class="jumbotron jumbotron-fluid rounded bg-white border-0 shadow-sm border-left px-4">
                <div class="container">
                    <h1 class="display-4 mb-2" style="color:#83e2b6;">E-commerce</h1>
                    <p class="lead text-muted" style="color:black;">Tableau de bord administratif</p>
                </div>
            </div>
        </main>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js"></script>
    <script src="main.js"></script>

</body>
</html>

<?php 
}else{
    header("location:../connexion page admin/index.php");
	exit();
}

?>