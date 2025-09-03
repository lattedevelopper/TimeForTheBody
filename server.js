const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('./')); // Сервируем статические файлы

// Ваши данные ЮKassa
const YOOKASSA_CONFIG = {
  shopId: '1149605',
  secretKey: 'live_lCR-0KMSgoyMj9f_VZLKbcQ3tuj20ms7ihckCQ5EMcM'
};

// Создание платежа
app.post('/api/create-payment', async (req, res) => {
  try {
    const idempotenceKey = Date.now().toString() + Math.random().toString(36).substring(7);
    
    const paymentData = {
      amount: req.body.amount,
      currency: 'RUB',
      confirmation: {
        type: 'embedded'
      },
      capture: true,
      description: req.body.description,
      metadata: req.body.metadata
    };

    const response = await axios.post('https://api.yookassa.ru/v3/payments', paymentData, {
      auth: {
        username: YOOKASSA_CONFIG.shopId,
        password: YOOKASSA_CONFIG.secretKey
      },
      headers: {
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Ошибка создания платежа:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Ошибка создания платежа',
      details: error.response?.data?.description || error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
