<?php
include "Connexion.php";

$affich = "SELECT * FROM `message` ORDER BY id_message ASC";

$resultat = mysqli_query($connection,$affich);

$message = mysqli_fetch_all($resultat,MYSQLI_ASSOC);
//print_r($message);
?>


<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
	<link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
	<title>Messages</title>
	<link rel="shortcut icon" href="../../../../../images/liste.png">
</head>
<body>
    <a href="../index.html" style="color: black; font-size:40px;"><i class='bx bx-left-arrow-circle'></i></a> 

		<h1 style="display:flexbox; margin-top:50px; margin-left:450px; margin-right:420px; border: 2px solid #83e2b6"> Messages Clients</h1><br><br>
	<table class="table table-bordered table-hover">
		<thead class="thead" style="background: #83e2b6;">
		  <tr>
			<th>id</th>
			<th>Prenom</th>
			<th>Nom</th>
            <th>Email</th>
            <th>Telephone</th>
            <th>Message</th>
            <th>Date_reçu</th>
            <th>Supprimer</th>
		  </tr>
		</thead>
		<?php 
		$length = count($message);
		for ($i=0; $i <$length; $i++) { 
		 	
		 $key = $message[$i];
			?> 

		<tr>
			<td><?php echo $key['id_message']; ?></td>
			<td><?php echo $key['Prenom']; ?></td>
			<td><?php echo $key['Nom']; ?></td>
			<td><?php echo $key['Email']; ?></td>
			<td><?php echo $key['Telephone']; ?></td>
			<td><?php echo $key['Message']; ?></td>
			<td><?php echo $key['dateajout']; ?></td>
			<th><a href="supprime.php?id_message=<?php echo $key ['id_message']; ?>" class="btn btn-danger" onclick ="return confirm('êtes vous sûre de vouloir supprimer ce message?')"><i class="bx bxs-trash">Supprimer</i></a></th>



		</tr>
		<?php }?>

	</table>
</body>
</html>