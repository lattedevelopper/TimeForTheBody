// api/check-payment.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.query;
    
    const SHOP_ID = process.env.YOOKASSA_SHOP_ID || "ВАШ_SHOP_ID_СЮДА";
    const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY || "ВАШ_SECRET_KEY_СЮДА";

    const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64'),
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    res.status(200).json(result);

  } catch (error) {
    console.error('Ошибка проверки:', error);
    res.status(500).json({ error: 'Failed to check payment' });
  }
}
