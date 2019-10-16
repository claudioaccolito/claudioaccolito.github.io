var si = "<img src=../img/si.png width=15 height=15 >";
var no = "<img src=../img/no.png width=15 height=15 >";

function validateEmail(email){ 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;		//powered by stackoverflow.com
    return re.test(email);
} 

/*-----------------------------------------------------REGISTRAZIONE*/


function checkEmail(){
	var email=document.modulo.email.value;
    var box=document.getElementsByName("email")[0];

	if(validateEmail(email))
		document.getElementById('emailCheck').innerHTML=si;
	else 
		document.getElementById('emailCheck').innerHTML=no;
}

function checkNome() {
	var nome=document.modulo.firstname.value;
    var box=document.getElementsByName("firstname")[0];

	if(nome.length==0)
		document.getElementById('nomeCheck').innerHTML=no;
	else 
		document.getElementById('nomeCheck').innerHTML=si;
}

function checkCognome() {
	var cognome=document.modulo.lastname.value;
    var box=document.getElementsByName("lastname")[0];

	if(cognome.length==0)
		document.getElementById('cognomeCheck').innerHTML=no;
	else 
		document.getElementById('cognomeCheck').innerHTML=si;
}

function checkOggetto() {
	var oggetto=document.modulo.object.value;
    var box=document.getElementsByName("object")[0];

	if(oggetto.length==0)
		document.getElementById('oggettoCheck').innerHTML=no;
	else 
		document.getElementById('oggettoCheck').innerHTML=si;
}

function checkMess() {
	var messaggio=document.modulo.message.value;
    var box=document.getElementsByName("message")[0];

	if(messaggio.length==0)
		document.getElementById('messCheck').innerHTML=no;
	else 
		document.getElementById('messCheck').innerHTML=si;
}


//richiamo le funzioni ricorsivamente nei campi di testo precedenti
function onCognome(){ checkNome(); }

function onEmail(){ onCognome(); checkCognome(); }

function onOggetto(){ onEmail(); checkEmail(); }

function onMess(){ onOggetto(); checkOggetto(); }