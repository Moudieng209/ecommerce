<?php
include "connexion.php";
$id = $_GET['id_categorie'];

$requete = "SELECT * from categories where id_categorie ='$id'";

$resultat = mysqli_query($connection,$requete);
$categorie = mysqli_fetch_assoc($resultat);
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modification</title>
    <link rel="shortcut icon" href="../../../../../images/inscription1.png">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <link rel="stylesheet" href="modification.css" />
</head>
<body>
<a href="index.php" style="color: black; font-size:40px;"><i class='bx bx-left-arrow-circle'></i></a> 

<form class="form" method="POST" action="update.php">
    <p class="title">Modification </p>
    <p class="message">Veuillez renseigner les informations de la categorie</p>
        
        <label>
            <input required="" placeholder="" type="text" class="input" name="prenom" value="<?php echo $categorie['nom_categorie']; ?>">
            <span>Nom_categorie</span>
        </label>

        <label>
            <input required="" placeholder="" type="text" class="input" name="nom" value="<?php echo  $categorie["description"]; ?>">
            <span>Description</span>
        </label>
      
            

    <button class="submit">Enregistrer</button>

</form>
</body>
</html>