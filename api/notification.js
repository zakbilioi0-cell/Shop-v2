module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method tidak diizinkan');
  }

  const token = req.headers['x-callback-token'];
  if (process.env.XENDIT_WEBHOOK_TOKEN && token !== process.env.XENDIT_WEBHOOK_TOKEN) {
    return res.status(401).send('Token tidak valid');
  }

  const { external_id, status } = req.body;
  console.log(`Invoice ${external_id}: status=${status}`);

  if (status === 'PAID' || status === 'SETTLED') {
    console.log(`Pembayaran ${external_id} berhasil`);
  } else if (status === 'EXPIRED') {
    console.log(`Invoice ${external_id} kedaluwarsa`);
  }

  res.status(200).send('OK');
};
