// api/create-payment.js
export default async function handler(req, res) {
  console.log('🚀 Получен запрос на создание платежа');
  
  if (req.method !== 'POST') {
    console.log('❌ Неверный метод:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Проверяем ключи
    const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
    const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

    console.log('🔑 Проверка ключей...');
    console.log('SHOP_ID установлен:', !!SHOP_ID);
    console.log('SECRET_KEY установлен:', !!SECRET_KEY);

    if (!SHOP_ID || !SECRET_KEY) {
      console.error('❌ Ключи ЮKassa не настроены');
      return res.status(500).json({ 
        error: 'YooKassa credentials not configured',
        message: 'Обратитесь к администратору - не настроены ключи оплаты'
      });
    }

    // Генерируем идемпотентный ключ
    const idempotenceKey = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log('🔑 Идемпотентный ключ:', idempotenceKey);

    // Подготавливаем данные
    const paymentData = {
      amount: req.body.amount,
      confirmation: req.body.confirmation,
      capture: req.body.capture || true,
      description: req.body.description,
      metadata: req.body.metadata || {}
    };

    console.log('📦 Данные для ЮKassa:', JSON.stringify(paymentData, null, 2));

    // Отправляем запрос к ЮKassa
    const yookassaResponse = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64'),
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    console.log('📡 Статус ответа ЮKassa:', yookassaResponse.status);
    console.log('📡 Headers ответа ЮKassa:', yookassaResponse.headers);

    const responseText = await yookassaResponse.text();
    console.log('📡 Сырой ответ ЮKassa:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Ошибка парсинга ответа ЮKassa:', parseError);
      return res.status(500).json({
        error: 'Invalid response from YooKassa',
        message: 'Получен некорректный ответ от системы оплаты'
      });
    }

    if (!yookassaResponse.ok) {
      console.error('❌ Ошибка ЮKassa:', result);
      return res.status(yookassaResponse.status).json({
        error: 'YooKassa API error',
        message: result.description || result.error_description || 'Ошибка системы оплаты',
        details: result
      });
    }

    console.log('✅ Успешный ответ ЮKassa:', JSON.stringify(result, null, 2));
    
    // Проверяем наличие обязательных полей
    if (!result.confirmation) {
      console.error('❌ В ответе нет confirmation');
      return res.status(500).json({
        error: 'Missing confirmation in response',
        message: 'Не получен URL для оплаты'
      });
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Критическая ошибка в API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
