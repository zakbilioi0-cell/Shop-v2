let PRODUCTS = {};
let cart = {}; // { productId: qty }

const rupiah = (n) => 'Rp ' + n.toLocaleString('id-ID');

async function init() {
  const res = await fetch('/api/products');
  PRODUCTS = await res.json();
  renderProducts();
}

function renderProducts() {
  const list = document.getElementById('productList');
  list.innerHTML = '';

  Object.entries(PRODUCTS).forEach(([id, p]) => {
    const row = document.createElement('div');
    row.className = 'product-row';
    row.innerHTML = `
      <div>
        <div class="product-name">${p.name}</div>
        <div class="product-origin">${p.origin}</div>
      </div>
      <div class="product-note">${p.note}</div>
      <div class="product-price">${rupiah(p.price)}</div>
      <div class="qty-add">
        <input type="number" class="qty-input" id="qty-${id}" value="1" min="1" />
        <button class="btn-add" data-id="${id}">Tambah</button>
      </div>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll('.btn-add').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const qtyInput = document.getElementById(`qty-${id}`);
      const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      cart[id] = (cart[id] || 0) + qty;
      renderCart();
      openCart();
    });
  });
}

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const countEl = document.getElementById('cartCount');
  const entries = Object.entries(cart);

  countEl.textContent = entries.reduce((sum, [, qty]) => sum + qty, 0);

  if (!entries.length) {
    itemsEl.innerHTML = '<p class="cart-empty">Keranjang masih kosong.</p>';
    totalEl.textContent = rupiah(0);
    return;
  }

  let total = 0;
  itemsEl.innerHTML = entries.map(([id, qty]) => {
    const p = PRODUCTS[id];
    const subtotal = p.price * qty;
    total += subtotal;
    return `
      <div class="cart-item">
        <div>
          <div>${p.name} × ${qty}</div>
          <button class="cart-item-remove" data-id="${id}">Hapus</button>
        </div>
        <div>${rupiah(subtotal)}</div>
      </div>
    `;
  }).join('');
  totalEl.textContent = rupiah(total);

  itemsEl.querySelectorAll('.cart-item-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      delete cart[btn.dataset.id];
      renderCart();
    });
  });
}

function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

async function handleCheckout(e) {
  e.preventDefault();
  const statusEl = document.getElementById('checkoutStatus');
  const btn = document.getElementById('checkoutBtn');
  const entries = Object.entries(cart);

  if (!entries.length) {
    statusEl.textContent = 'Tambahkan produk ke keranjang dulu.';
    return;
  }

  const items = entries.map(([id, qty]) => ({ id, qty }));
  const customer = {
    name: document.getElementById('custName').value,
    email: document.getElementById('custEmail').value,
    phone: document.getElementById('custPhone').value,
  };

  btn.disabled = true;
  statusEl.textContent = 'Menyiapkan pembayaran...';

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, customer }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Gagal membuat transaksi');

    statusEl.textContent = 'Mengalihkan ke halaman pembayaran...';
    window.location.href = data.invoice_url;
  } catch (err) {
    statusEl.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
}

document.getElementById('cartToggle').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
document.getElementById('cartOverlay').addEventListener('click', closeCart);
document.getElementById('customerForm').addEventListener('submit', handleCheckout);

init();
