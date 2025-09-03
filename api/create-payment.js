// api/create-payment.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ВАШИ РЕАЛЬНЫЕ ДАННЫЕ ИЗ ЛИЧНОГО КАБИНЕТА ЮKASSA
    const SHOP_ID = process.env.YOOKASSA_SHOP_ID || "1149605";
    const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY || "live_lCR-0KMSgoyMj9f_VZLKbcQ3tuj20ms7ihckCQ5EMcM";

    const idempotenceKey = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const paymentData = {
      amount: {
        value: req.body.amount.value,
        currency: req.body.amount.currency
      },
      confirmation: {
        type: "embedded"
      },
      capture: true,
      description: req.body.description,
      metadata: req.body.metadata || {}
    };

    console.log('Создаем платеж:', paymentData);

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64'),
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.description || 'Payment creation failed');
    }

    console.log('Платеж создан:', result);
    res.status(200).json(result);

  } catch (error) {
    console.error('Ошибка API:', error);
    res.status(500).json({ 
      error: 'Failed to create payment',
      message: error.message 
    });
  }
}
