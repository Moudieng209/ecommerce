<?php
session_start();
include "Connexion.php";

if (isset($_POST['email']) && isset($_POST['password'])) {

    function validate($data) {
        // trim supprime les espaces blancs au début et à la fin de la chaîne $data
        $data = trim($data);
        // stripslashes supprime les antislashs (\) ajoutés par la fonction addslashes
        $data = stripslashes($data);
        // htmlspecialchars convertit les caractères spéciaux en entités HTML
        $data = htmlspecialchars($data);
        return $data;
    }

    $user = validate($_POST['email']);
    $password = validate($_POST['password']);
    $password_hash = md5($password); // Hachage du mot de passe avec MD5

    if (empty($user)) {
        header("location:index.php?error=Le nom d'utilisateur est requis");
        exit();
    } else if (empty($password)) {
        header("location:index.php?error=Le mot de passe est requis");
        exit();
    } else {
        $sql = "SELECT * FROM utilisateurs WHERE email='$user' AND password='$password_hash'";

        $result = mysqli_query($connection, $sql);

        if (mysqli_num_rows($result) === 1) {
            $row = mysqli_fetch_assoc($result);
            if ($row['email'] === $user && $row['password'] === $password_hash) {
                $_SESSION['email'] = $row['email'];
                $_SESSION['prenom'] = $row['prenom'];
                $_SESSION['id_utilisateur'] = $row['id_utilisateur'];
                header("location:chargement.php");
                exit();
            } else {
                header("location:index.php?error=Nom d'utilisateur ou mot de passe incorrect");
                exit();
            }
        } else {
            header("location:index.php?error=Nom d'utilisateur ou mot de passe incorrect");
            exit();
        }
    }

} else {
    header("location:login_form_amélioré.php");
    exit();
}
?>
