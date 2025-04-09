<!DOCTYPE html>
<html lang="fr">

<head>
	<meta charset="utf-8" />
	<title>Client</title>
	<link rel="shortcut icon" href="../../images/users.png">
	<link rel="stylesheet" href="index.css" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css" />
</head>

<body>
	<div class="container" id="container">
		<!-- PARTIE CREATION COMPTE -->
		<div class="form-container sign-up-container">
			<form action="insertion_form_amélioré.php" method="POST">
				<h1>Creer un compte</h1>
				<div class="social-container">
					<a href="#"><i class="fab fa-facebook-f"></i></a>
					<a href="#"><i class="fab fa-google-plus-g"></i></a>
					<a href="#"><i class="fab fa-linkedin-in"></i></a>
				</div>
				<!-- <span>Utiliser compte gmail</span> -->
				<input type="text" placeholder="Prenom" name="prenom" required>
				<input type="text" placeholder="Nom" name="nom" required>
				<input type="email" placeholder="Email" name="email" required>
				<input type="password" placeholder="Mot de passe" name="password" required>
				<button>Creer le compte</button>
			</form>
		</div>

		<!-- PARTIE CONNEXION -->
		<div class="form-container login-container">
			<form action="login_form_amélioré.php" method="POST">

                	<?php if (isset($_GET['error'])) { ?>
                    <p class="error"><?php echo $_GET['error']; ?></p>
                    <?php } ?>

				<h1>Se connecter</h1>
				<div class="social-container">
					<a href="#"><i class="fab fa-facebook-f"></i></a>
					<a href="#"><i class="fab fa-google-plus-g"></i></a>
					<a href="#"><i class="fab fa-linkedin-in"></i></a>
				</div>
				<!-- <span>Je n'ai pas de compte</span> -->
				<input type="email" placeholder="Email" name="email" autocomplete="on" required>
				<input type="password" placeholder="Mot de passe" name="password" required>
				<button type="submit">Se connecter</button>
			</form>
		</div>

		<div class="overlay-container">
			<div class="overlay">
				<div class="overlay-panel overlay-left">
					<h1>Connection</h1>
					<p>Veuillez cliquez sur le bouttons ci-dessous pour se connecter</p>
					<button class="ghost" id="login">Se Connecter</button>
				</div>
				<div class="overlay-panel overlay-right">
					<h1>Vous n'avez pas de compte.</h1>
					<p>Veuillez cliquez sur le bouttons ci-dessous pour créer un compte </p><br><br><br><br><br>
					<button class="ghost" id="signUp">Créer un compte</button>
				</div>
			</div>
		</div>
	</div>

	<script src="script.js" charset="utf-8"></script>
</body>

</html>