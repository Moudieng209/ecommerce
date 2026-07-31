<?php
$host ="localhost";
$username = "root";
$password = "";
$base = "ecommerce";

$connection = mysqli_connect($host,$username,$password,$base);
if (!$connection) {
echo ("Connection à la base de données échoué");
} else {
// echo("connection à la base de données reussie");
// header("location:monopage.php");
}

?>