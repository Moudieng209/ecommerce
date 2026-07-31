else if(isset($_POST['modify_produit'])){
    $id=$_POST['id_produit'];
    $nom=$_POST['nom'];
    $prix=$_POST['prix'];
    $desc=$_POST['desc'];
    $image = $_FILES['image']['name'];
    $tmp = $_FILES['image']['tmp_name'];
    $file_name=pathinfo($image,PATHINFO_FILENAME);
    $extension=pathinfo($image,PATHINFO_EXTENSION);
    $new_image= $file_name. "." . $extension;
    $dossier="image/";
    $path=$dossier . $new_image;
    if (move_uploaded_file($tmp,$path)){
        $req="UPDATE produits SET nom='$nom',description='$desc',prix='$prix',image='$image' WHERE id_produit='$id'";
        $resultat= mysqli_query($connexion , $req);
            if($resultat){
                header("location:gestion_produit.php");
            } 
        }
    else{
        header('location:gestion_produit.php?alert=modification échouée');
    }
}
