<?php

//Per inviare popup in PHP con javascript
function error($error,$link) {
        echo ("<script language='JavaScript'>
        window.alert('".$error."')
        window.location.href='".$link."';
        </script>");
}
/**
 * Mail
 * controllo solo la parte del parsing mail, non faccio test smtp
 */

//function messaggi errore -------------------------------

//ottengo inidirizzo ip
function IndirizzoIpReale(){
    $client  = @$_SERVER['HTTP_CLIENT_IP'];
    $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
    $remote  = $_SERVER['REMOTE_ADDR'];
    if(filter_var($client, FILTER_VALIDATE_IP)){
        $ip = $client;
    }
    elseif(filter_var($forward, FILTER_VALIDATE_IP)){
        $ip = $forward;
    }
    else {$ip = $remote;}
    return $ip;
}

//specifico variabili
$miaEmail = "mymail@mail.it"; //il mio indirizzo
$nome = $_POST["firstname"];
$cognome = $_POST["lastname"];
$mittente = $_POST["email"];
$oggetto = $_POST["object"];
$testo = $_POST["message"];
$sender = 'noreply@sitoaltervista.com';
$messaggio="Email inviata dal mio sito web.
		\r\n NOME: " . $nome . " " . $cognome .
       "\r\n OGGETTO: " . $oggetto .
	   "\r\n EMAIL: " . $mittente .
	   "\r\n \r\n\r\n" . $testo;


//controllo il recaptcha
if(isset($_POST['g-recaptcha-response'])){
  $captcha=$_POST['g-recaptcha-response'];
}
if(!$captcha){
  error("Please prove you are not a robot","index.php");
}

$secretKey = "6LefIi0UAAAAAAHkV12134567891232424";
$ip = $_SERVER['REMOTE_ADDR'];
$response=file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=".$secretKey."&response=".$captcha."&remoteip=".$ip);
$responseKeys = json_decode($response,true);
if(intval($responseKeys["success"]) !== 1) {
  error("Detected spam attempt","index.php");
}

//controllo che l'utente scriva i parametri giusti

elseif($nome == "")
	error("Insert your name","index.php");

elseif($mittente == "")
	error("Insert your email","index.php");

elseif($testo == "")
	error("Empty message","index.php");

else{
    
	//Indirizzo email valido
	mail($miaEmail, 'Email From Your Website', $messaggio, 'From:'.$sender."\r\n"); // invia email
    }

error("Email successfully sent","index.php");
//header("Location: index.php");

?>
