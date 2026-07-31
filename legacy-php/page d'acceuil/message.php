<?php
if(isset($_GET["submit"])){
    $Prenom = $_GET['Prenom'];
    $Nom = $_GET['Nom'];
    $Email = $_GET['Email'];
    $Telephone = $_GET['Telephone'];
    $Message = $_GET['Message'];

    $connection = mysqli_connect("localhost", "root", "", "ecommerce");
    $req = "INSERT INTO `message`(`Prenom`, `Nom`, `Email`, `Telephone`, `Message`, `dateajout`) VALUES ('$Prenom','$Nom','$Email','$Telephone','$Message', now())";
    $result = mysqli_query($connection,$req);
    header("Location:accueil.php ");
}else{
    echo "Message non envoyé";
}

?>