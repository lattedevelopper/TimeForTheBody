<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Проверяем что это POST запрос
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ВАЖНО: Замените на ваши реальные ключи из ЮKassa
$shop_id = '1149605';      // Например: 123456
$secret_key = 'live_lCR-0KMSgoyMj9f_VZLKbcQ3tuj20ms7ihckCQ5EMcM'; // Например: live_xxxxx или test_xxxxx

// Получаем данные от клиента
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Подготавливаем данные для ЮKassa
$payment_data = [
    'amount' => [
        'value' => $data['amount'],
        'currency' => 'RUB'
    ],
    'confirmation' => [
        'type' => 'redirect',
        'return_url' => $data['return_url']
    ],
    'capture' => true,
    'description' => $data['description']
];

// Добавляем метаданные если есть
if (isset($data['metadata'])) {
    $payment_data['metadata'] = $data['metadata'];
}

// Добавляем чек если есть (для боевого режима)
if (isset($data['receipt'])) {
    $payment_data['receipt'] = $data['receipt'];
}

// Отправляем запрос к ЮKassa API
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
$error = curl_error($ch);
curl_close($ch);

// Обработка ошибок cURL
if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'cURL error: ' . $error]);
    exit;
}

// Возвращаем ответ от ЮKassa
http_response_code($http_code);
echo $response;
?>
