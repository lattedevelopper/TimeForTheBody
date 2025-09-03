export default async function handler(req, res) {
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
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    console.log('Environment check:', {
      shopId: !!shopId,
      secretKey: !!secretKey,
      shopIdType: typeof shopId,
      secretKeyType: typeof secretKey
    });

    if (!shopId || !secretKey) {
      return res.status(500).json({ 
        error: 'YooKassa credentials not configured',
        debug: { shopId: !!shopId, secretKey: !!secretKey }
      });
    }

    const { amount, return_url, description, metadata } = req.body;

    const paymentData = {
      amount: {
        value: amount.toString(),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: return_url
      },
      capture: true,
      description: description || 'Подарочный сертификат'
    };

    if (metadata) {
      paymentData.metadata = metadata;
    }

    const idempotenceKey = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

    console.log('Making request to YooKassa API...');

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();
    
    console.log('YooKassa response:', { status: response.status, result });

    if (!response.ok) {
      return res.status(response.status).json(result);
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ 
      error: `Server error: ${error.message}` 
    });
  }
}
