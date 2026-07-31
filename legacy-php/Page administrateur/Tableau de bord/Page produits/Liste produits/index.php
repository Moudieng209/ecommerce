<?php
include "Connexion.php";

$affich = "SELECT * FROM produits ORDER BY id_produit ASC";

$resultat = mysqli_query($connection,$affich);

$produit = mysqli_fetch_all($resultat,MYSQLI_ASSOC);
//print_r($client);
?>


<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
	<link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
	<title>Liste Produits</title>
	<link rel="shortcut icon" href="../../../../../images/liste.png">
</head>
<body>
<a href="../index.html" style="color: black; font-size:40px;"><i class='bx bx-left-arrow-circle'></i></a> 

		<h1 style="display:flexbox; margin-top:50px; margin-left:450px; margin-right:420px; border: 2px solid #83e2b6">Liste des Produits Inscrits</h1><br><br>
	<table class="table table-bordered table-hover">
		<thead class="thead" style="background: #83e2b6;">
		  <tr>
			<th>Id_Produit</th>
			<th>Id_Categorie</th>
			<th>Nom</th>
            <th>Description</th>
            <th>Prix</th>
            <th style="width: 10%; height:30%;">Image</th>
            <th>Date_ajout</th>
            <th>Modifier</th>
            <th>Supprimer</th>
		  </tr>
		</thead>
		<?php 
		$length = count($produit);
		for ($i=0; $i <$length; $i++) { 
		 	
		 $key = $produit[$i];
			?> 

		<tr>
			<td><?php echo $key['id_produit']; ?></td>
			<td><?php echo $key['id_categorie']; ?></td>
			<td><?php echo $key['nom']; ?></td>
			<td><?php echo $key['description']; ?></td>
			<td><?php echo $key['prix']; ?></td>
			<td><img src="../../../../../images/<?php echo $key['image']; ?>" style="width: 20%; height: 35%"></td>
			<td><?php echo $key['dateajout']; ?></td>
			<td><a href="modification.php?id_produit=<?php echo $key ['id_produit']; ?>" class= "btn btn-primary"><i class="bx bxs-pencil">Modifier</i></a></td>
			<th><a href="supprime.php?id_produit=<?php echo $key ['id_produit']; ?>" class="btn btn-danger" onclick ="return confirm('êtes vous sûre de vouloir supprimer ce produit?')"><i class="bx bxs-trash">Supprimer</i></a></th>



		</tr>
		<?php }?>

	</table>
</body>
</html>