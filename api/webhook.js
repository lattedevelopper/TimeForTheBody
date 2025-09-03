// api/webhook.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const notification = req.body;
    console.log('Получено уведомление:', notification);

    // Здесь можно добавить дополнительную логику:
    // - Запись в базу данных
    // - Отправка дополнительных уведомлений
    // - Аналитика

    if (notification.event === 'payment.succeeded') {
      console.log('Платеж успешно завершен:', notification.object.id);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Ошибка webhook:', error);
    res.status(500).json({ error: 'Webhook error' });
  }
}
