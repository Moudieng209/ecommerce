
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>E-COMMERCE</title>
	<link rel="shortcut icon" href="../images/home.png">
	<link rel="stylesheet" href="index.css">
    <script src="http://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick-theme.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css">
    <script src="https://kit.fontawesome.com/b99e675b6e.js"></script>
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
</head>
<style>
    
      .mouni {
            color: black;
            font-size: 2em;
            font-weight: 300;
            text-transform: capitalize;
        }

        .mouni span {
            color: goldenrod;
            font-size: 1.5em;
            font-weight: 700;
        }

        .moon .col50 img {
            height: 450px;
            width: 600px;
        }

        .text {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }

        .menu {
            margin-top: -100px;
        }

        h2{
            margin-left: 50%;
        }
        .menu .contenu {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 20px;
        }

        .menu .contenu .mariam {
            width: 350px;
            margin: 20px;
            border: 20px solid snow;
            box-shadow: 20px 15px 35px rgba(0, 0, 0, 0.8);
        }

        .menu .contenu .mariam .immariam {
            width: 100%;
            height: 300px;
        }

        .menu .contenu .mariam .immariam img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .menu .contenu .mariam .text{
            text-align: center;
            font-weight: 300px;
            color: #111;
        }
        .menu .contenu .mariam .text h3{
            font-weight: 400;
        }
        
        .headerr {
            position: absolute;
            width: 100%;
            padding: 20px 10%;
            margin: 0;
            background: black;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .headerr a:hover {
            color: #83e2b6;
        }

        .logo {
            font-size: 25px;
            color: #f5f5f5;
            text-decoration: none;
            font-weight: 600;
        }

        .navbar {
            display: flex;
            align-items: center;
        }


        .navbar a {
            font-size: 18px;
            color: #f5f5f5;
            text-decoration: none;
            font-weight: 500;
            margin-left: 35px;
            transition: .3s;
        }

        .navbar a:hover {
            color: #83e2b6;
        }

        body {
             margin: 0;
        }

        /* slider */
        #containerSlider {
            margin: auto;
            width: 90%;
            height: 70vh;
            text-align: center;
            position: relative;
            top: 100px;
            box-sizing: border-box;
        }

        #containerSlider img {
            width: 100%;
            height: 65vh;
            text-align: center;
            align-content: center;
        }
        /* A propos */
        #about{
            margin-top: 0px;
        }
        #about .row{
            display: flex;
            align-items: center;
            gap: 2rem;
            flex-wrap: wrap;
            padding: 1.5rem 0;
            padding-bottom: 3rem;
        }
        #about .row .video-container{
            flex: 1 1 40rem;
            position: relative;
            height: 800px;

        }
        #about .row .video-container .video{
            width: 100%;
            border: 1.5rem solid #fff;
            border-radius: 5rem;
            box-shadow: 0.5rem 1rem rgba(0, 0, 0, .1);
            height: 100%;
            object-fit: cover;
        }
        #about .row .content{
            flex: 1 1 40rem;
        }
        #about .row .content p{
            font-size: 1rem;
            color: #333;
            padding: .5rem 0;
            padding-top: 1rem;
            height: 800px;  
        }

        #about .row .content span{
            font-weight: bold;
        }

        /* Partie footer */
footer {
    background-color: #111;
}

.footerContainer {
    width: 100%;
    padding: 70px 30px 20px;
}

.socialIcons {
    display: flex;
    justify-content: center;
}

.socialIcons a {
    text-decoration: none;
    padding: 10px;
    background-color: white;
    margin: 10px;
    border-radius: 50%;
}

.socialIcons a i {
    font-size: 2em;
    color: black;
    opacity: 0.9;
}

/* Hover  */
.socialIcons a:hover {
    background-color: #111;
    transition: 0.5s;
}

.socialIcons a:hover i {
    color: white;
    transition: 0.5s;
}

.footerNav {
    margin: 30px 0;
}

.footerNav ul {
    display: flex;
    justify-content: center;
    list-style-type: none;
}

.footerNav ul li a {
    color: white;
    margin: 20px;
    text-decoration: none;
    font-size: 1.3em;
    opacity: 0.7;
    transition: 0.5s;
}

