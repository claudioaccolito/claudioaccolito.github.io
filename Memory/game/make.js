//inserisco le immagini nel mio array
//cartaCoperta 'images/myIcon.png';
var myArray = ['images/aquila.jpg','images/balena.jpg','images/cane.jpg','images/cavallo.jpg','images/coccinella.jpg','images/coniglio.jpg','images/farfalla.jpg','images/gallina.jpg','images/gatto.jpg','images/giraffa.jpg','images/leone.jpg','images/orso.jpg','images/panda.jpg','images/pappagallo.jpg','images/pinguino.jpg','images/scimmia.jpg','images/tigre.jpg','images/zebra.jpg'];

//funz random che serve per ordinare casualmente un array poi, dopo aver riempito l'array, con myArray.sort(randomFunct);   
function randomFunct() {  
    return 0.5 - Math.round(Math.random());  
}  

//riempo doppiamente l'array con le 18 immagini fino a im[18] e poi di nuovo fino a im[36]
function addImages() {
	for (var i=0; i<18; i++) {					
		myArray[i+18] = myArray[i];
	} 
	//le ordino in modo casuale
	myArray.sort(randomFunct);
}

var r = 6;
var c = 6;
//genero automaticamente la tabella con le carte coperte
function addCarte() {
	var myClass="";
	if (r==4)
		myClass="netbook";
	else if (r==9)
		myClass="smartphone";
	else
		myClass="pc";
	var myStr = '<table border="0">';
	var k = 0;
	var mouseMano = '<a class="menu_links" onmouseover="" style="cursor: pointer;">'
	for (var i=0; i<(r); i++) {
		myStr = myStr + "<tr>";
		for (var j=0; j<(c); j++) {
			myStr = myStr + '<td onClick="giraCarta('+k+');">'+ mouseMano +'<img src="images/myIcon.png" id="'+k+'" class="'+myClass+'" \/></a></td>';
			k++;
		}
		myStr = myStr + "</tr>";
	}
	myStr = myStr + "</table>"
	document.getElementById("myTable").innerHTML = myStr;
}

function schermo() {
var w = screen.width;
var h = screen.height;
	if (w > 1070 && h > 700)	//default r=c=6
		alert("device is detected as pc\nResolution: "+w+" x "+h);		
	else if (w > 900 && h > 500){ //netbook
		alert("device is detected as netbook/tablet\nResolution: "+w+" x "+h);
    	r = 4;
		c = 9;
	}
	else{ //smartphone
	alert("device is detected as smartphone\nResolution: "+w+" x "+h);	
    	r = 9;
		c = 4;
	}
}

var contClick = 0;
var image1 = -5;
var image2 = -10;
var player = 1;
var okScopri = true;

function giraCarta(k) {
	if (okScopri){
		document.getElementById(k).src = myArray[k];	//mostra carta
		contClick++;
		if(contClick==1)
			image1 = k;
		else if(contClick==2)
			image2 = k;
		//inibisco click sulla stessa carta e click su carta già "vinta"
		if(image1==image2 || myArray[image1]=="images/ok.png" || myArray[image2]=="images/ok.png")	
			{contClick--;}	
		else if (contClick==2)
			result(image1,image2);
	}
	//PER IL DEBUG:document.getElementById("header").innerHTML = "Click " + contClick  + " a=" + image1  + " b=" + image2;
}

function start() {
	schermo();
	addImages();
	addCarte();
}

function home() {
	var r = confirm("Are you sure? All data will be lost");
	if (r == true)
		window.location.replace("../index.html");
	else{}
}
