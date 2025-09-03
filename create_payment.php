<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

// Ваши данные из ЮKassa
$shop_id = '1149605';
$secret_key = 'live_lCR-0KMSgoyMj9f_VZLKbcQ3tuj20ms7ihckCQ5EMcM';

// Получаем данные от клиента
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    exit(json_encode(['error' => 'Invalid JSON']));
}

// Данные платежа
$payment_data = [
    'amount' => [
        'value' => $input['amount'],
        'currency' => 'RUB'
    ],
    'confirmation' => [
        'type' => 'redirect',
        'return_url' => $input['return_url']
    ],
    'capture' => true,
    'description' => $input['description'],
    'metadata' => $input['metadata'] ?? []
];

// Если нужен чек (для боевого режима)
if (isset($input['receipt'])) {
    $payment_data['receipt'] = $input['receipt'];
}

// Отправляем запрос к ЮKassa
$ch = curl_init('https://api.yookassa.ru/v3/payments');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payment_data));
curl_setopt($ch, CURLOPT_USERPWD, $shop_id . ':' . $secret_key);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Idempotence-Key: ' . uniqid('', true)
]);

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
