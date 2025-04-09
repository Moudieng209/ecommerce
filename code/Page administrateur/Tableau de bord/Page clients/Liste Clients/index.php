<?php
include "connexion.php";

$affichage = "Select * from clients order by id_client ASC";

$resultat = mysqli_query($connection,$affichage);

$client = mysqli_fetch_all($resultat, MYSQLI_ASSOC);

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

		<h1 style="display:flexbox; margin-top:50px; margin-left:450px; margin-right:420px; border: 2px solid #83e2b6">Liste des Clients Inscrits</h1><br><br>
	<table class="table table-bordered table-hover">
		<thead class="thead" style="background: #83e2b6;">
		  <tr>
			<th>id</th>
			<th>Prenom</th>
			<th>Nom</th>
            <th>Email</th>
            <th>Password</th>
            <th>Date_ajout</th>
            <th>Modifier</th>
            <th>Supprimer</th>
		  </tr>
		</thead>
		
		<?php foreach($client as $key){?>

		<tr>
			<td><?php echo $key['id_client']; ?></td>
			<td><?php echo $key['prenom']; ?></td>
			<td><?php echo $key['nom']; ?></td>
			<td><?php echo $key['email']; ?></td>
			<td><?php echo $key['password']; ?></td>
			<td><?php echo $key['dateajout']; ?></td>
			<td><a href="modification.php?id_client=<?php echo $key ['id_client']; ?>" class= "btn btn-primary"><i class="bx bxs-pencil">Modifier</i></a></td>
			<th><a href="supprime.php?id_client=<?php echo $key ['id_client']; ?>" class="btn btn-danger" onclick ="return confirm('êtes vous sûre de vouloir supprimer ce client?')"><i class="bx bxs-trash">Supprimer</i></a></th>

		</tr>
		<?php }?>

	</table>
</body>
</html>