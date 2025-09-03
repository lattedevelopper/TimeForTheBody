// /api/create-payment.js
export default async function handler(req, res) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ВАЖНО: Добавьте эти переменные в Environment Variables в Vercel
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      return res.status(500).json({ 
        error: 'YooKassa credentials not configured' 
      });
    }

    const { amount, return_url, description, metadata, receipt } = req.body;

    if (!amount || !return_url || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, return_url, description' 
      });
    }

    // Подготавливаем данные для ЮKassa
    const paymentData = {
      amount: {
        value: amount,
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: return_url
      },
      capture: true,
      description: description
    };

    if (metadata) paymentData.metadata = metadata;
    if (receipt) paymentData.receipt = receipt;

    // Создаем уникальный ключ идемпотентности
    const idempotenceKey = Date.now() + '-' + Math.random().toString(36);

    // Отправляем запрос к ЮKassa
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        'Authorization': 'Basic ' + Buffer.from(shopId + ':' + secretKey).toString('base64')
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('YooKassa error:', result);
      return res.status(response.status).json(result);
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message 
    });
  }
}
