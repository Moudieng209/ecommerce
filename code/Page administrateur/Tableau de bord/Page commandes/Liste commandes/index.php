<?php
include "Connexion.php";

$affich = "SELECT * FROM commandes ORDER BY id_commande ASC";

$resultat = mysqli_query($connection,$affich);

$commande = mysqli_fetch_all($resultat,MYSQLI_ASSOC);
//print_r($client);
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
<a href="../index.html" style="color: black; font-size:40px;"><i class='bx bx-left-arrow-circle'></i></a>
		<h1 style="display:flexbox; margin-top:50px; margin-left:450px;">Liste des Commandes passées</h1><br><br>
	<table class="table table-bordered table-hover">
		<thead class="thead" style="background: #83e2b6;">
		  <tr>
			<th>Id_commande</th>
			<th>Id_client</th>
			<th>Prix_total</th>
            <th>Status</th>
            <th>Date_ajout</th>
            <th>Modifier</th>
            <th>Supprimer</th>
		  </tr>
		</thead>
		<?php 
		$length = count($commande);
		for ($i=0; $i <$length; $i++) { 
		 	
		 $key = $commande[$i];
			?> 

		<tr>
			<td><?php echo $key['id_commande']; ?></td>
			<td><?php echo $key['id_client']; ?></td>
			<td><?php echo $key['prix_total']; ?></td>
			<td><?php echo $key['status']; ?></td>
			<td><?php echo $key['dateajout']; ?></td>
			<td><a href="modification.php?id_commande=<?php echo $key['id_commande']; ?>" class= "btn btn-primary"><i class="bx bxs-pencil">Modifier</i></a></td>
			<th><a href="supprime.php?id_commande=<?php echo $key['id_commande']; ?>" class="btn btn-danger" onclick ="return confirm('êtes vous sûre de vouloir supprimer ce commande?')"><i class="bx bxs-trash">Supprimer</i></a></th>



		</tr>
		<?php }?>

	</table>
</body>
</html>