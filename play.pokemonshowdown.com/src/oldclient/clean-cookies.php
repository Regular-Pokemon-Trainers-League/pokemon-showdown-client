<?php

error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

$cleaned = false;

foreach ($_COOKIE as $name => $value) {
	if (strlen($value) > 3000) {
		setcookie($name, '', time()-1000, '/', 'rptl.us');
		setcookie($name, '', time()-1000, '/', '.rptl.us');
		setcookie($name, '', time()-1000, '/', 'rptl.us');
		setcookie($name, '', time()-1000, '/', '.rptl.us');
		$cleaned = true;
	}
}

if ($cleaned) {
	echo 'alert("You had a cookie which was too big to handle and had to be deleted. If you had cookie settings, they may have been deleted.")';
}
