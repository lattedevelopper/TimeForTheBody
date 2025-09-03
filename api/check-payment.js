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
    const { payment_id } = req.body;

    if (!payment_id) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

    const response = await fetch(`https://api.yookassa.ru/v3/payments/${payment_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    const result = await response.json();
    res.status(response.status).json(result);

  } catch (error) {
    console.error('Payment check error:', error);
    res.status(500).json({ error: error.message });
  }
}
