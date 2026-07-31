<?php
include "connexion.php";
$id_commande= $_GET['id'];

$requete = "SELECT * from commandes where id_commande ='$id_commande'";

$resultat = mysqli_query($connection,$requete);
$commande = mysqli_fetch_assoc($resultat);
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
    <p class="title">Inscription </p>
    <p class="message">Veuillez renseigner les informations de la commande</p>
        <div class="flex">
        <label>
            <input required="" placeholder="" type="text" class="input" name="id_client" value="<?php echo $commande['id_client']; ?>">
            <span>Id_client</span>
        </label>

        <label>
            <input required="" placeholder="" type="text" class="input" name="prix_total" value="<?php echo  $commande['prix_total']; ?>">
            <span>Pix_total</span>
        </label>
    </div>  
            
    <label>
        <input required="" placeholder="" type="text" class="input" name="status" value="<?php echo $commande['status']; ?>">
        <span>Status</span>
    </label> 
        

    <button class="submit">Enregistrer</button>

</form>
</body>
</html>