.footerNav ul li a:hover {
    opacity: 1;
}

.footerBottom {
    background-color: #000;
    padding: 20px;
    text-align: center;
}

.footerBottom p {
    color: white;
}

.designer {
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 400;
    margin: 0px 5px;
}

/* responsive */
@media (max-width: 1024px) {
        body {
            font-size: 15px;
        }
        .navbar a {
            font-size: 16px;
        }
        .footerNav ul li a {
            font-size: 1.2em;
        }
        .slider #containerSlider img {
            height: auto;
        }
    }

    @media (max-width: 768px) {
        body {
            font-size: 14px;
        }
        .navbar a {
            font-size: 15px;
        }
        .footerNav ul li a {
            font-size: 1.1em;
        }
        .slider #containerSlider img {
            height: auto;
        }
    }

    @media (max-width: 480px) {
        body {
            font-size: 12px;
        }
        .navbar a {
            font-size: 14px;
        }
        .footerNav ul li a {
            font-size: 1em;
        }
        .headerr {
            flex-direction: column;
            align-items: flex-start;
        }
        .navbar {
            flex-direction: column;
            align-items: flex-start;
        }
        .slider #containerSlider {
            margin-top: 60px;
        }
        .slider #containerSlider img {
            width: 100%;
            height: auto;
        }
    }

    @media (max-width: 375px) {
        body {
            font-size: 11px;
        }
        .navbar a {
            font-size: 13px;
        }
        .footerNav ul li a {
            font-size: 0.9em;
        }
        .slider #containerSlider {
            margin-top: 100px; /* Ajout de marge pour éviter que le slider cache la navbar */
        }
        .slider #containerSlider img {
            width: 100%;
            height: auto;
        }
    }

</style>
<body>
	<header class="headerr">
		
		<a class="logo"><i class="bx bxs-shopping-bag"></i><span style="color: #83e2b6;">3MT-</span>Shopping</a>
        
		<nav class="navbar">
			<a href="#"><i class="fas fa-home" style="color: #83e2b6;">Acceuil</i></a>
			<a href="#about"><i class="fa fa-info-circle">A Propos</i></a>
			<a href="#produit"><i class="fas fa-shopping-basket">Nos Produits</i></a>
			<a href="contact.html"><i class="fa fa-address-card">Contact</i></a>
            <a href="connexion page client/index.php"><i class="fas fa-lock">Connexion</i></a>
		</nav>
	</header>

    <section class="slider">
        <div id="containerSlider">
            <div id="slidingImage"> <img src="../images/home8.jpg" alt="image1"> </div>
            <div id="slidingImage"> <img src="../images/home9.jpg" alt="image2"> </div>
            <div id="slidingImage"> <img src="../images/home16.jpg" alt="image3"> </div>
            <div id="slidingImage"> <img src="../images/home10.jpg" alt="image4"> </div>
        </div>
    </section>

<section class="logo" style="margin-top: 250px;">
<img src="../images/logo.png" alt="logo"  style="margin-left: 35%; width: 25%; height: auto;">
</section>

<section id="about">
<div class="row">
    <div class="video-container">
        <video src="../images/video1.mp4" loop autoplay muted></video>
       

    </div>
    <div class="content">
        
        <p>Bienvenue sur 3MT Shop, votre destination en ligne pour divers produits et matériels. Nous sommes passionnés par le domaine commercial et nous nous engageons à vous offrir les meilleurs produits de qualité, accompagnés d’un service client exceptionnel. <br><br>

            <span>Notre Mission:</span>
            Chez 3MT Shop, notre mission est de fournir des produits innovants qui améliorent votre quotidien. Nous croyons en la qualité, l’innovation et la satisfaction des clients. <br><br>
            
            <span>Notre Histoire:</span>
            Fondé en 2024, 3MT Shop a commencé avec une simple idée de mettre en place un site e-commerce. Depuis, on évolue pour devenir un leader dans le marché. Nous sommes fiers de notre parcours et de la confiance que nos clients nous accordent. <br><br>
            
            <span>Pourquoi Nous Choisir ?</span><br>
            Qualité Supérieure : Nous sélectionnons soigneusement nos produits pour garantir leur qualité et leur durabilité. <br><br>
            <span>Service Client Dédié :</span> Notre équipe est toujours prête à vous aider et à répondre à vos questions. <br>
            Livraison Rapide : Nous nous efforçons de vous livrer vos commandes dans les plus brefs délais. <br>
            Merci de faire partie de notre communauté. Nous sommes impatients de vous servir et de vous offrir une expérience d’achat exceptionnelle.
            </p>
       
    </div>
