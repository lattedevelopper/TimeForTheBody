// /api/check-payment.js
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

    if (!shopId || !secretKey) {
      return res.status(500).json({ 
        error: 'YooKassa credentials not configured' 
      });
    }

    const { payment_id } = req.body;

    if (!payment_id) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    // Запрашиваем информацию о платеже
    const response = await fetch(`https://api.yookassa.ru/v3/payments/${payment_id}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(shopId + ':' + secretKey).toString('base64')
      }
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(result);
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('Payment check error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message 
    });
  }
}
