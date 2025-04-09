<?php
include "connexion.php";
$idi = $_GET['id_client'];

$requete = "SELECT * from clients where id_client ='$idi'";

$result = mysqli_query($connection,$requete);
$client = mysqli_fetch_assoc($result);
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
    <p class="message">Veuillez renseigner les informations du client</p>
        <div class="flex">

        <label>
            <input required="" placeholder="" type="text" class="input" name="prenom" value="<?php echo $client['prenom']; ?>">
            <span>Prenom</span>
        </label>

        <label>
            <input required="" placeholder="" type="text" class="input" name="nom" value="<?php echo $client['nom']; ?>">
            <span>Nom</span>
        </label>
    </div>  
            
    <label>
        <input required="" placeholder="" type="email" class="input" name="email" value="<?php echo $client['email']; ?>">
        <span>Email</span>
    </label> 
        
    <label>
        <input required="" placeholder="" type="password" class="input" name="password" value="<?php echo $client['password']; ?>">
        <span>Mot de passe</span>
    </label>
    
    <label>
        <input required="" placeholder="" type="password" class="input" name="confirmation" value="<?php echo $client['confirmation']; ?>">
        <span>Confirmer le mot de passe</span>
    </label>
    <button class="submit" type="submit">Mise à jour</button>

</form>
</body>
</html>