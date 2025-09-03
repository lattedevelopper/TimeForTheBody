export default async function handler(req, res) {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  
  try {
    const auth = Buffer.from(shopId + ':' + secretKey).toString('base64');
    
    // Простой запрос к API для проверки аутентификации
    const response = await fetch('https://api.yookassa.ru/v3/me', {
      headers: {
        'Authorization': 'Basic ' + auth
      }
    });
    
    const result = await response.json();
    
    res.status(response.status).json({
      status: response.status,
      credentials_work: response.ok,
      response: result,
      debug: {
        shopId: !!shopId,
        secretKey: !!secretKey,
        shopIdLength: shopId?.length,
        secretKeyPrefix: secretKey?.substring(0, 10)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
