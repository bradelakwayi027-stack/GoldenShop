// Frontend helper for interacting with backend API
const API_URL = window.API_URL || 'http://localhost:5000';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function register(payload) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.token) localStorage.setItem('token', data.token);
  return data;
}

async function createShop(name) {
  const res = await fetch(`${API_URL}/api/shops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

async function getShops() {
  const res = await fetch(`${API_URL}/api/shops`, { headers: authHeader() });
  return res.json();
}

async function getPendingShops() {
  const res = await fetch(`${API_URL}/api/shops/pending`, { headers: authHeader() });
  return res.json();
}

async function approveShop(id) {
  const res = await fetch(`${API_URL}/api/shops/${id}/approve`, {
    method: 'PUT',
    headers: { ...authHeader() },
  });
  return res.json();
}

async function deleteShop(id) {
  const res = await fetch(`${API_URL}/api/shops/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  });
  return res.json();
}

async function createOrder(payload) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// Vendor: products and orders
async function createProduct(payload) {
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function getProductsByShop(shopId) {
  const res = await fetch(`${API_URL}/api/products/shop/${shopId}`);
  return res.json();
}

async function getMyProducts() {
  const res = await fetch(`${API_URL}/api/products/my`, { headers: authHeader() });
  return res.json();
}

async function updateProduct(id, payload) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  });
  return res.json();
}

async function getVendorOrders() {
  const res = await fetch(`${API_URL}/api/orders/vendor`, { headers: authHeader() });
  return res.json();
}

// Admin helpers
async function getUsers() {
  const res = await fetch(`${API_URL}/api/users`, { headers: authHeader() });
  return res.json();
}

async function getAllOrders() {
  const res = await fetch(`${API_URL}/api/orders/admin`, { headers: authHeader() });
  return res.json();
}

// Small helpers for admin page
async function loadPendingShopsToTable(tableId) {
  const rows = await getPendingShops();
  const tbody = document.querySelector(tableId + ' tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  rows.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.owner?.name || ''}</td>
      <td>${s.owner?.email || ''}</td>
      <td>
        <button data-id="${s._id}" class="btn_valider">Valider</button>
        <button data-id="${s._id}" class="btn_refuser">Refuser</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.btn_valider').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      await approveShop(id);
      await loadPendingShopsToTable(tableId);
    });
  });

  document.querySelectorAll('.btn_refuser').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      await deleteShop(id);
      await loadPendingShopsToTable(tableId);
    });
  });
}

// Export for simple usage in inline scripts
window.ECOM = { register, login, createShop, getShops, createOrder, loadPendingShopsToTable, approveShop, deleteShop,
  createProduct, getProductsByShop, getMyProducts, updateProduct, deleteProduct, getVendorOrders,
  getUsers, getAllOrders };