</div>
 </section>
 
                   
<section class="menu" id="produit">
<p style="margin-left: 45%;"><span style="font-weight:bold; font-size: 30px;">Nos Produits</span></p>
    
        <div class="contenu">
                                                                                <div class="mariam">
                                                                                    <div class="immariam">
                                                                                        <img src="../images/clothes.png" alt="">
                                                                                    </div>
                                                                                    <div class="text">
                                                                                        <h3>vêtements de couleurs assorties sur porte-vêtements, T-shirt Armoires à vêtements & Penderies Placard Cintre, 
                                                                                            vêtements, vente au détail, mode, top</h3>
                                                                                    </div>
                                                                                </div>

                                                                <div class="mariam">
                                                                    <div class="immariam">
                                                                        <img src="../images/foot.png" alt="">
                                                                    </div>
                                                                    <div class="text">
                                                                        <h3>Air Force Nike Free Sneakers Huarache Chaussure, chaussures de course, blanc, 
                                                                            gris, outdoor Chaussure</h3>
                                                                    </div>
                                                                </div>

                                                <div class="mariam">
                                                    <div class="immariam">
                                                        <img src="../images/vtm.png" alt="">
                                                    </div>
                                                    <div class="text">
                                                        <h3>Marque de vêtements Veste d’extérieur, promotion de vêtements, cintre, haut, accessoires 
                                                            de vêtements</h3>
                                                    </div>
                                                </div>

                            <div class="mariam">
                                <div class="immariam">
                                    <img src="../images/billet.png" alt="">
                                </div>
                                <div class="text">
                                    <h3></h3>
                                </div>
                            </div>

            <div class="mariam">
                <div class="immariam">
                    <img src="../images/finance1.png" alt="">
                </div>
                <div class="text">
                    <h3></h3>
                </div>
            </div>

                                    <div class="mariam">
                                        <div class="immariam">
                                            <img src="../images/delivey1.png" alt="">
                                        </div>
                                        <div class="text">
                                            <h3></h3>
                                        </div>
                                    </div>
        </div>
    </section>
    <footer>
        <div class="footerContainer">
            <div class="socialIcons">
                <a href="https://wa.me/+221786339806?text=Bonjour%2C"><i class='bx bxl-whatsapp'></i></a>
                <a href="https://www.instagram.com/mouhamed.dieng209?utm_source=ig_web_button_share_sheet&igsh=ODdmZWVhMTFiMw=="><i class='bx bxl-instagram'></i></a>
                <a href="https://www.facebook.com/profile.php?id=100011391988654&mibextid=kFxxJD"><i class='bx bxl-facebook'></i></a>
                <a href="https://www.twitter.com"><i class='bx bxl-twitter'></i></a>
                <a href="https://www.linkedin.com/in/mouhamed-dieng-17774b2b9?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"><i class='bx bxl-linkedin'></i></a>
            </div>
        </div>
        <div class="footerNav">
            <ul>
                <li><a href="#">Accueil</a></li>
                <li><a href="#about">A Propos</a></li>
                <li><a href="#">Services</a></li>
                <li><a href="contact.html">Contact</a></li>
            </ul>
        </div>
        <div class="footerBottom">
            <p>&copy; 2024 Tous droits sont reservés. <span class="designer">par Lamine Dieng, Mounira Ibrahim, Mariama Diop, Thioro Cissé</span></p>
        </div>
    </footer>
</body>
</html>
<!-- script slider -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js"></script>
    <script>
        $(document).ready(function()
        {
        $('#containerSlider').slick({
            dots: true,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
            });
        });
    </script>

