<?php
include "connexion.php";
$idi = $_GET['id_utilisateur'];

$requete = "SELECT * from utilisateurs where id_utilisateur ='$idi'";
$result = mysqli_query($connection, $requete);

if(mysqli_num_rows($result) > 0){
    $row = mysqli_fetch_assoc($result);
} else {
    echo "Aucun utilisateur trouvé.";
}
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
    <p class="message">Veuillez renseigner les informations de l'utilisateur</p>
        <div class="flex">
        <label>
            <input type="text" class="input" name="prenom" value="<?php echo $row['prenom']; ?>">
            <span>Prenom</span>
        </label>

        <label>
            <input type="text" class="input" name="nom" value="<?php echo $row['nom']; ?>">
            <span>Nom</span>
        </label>
    </div>  
            
    <label>
        <input type="email" class="input" name="email" value="<?php echo $row['email']; ?>">
        <span>Email</span>
    </label> 
        
    <label>
        <input type="password" class="input" name="password" value="<?php echo $row['password']; ?>">
        <span>Mot de passe</span>
    </label>
    
    <label>
        <input type="password" class="input" name="confirmation" value="<?php echo $row['confirmation']; ?>">
        <span>Confirmer le mot de passe</span>
    </label>
    <button class="submit">Enregistrer</button>

</form>
</body>
</html>
