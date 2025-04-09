<?php
include "Connexion.php";

$affich = "SELECT * FROM categories ORDER BY id_categorie ASC" ;

$resultat = mysqli_query($connection,$affich);

$categorie = mysqli_fetch_all($resultat,MYSQLI_ASSOC);
//print_r($categorie);
?>


<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
	<link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
	<title>Liste</title>
	<link rel="shortcut icon" href="../../../../../images/liste.png">
</head>
<body>
<a href="../index.html" style="display:flexbox; margin-top:50px; margin-left:450px; margin-right:420px; border: 2px solid #83e2b6"><i class='bx bx-left-arrow-circle'></i></a> 

	<h1 style="display:flexbox; margin-top:50px; margin-left:450px;">Liste des catégories</h1><br><br>
	<table class="table table-bordered table-hover">
		<thead class="thead" style="background: #83e2b6;">
		  <tr>
			<th>id</th>
			<th>Nom</th>
            <th>Description</th>
            <th>Dateajout</th>
            <th>Modification</th>
            <th>Suppression</th>
           
		  </tr>
		</thead>
		<?php 
		$length = count($categorie);
		for ($i=0; $i <$length; $i++) { 
		 	
		 $key = $categorie[$i];
			?> 

		<tr>
			<td><?php echo $key['id_categorie']; ?></td>
			<td><?php echo $key['nom_categorie']; ?></td>
			<td><?php echo $key['description']; ?></td>
			<td><?php echo $key['dateajout']; ?></td>
			<td><a href="modification.php?id_categorie=<?php echo $key ['id_categorie']; ?>" class= "btn btn-primary"><i class="bx bxs-pencil">Modifier</i></a></td>
			<th><a href="supprime.php?id_categorie=<?php echo $key ['id_categorie']; ?>" class="btn btn-danger" onclick ="return confirm('êtes vous sûre de vouloir supprimer cette catégorie?')"><i class="bx bxs-trash">Supprimer</i></a></th>



		</tr>
		<?php }?>

	</table>
</body>
</html>