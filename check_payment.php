<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$shop_id = '1149605';
$secret_key = 'live_lCR-0KMSgoyMj9f_VZLKbcQ3tuj20ms7ihckCQ5EMcM';

$input = json_decode(file_get_contents('php://input'), true);
$payment_id = $input['payment_id'];

$ch = curl_init('https://api.yookassa.ru/v3/payments/' . $payment_id);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, $shop_id . ':' . $secret_key);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 200) {
    echo $response;
} else {
    http_response_code($http_code);
    echo $response;
}
?>
