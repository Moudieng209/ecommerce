// sélectionne l’élément HTML avec l’ID container et le stocke dans la variable container
const container = document.getElementById('container');

// sélectionne l’élément HTML avec l’ID login et le stocke dans la variable loginButton
const loginButton = document.getElementById('login');

// sélectionne l’élément HTML avec l’ID signUp et le stocke dans la variable signUpButton.
const signUpButton = document.getElementById('signUp');

// Lorsque ce bouton est cliqué, la fonction suivante est exécutée.
signUpButton.addEventListener('click', () => {
	//  ajoute la class panel-active à l’élément container Cela peut changer l’apparence de l’élément en fonction des styles définis pour cette classe dans le CSS
	container.classList.add('panel-active');
})

loginButton.addEventListener('click', () => {
	//  retire la classe panel-active de l’élément container Cela peut également changer l’apparence de l’élément en fonction des styles définis pour cette classe dans le CSS
	container.classList.remove('panel-active');
})