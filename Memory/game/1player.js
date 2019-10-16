//includo make.js che costruisce tabella
document.write("<script src='make.js'><\/script>");	

var carteP1 = 0;
var tentativi = 0;

function result (a,b) {
	var k=0;
	if(myArray[a] == myArray[b]){
		tentativi++;
		var imageTrovata = myArray[a];
		setTimeout(function(){document.getElementById(a).src="images/ok.png"},500);
		setTimeout(function(){document.getElementById(b).src="images/ok.png"},500);
		//per evitare problemi sovrascrivo anche l'array
		myArray[a] = "images/ok.png";
		myArray[b] = "images/ok.png";
		//assegno i punti al giocatore
		carteP1++;
		document.getElementById("right").innerHTML = tentativi;
		document.getElementById("b"+carteP1).innerHTML = '<img src="'+imageTrovata+'" class="myImg" \/>';
	}
	else {
		okScopri = false;
		tentativi++;
		document.getElementById("right").innerHTML = tentativi;
		ricopri(a,b);
	}
	contClick = 0;
	image1 = -5;
	image2 = -10;
	finePartita();
}

function ricopri(a,b) {
	if (myArray[a] != a || myArray[b] != b){
		setTimeout(function(){document.getElementById(a).src="images/myIcon.png"},800);
		setTimeout(function(){document.getElementById(b).src="images/myIcon.png"},800);
		setTimeout(function(){okScopri = true;},800);
	}
}	

function finePartita() {
	if(carteP1 == 18)
		punteggio();
}

function punteggio() {
	var myBody = "<p>You win with "+ tentativi +" moves<\/p>";
	//riscrivo una pagina html col punteggio...
	var newContent='<html><head><title>Fine Partita</title><meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"><style type="text/css">body {	background-color: #000033;	background-image: url(images/fine.gif);} p{	color:white; font-size:100px; font-family:Arial; text-align:center; font-weight: bold;}</style></head><body>'+myBody+'<a href="../index.html"><div align="center"><img src="images/rigioca.png" /></a></div></body></html>';
	document.write(newContent);
	document.close();
}