<?php

$input = $_POST["export"];

header("Content-Type: application/json; charset=UTF-8"); 

$now = time();
$filename_now = date('Y-m-d_H-i-s', $now);
$filename = "gstart_settings_".$filename_now.".json"; 
header("Content-Disposition: attachment; filename=\"$filename\"");

echo $input;

exit;
?>
