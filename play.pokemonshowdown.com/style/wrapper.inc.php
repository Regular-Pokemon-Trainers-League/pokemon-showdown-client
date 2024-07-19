<?php

include_once __DIR__ . '/../../config/config.inc.php';

function curPage($thisPage) {
	global $page;
	if ($page === $thisPage) echo ' cur';
}
function classCurPage($thisPage) {
	global $page;
	if ($page === $thisPage) echo ' class="cur"';
}

function includeHeaderTop() {
	global $page, $pageTitle, $headerData;
?>
<!DOCTYPE html>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />

<title><?= $pageTitle ?> - Pok&eacute;mon Showdown!</title>

<link rel="stylesheet" href="/style/global.css?v14" />
<?php
}

function includeHeaderBottom() {
	global $page, $pageTitle, $headerData, $psconfig;
?>
<div class="body">

	<header>
		<div class="nav-wrapper"><ul class="nav">
			<li><a class="button nav-first" href="/"><img src="/rptl_home_logo_wide.svg" srcset="/rptl_home_logo_wide.svg 1x, /rptl_home_logo_wide.svg 2x" alt="Pok&eacute;mon Showdown" width="146" height="44" /> Home</a></li>
			<li><a class="button" href="/dex/">Pok&eacute;dex</a></li>
			<li><a class="button" href="//replay.rptl.us/">Replays</a></li>
			<li><a class="button" href="/ladder/">Ladder</a></li>
			<li><a class="button nav-last" href="/forums/">Forum</a></li>
			<li><a class="button greenbutton nav-first nav-last" href="//rptl.us/">Play</a></li>
		</ul></div>
	</header>

	<div class="main"><section class="section">

<?php
}

function includeHeader() {
	global $page, $pageTitle, $headerData, $psconfig;
	includeHeaderTop();
	includeHeaderBottom();
}

function includeFooter() {
?>

	</section></div>
</div>

<footer>
	<p>
		<small><a href="/rules">Rules</a> | <a href="/privacy">Privacy policy</a> | <a href="/credits"<?php classCurPage('credits') ?>>Credits</a> | <a href="/contact">Contact</a></small>
	</p>
</footer>
<?php
}
