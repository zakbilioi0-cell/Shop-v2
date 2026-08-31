const { PRODUCTS } = require('./products');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  try {
    const { items, customer } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Keranjang masih kosong' });
    }

    let amount = 0;
    const itemDetails = items.map((item) => {
      const product = PRODUCTS[item.id];
      if (!product) throw new Error(`Produk tidak ditemukan: ${item.id}`);
      amount += product.price * item.qty;
      return { name: product.name, quantity: item.qty, price: product.price };
    });

    const external_id = `KN-${Date.now()}`;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';

    const xenditRes = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${process.env.XENDIT_SECRET_KEY}:`).toString('base64'),
      },
      body: JSON.stringify({
        external_id,
        amount,
        payer_email: customer?.email || 'guest@example.com',
        description: `Pesanan Kopi Nusantara - ${external_id}`,
        customer: {
          given_names: customer?.name || 'Pelanggan',
          email: customer?.email || 'guest@example.com',
          mobile_number: customer?.phone || '',
        },
        items: itemDetails,
        success_redirect_url: `${protocol}://${host}/?status=success`,
        failure_redirect_url: `${protocol}://${host}/?status=failed`,
      }),
    });

    const invoice = await xenditRes.json();

    if (!xenditRes.ok) {
      throw new Error(invoice.message || 'Gagal membuat invoice Xendit');
    }

    res.status(200).json({ invoice_url: invoice.invoice_url, external_id });
  } catch (err) {
    console.error('Checkout error:', err.message);
    res.status(500).json({ error: err.message || 'Gagal membuat transaksi' });
  }
};
