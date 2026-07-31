<?php
include "connexion.php";
$id = $_GET['id_produit'];

$requete = "SELECT * from produits where id_produit ='$id'";

$resultat = mysqli_query($connection,$requete);
$produit = mysqli_fetch_assoc($resultat);
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulaire modification</title>
    <link rel="shortcut icon" href="../../../../../images/inscription1.png">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <link rel="stylesheet" href="modification.css" />
</head>
<body>
<a href="index.php" style="color: black; font-size:40px;"><i class='bx bx-left-arrow-circle'></i></a>

<form class="form" method="POST" action="update.php" enctype="multipart/form-data">
    <p class="title">Modification </p>
    <p class="message">Veuillez renseigner les informations du Produit</p>
        <div class="flex">
        <label>
            <input required="" placeholder="" type="text" class="input" name="nom_categorie" value="<?php echo $produit['id_categorie']; ?>">
            <span>id_Categorie</span>
        </label>

        <label>
            <input required="" placeholder="" type="text" class="input" name="nom" value="<?php echo  $produit["nom"]; ?>">
            <span>Nom</span>
        </label>
    </div>  
            
    <label>
        <input required="" placeholder="" type="text" class="input" name="description" value="<?php echo $produit['description']; ?>">
        <span>Description</span>
    </label> 
        
    <label>
        <input required="" placeholder="" type="text" class="input" name="prix" value="<?php echo $produit['prix']; ?>">
        <span>Prix</span>
    </label>
    
    <label>
        <img readonly type="image" class="input" accept="image/*"  src="../../../../../images/<?php echo $produit['image']; ?>" style="width: 300px; height: 200px; background: #fff" >
        <span></span>
    </label>

    <label>
        <input placeholder="" type="file" class="input" accept="image/*" name="image" >
        <span>Image</span>
    </label>
    <button class="submit">Enregistrer</button>

</form>
</body>
</html>