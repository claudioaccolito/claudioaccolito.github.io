//includo make.js che costruisce tabella
document.write("<script src='make.js'><\/script>");	


var carteP1 = 0;
var carteP2 = 0;

function result (a,b) {
	var k=0;
	if(myArray[a] == myArray[b]){
		var imageTrovata = myArray[a];
		document.getElementById(a).src="images/ok.png";
		document.getElementById(b).src="images/ok.png";
		//per evitare problemi sovrascrivo anche l'array
		myArray[a] = "images/ok.png";
		myArray[b] = "images/ok.png";
		//assegno i punti al giocatore
		if (player == 1){
			carteP1++;
			document.getElementById("a"+carteP1).innerHTML = '<img src="'+imageTrovata+'" class="myImg" \/>' + carteP1;
			//tocca di nuovo a player1
		}
		else if (player == 2){
			carteP2++;
			document.getElementById("b"+carteP2).innerHTML = '<img src="'+imageTrovata+'" class="myImg" \/>' + carteP2;
			//tocca di nuovo a player2
		}	
	}
	else {
		okScopri = false;
		if (player == 1) {
			ricopri(a,b);
			player = 2;
			document.getElementById("rightP").innerHTML = '<p style="color:green;"><b><u>PLAYER 2</u></b></p>';
			document.getElementById("leftP").innerHTML = '<p style="color:red;"><b>PLAYER 1</b></p>';
		}
		else if (player == 2) {
			ricopri(a,b);
			player = 1;
			document.getElementById("leftP").innerHTML = '<p style="color:green;"><b><u>PLAYER 1</u></b></p>';
			document.getElementById("rightP").innerHTML = '<p style="color:red;"><b>PLAYER 2</b></p>';
		}
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
	if(carteP1+carteP2 == 18)
		punteggio();
}

function punteggio() {
	var myBody = "";
	if (carteP1==carteP2)
		myBody = "<p>Oooh! DRAW<\/p><p>"+carteP1+" - "+carteP2+"<\/p>";
	else if (carteP1>carteP2)
		myBody = "<p>Player1 wins<\/p><p>"+carteP1+" - "+carteP2+"<\/p>";
	else if (carteP1<carteP2)
		myBody = "<p>Player2 wins<\/p><p>"+carteP2+" - "+carteP1+"<\/p>";
	//riscrivo una pagina html col punteggio...
	var newContent='<html><head><title>Fine Partita</title><meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"><style type="text/css">body {	background-color: #000033;	background-image: url(images/fine.gif);} p{	color:white; font-size:100px; font-family:Arial; text-align:center; font-weight: bold;}</style></head><body>'+myBody+'<a href="dueGiocatori.html"><div align="center"><img src="images/rigioca.png" /></a></div></body></html>';
	document.write(newContent);
	document.close();
}
