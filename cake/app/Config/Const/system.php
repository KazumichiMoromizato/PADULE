<?php

if(env('HTTP_HOST') == 'www.padule.me' || env('HTTP_HOST') == 'padule.me') {
    define('DB_USER', 'root');
    define('DB_PASSWORD', '');
} else if(env('HTTP_HOST') == 'ec2-54-248-64-73.ap-northeast-1.compute.amazonaws.com' || env('HTTP_HOST') == 'ec2-54-248-64-73.ap-northeast-1.compute.amazonaws.com'){
    define('DB_USER', 'root');
    define('DB_PASSWORD', '');

} else {
    define('DB_USER', 'mokyu');
    define('DB_PASSWORD', '');
    Configure::write('debug', 2);

}