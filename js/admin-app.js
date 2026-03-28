// Estado global
const CONFIG = {
    PINS: {
        admin: '1234',
        hieleras: '1111',
        repartidor: '2222',
        caja: '3333'
    },
    ROLES: {
        admin: { name: 'Administrador', permissions: ['all'] },
        hieleras: { name: 'Hieleras', permissions: ['hieleras', 'dashboard'] },
        repartidor: { name: 'Repartidor', permissions: ['reparto', 'dashboard'] },
        caja: { name: 'Cajero', permissions: ['tienda', 'pedidos'] }
    }
};

let state = {
    currentUser: null,
    currentRole: 'admin',
    pin: '',
    cart: [],
    orders: [],
    products: [
        { id: 1, name: 'Cerveza Modelo Especial', price: 35, category: 'cerveza', stock: 50, icon: '🍺', image: 'modelo.png' },
        { id: 2, name: 'Cerveza Corona', price: 32, category: 'cerveza', stock: 45, icon: '🍺', image: 'corona.png' },
        { id: 3, name: 'Cerveza Victoria', price: 30, category: 'cerveza', stock: 30, icon: '🍺', image: 'victoria.png' },
        { id: 4, name: 'Cerveza Indio', price: 32, category: 'cerveza', stock: 25, icon: '🍺', image: 'indio.png' },
        { id: 5, name: 'Cerveza XX Lager', price: 34, category: 'cerveza', stock: 40, icon: '🍺', image: 'xx.png' },
        { id: 6, name: 'Cerveza Tecate', price: 28, category: 'cerveza', stock: 30, icon: '🍺', image: 'tecate.png' },
        { id: 7, name: 'Cerveza Sol', price: 29, category: 'cerveza', stock: 30, icon: '🍺', image: 'sol.png' },
        { id: 8, name: 'Botana Mixta', price: 50, category: 'botana', stock: 20, icon: '🥜', image: 'botana.png' },
        { id: 9, name: 'Papas Sabritas', price: 35, category: 'botana', stock: 30, icon: '🥔', image: 'papas.png' },
        { id: 10, name: 'Cacahuates Japonés', price: 25, category: 'botana', stock: 50, icon: '🥜', image: 'cacahuates.png' },
        { id: 11, name: 'Hielo 5kg', price: 40, category: 'otros', stock: 15, icon: '🧊', image: 'hielo.png' },
        { id: 12, name: 'Coca Cola 2L', price: 28, category: 'otros', stock: 35, icon: '🥤', image: 'refresco.png' },
        { id: 13, name: 'Six Pack Modelo', price: 180, category: 'cerveza', stock: 12, icon: '📦', image: 'sixpackmodelo.png' },
        { id: 14, name: 'Cubeta 12 Modelo', price: 350, category: 'cerveza', stock: 8, icon: '🪣', image: 'cubeta12modelo.png' }
    ],
    soundEnabled: true,
    theme: 'dark'
};

// Funciones de inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    setInterval(updateDate, 60000);
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') toggleTheme();
    loadOrdersFromApi();
    setInterval(loadOrdersFromApi, 2000);
});

async function loadOrdersFromApi() {
    try {
        const api = DEPTO_API();
        const response = await api.get('?action=pedidos');
        state.orders = Array.isArray(response.data) ? response.data : [];
    } catch (_) {}
    syncBadges();
    updateStats();
    renderRecentOrders();
    renderAllOrders();
    renderKitchenOrders();
    renderDeliveryOrders();
}

function syncBadges() {
    const pending = state.orders.filter(o => o.estado === 'nuevo' || o.estado === 'aceptado' || o.estado === 'en_hieleras').length;
    const hieleras = state.orders.filter(o => o.estado === 'aceptado' || o.estado === 'en_hieleras').length;
    const ordersBadge = document.getElementById('ordersBadge');
    const kitchenBadge = document.getElementById('kitchenBadge');
    if (ordersBadge) ordersBadge.textContent = pending;
    if (kitchenBadge) kitchenBadge.textContent = hieleras;
}

function DEPTO_API() {
    return window.DEPOSITO_API || {
        get: async () => ({ ok: true, data: [] })
    };
}

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElem = document.getElementById('currentDate');
    if (dateElem) dateElem.textContent = now.toLocaleDateString('es-ES', options);
}

function updateStats() {
    const totalSales = state.orders.reduce((sum, o) => o.status === 'delivered' ? sum + o.total : sum, 0);
    const totalOrders = state.orders.length;
    const ventasElem = document.getElementById('totalVentas');
    const pedidosElem = document.getElementById('totalPedidos');
    if (ventasElem) ventasElem.textContent = `$${totalSales.toLocaleString()}`;
    if (pedidosElem) pedidosElem.textContent = totalOrders;
    generateSalesChart();
}

function generateSalesChart() {
    const chart = document.getElementById('salesChart');
    if (!chart) return;
    chart.innerHTML = '';
    const hours = ['8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'];
    hours.forEach(hour => {
        const height = Math.random() * 60 + 20;
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = height + '%';
        bar.dataset.value = `$${Math.floor(height * 10)}`;
        chart.appendChild(bar);
    });
}

function renderRecentOrders() {
    const container = document.getElementById('recentOrders');
    if (!container) return;
    const recent = state.orders.slice(0, 5);
    container.innerHTML = recent.map(order => createOrderCard(order)).join('');
}

function createOrderCard(order) {
    const statusClasses = { pending: 'pending', preparing: 'preparing', ready: 'ready', delivered: 'delivered' };
    const statusLabels = { pending: 'Pendiente', preparing: 'En preparación', ready: 'Listo', delivered: 'Entregado' };
    return `
        <div class="order-card ${statusClasses[order.status]}">
            <div class="order-header">
                <div>
                    <div class="order-id">#${order.id}</div>
                    <div class="order-time">${order.time}</div>
                </div>
                <span class="status-badge ${statusClasses[order.status]}">${statusLabels[order.status]}</span>
            </div>
            <div class="order-customer">
                <i class="fas fa-user"></i> ${order.customer} • ${order.phone}
            </div>
            <div class="order-products">
                ${order.products.map(p => `${p.qty}x ${p.name}`).join(', ')}
            </div>
            <div class="order-footer">
                <div class="order-total">$${order.total}</div>
                ${order.status !== 'delivered' ? `<div class="order-actions">${getOrderActions(order)}</div>` : ''}
            </div>
        </div>
    `;
}

function getOrderActions(order) {
    if (order.status === 'pending') {
        return `<button class="btn btn-small btn-primary" onclick="updateOrderStatus(${order.id}, 'preparing')">Preparar</button>`;
    } else if (order.status === 'preparing') {
        return `<button class="btn btn-small btn-success" onclick="updateOrderStatus(${order.id}, 'ready')">Listo</button>`;
    } else if (order.status === 'ready') {
        return `<button class="btn btn-small btn-primary" onclick="updateOrderStatus(${order.id}, 'delivered')">Entregar</button>`;
    }
    return '';
}

function updateOrderStatus(orderId, newStatus) {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        showToast(`Pedido #${orderId} actualizado a: ${newStatus}`, 'success');
        playSound('notification');
        renderRecentOrders();
        renderAllOrders();
        updateStats();
        renderKitchenOrders();
        renderDeliveryOrders();
    }
}

function renderAllOrders() {
    const container = document.getElementById('allOrdersList');
    if (!container) return;
    container.innerHTML = state.orders.map(order => createOrderCard(order)).join('');
}

function filterOrders(filter) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    const container = document.getElementById('allOrdersList');
    if (!container) return;
    let filtered = state.orders;
    if (filter !== 'all') filtered = state.orders.filter(o => o.status === filter);
    container.innerHTML = filtered.map(order => createOrderCard(order)).join('');
}

// Tienda
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = state.products.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                <img src="assets/images/${product.image || ''}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="image-fallback" style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:60px;">${product.icon}</div>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price}</div>
                <div class="product-stock">Stock: ${product.stock} unidades</div>
                <button class="btn-add" onclick="addToCart(${product.id})">
                    <i class="fas fa-plus"></i> Agregar
                </button>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const search = document.getElementById('searchProduct')?.value.toLowerCase() || '';
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
        card.style.display = name.includes(search) ? 'block' : 'none';
    });
}

function filterCategory(category) {
    if (event && event.target) {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        event.target.classList.add('active');
    }
    document.querySelectorAll('.product-card').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    const existing = state.cart.find(item => item.id === productId);
    if (existing) existing.qty++;
    else state.cart.push({ ...product, qty: 1 });
    updateCart();
    playSound('click');
    showToast(`${product.name} agregado al carrito`, 'success');
}

function updateCart() {
    const container = document.getElementById('cartItems');
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = state.cart.reduce((sum, item) => sum + item.qty, 0);
    if (!container) return;
    if (state.cart.length === 0) {
        container.innerHTML = '<p class="text-center" style="opacity: 0.5; padding: 40px 0;">El carrito está vacío</p>';
    } else {
        container.innerHTML = state.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="assets/images/${item.image || ''}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="image-fallback" style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:2rem;">${item.icon}</div>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price * item.qty}</div>
                </div>
                <div class="quantity-control">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
                <button class="btn-icon" style="width: 30px; height: 30px; color: var(--danger);" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }
    updateCartTotals();
}

function updateQty(productId, delta) {
    const item = state.cart.find(i => i.id === productId);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) removeFromCart(productId);
        else updateCart();
    }
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(i => i.id !== productId);
    updateCart();
    playSound('click');
}

function clearCart() {
    state.cart = [];
    updateCart();
    showToast('Carrito vaciado', 'warning');
}

function updateCartTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const subtotalElem = document.getElementById('subtotal');
    const cartTotalElem = document.getElementById('cartTotal');
    if (subtotalElem) subtotalElem.textContent = `$${subtotal}`;
    if (cartTotalElem) cartTotalElem.textContent = `$${subtotal + 50}`;
}

function openCheckout() {
    if (state.cart.length === 0) {
        showToast('El carrito está vacío', 'error');
        return;
    }
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const subtotalElem = document.getElementById('checkoutSubtotal');
    const totalElem = document.getElementById('checkoutTotal');
    if (subtotalElem) subtotalElem.textContent = `$${subtotal}`;
    if (totalElem) totalElem.textContent = `$${subtotal + 50}`;
    document.getElementById('checkoutModal').classList.add('active');
}

function applyDiscount() {
    const code = document.getElementById('discountCode')?.value.toUpperCase() || '';
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let discount = 0;
    if (code === 'COMPA10') discount = subtotal * 0.10;
    else if (code === 'COMPA20') discount = subtotal * 0.20;
    const discountElem = document.getElementById('checkoutDiscount');
    const totalElem = document.getElementById('checkoutTotal');
    if (discountElem) discountElem.textContent = `-$${discount}`;
    if (totalElem) totalElem.textContent = `$${subtotal + 50 - discount}`;
    if (discount > 0) showToast('Descuento aplicado', 'success');
}

function processOrder(e) {
    e.preventDefault();
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = parseFloat(document.getElementById('checkoutDiscount')?.textContent.replace('-$', '')) || 0;
    const total = subtotal + 50 - discount;
    const newOrder = {
        id: 100 + state.orders.length + 1,
        customer: document.getElementById('customerName')?.value || '',
        phone: document.getElementById('customerPhone')?.value || '',
        address: document.getElementById('customerAddress')?.value || '',
        products: state.cart.map(i => ({ name: i.name, qty: i.qty })),
        total: total,
        status: 'pending',
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        payment: document.getElementById('paymentMethod')?.value || 'efectivo'
    };
    state.orders.unshift(newOrder);
    // Mostrar ticket
    const ticketNumber = document.getElementById('ticketNumber');
    const ticketDate = document.getElementById('ticketDate');
    const ticketItems = document.getElementById('ticketItems');
    const ticketTotal = document.getElementById('ticketTotal');
    if (ticketNumber) ticketNumber.textContent = newOrder.id;
    if (ticketDate) ticketDate.textContent = new Date().toLocaleString();
    if (ticketItems) {
        ticketItems.innerHTML = state.cart.map(i => `
            <div class="ticket-item">
                <span>${i.qty}x ${i.name}</span>
                <span>$${i.price * i.qty}</span>
            </div>
        `).join('');
    }
    if (ticketTotal) ticketTotal.textContent = `$${total}`;
    const ticketPreview = document.getElementById('ticketPreview');
    if (ticketPreview) ticketPreview.style.display = 'block';
    // Limpiar carrito
    state.cart = [];
    updateCart();
    playSound('success');
    showToast('¡Pedido realizado con éxito!', 'success');
    setTimeout(() => {
        closeModal('checkoutModal');
        if (ticketPreview) ticketPreview.style.display = 'none';
        const form = document.getElementById('checkoutForm');
        if (form) form.reset();
        showSection('pedidos');
    }, 3000);
}

// Cocina
function renderKitchenOrders() {
    const container = document.getElementById('kitchenOrders');
    if (!container) return;
    const kitchenOrders = state.orders.filter(o => o.status === 'pending' || o.status === 'preparing');
    if (kitchenOrders.length === 0) {
        container.innerHTML = '<p class="text-center" style="padding: 40px; opacity: 0.5;">No hay pedidos en hieleras</p>';
    } else {
        container.innerHTML = kitchenOrders.map(order => `
            <div class="order-card ${order.status}">
                <div class="order-header">
                    <div class="order-id">#${order.id}</div>
                    <div class="order-time">${order.time}</div>
                </div>
                <div class="order-products" style="font-size: 1.1rem; padding: 15px;">
                    ${order.products.map(p => `<div>• ${p.qty}x ${p.name}</div>`).join('')}
                </div>
                <div class="order-actions">
                    ${order.status === 'pending' ? 
                        `<button class="btn btn-primary" onclick="updateOrderStatus(${order.id}, 'preparing')">Comenzar</button>` :
                        `<button class="btn btn-success" onclick="updateOrderStatus(${order.id}, 'ready')">Terminado</button>`
                    }
                </div>
            </div>
        `).join('');
    }
}

// Reparto
function renderDeliveryOrders() {
    const container = document.getElementById('deliveryOrders');
    if (!container) return;
    const deliveryOrders = state.orders.filter(o => o.status === 'ready');
    container.innerHTML = deliveryOrders.map(order => `
        <div class="order-card ready">
            <div class="order-header">
                <div class="order-id">#${order.id}</div>
                <span class="status-badge ready">Listo</span>
            </div>
            <div class="order-customer">
                <i class="fas fa-user"></i> ${order.customer}<br>
                <i class="fas fa-phone"></i> ${order.phone}
            </div>
            <div style="background: var(--dark-lighter); padding: 10px; border-radius: 8px; margin: 10px 0; font-size: 0.9rem;">
                <i class="fas fa-map-marker-alt"></i> ${order.address}
            </div>
            <button class="btn btn-primary" style="width: 100%;" onclick="updateOrderStatus(${order.id}, 'delivered')">
                <i class="fas fa-check"></i> Marcar Entregado
            </button>
        </div>
    `).join('');
}

// Inventario
function renderInventory() {
    const tbody = document.getElementById('inventoryTable');
    if (!tbody) return;
    tbody.innerHTML = state.products.map(p => `
        <tr style="border-bottom: 1px solid var(--glass-border);">
            <td style="padding: 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="assets/images/${p.image || ''}" width="40" height="40" style="object-fit: contain; border-radius: 8px; background: var(--dark);" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="image-fallback" style="display:none;align-items:center;justify-content:center;width:40px;height:40px;border-radius:8px;background:var(--dark);font-size:1.2rem;">${p.icon}</div>
                    <span>${p.name}</span>
                </div>
            </td>
            <td style="padding: 15px;">
                <span style="${p.stock < 20 ? 'color: var(--danger); font-weight: bold;' : ''}">${p.stock}</span>
            </td>
            <td style="padding: 15px;">$${p.price}</td>
            <td style="padding: 15px;">
                <span class="status-badge ${p.stock > 20 ? 'ready' : p.stock > 0 ? 'pending' : 'delivered'}" 
                      style="${p.stock === 0 ? 'background: var(--danger); color: white;' : ''}">
                    ${p.stock > 20 ? 'Disponible' : p.stock > 0 ? 'Bajo Stock' : 'Agotado'}
                </span>
            </td>
            <td style="padding: 15px;">
                <button class="btn btn-small btn-secondary" onclick="editStock(${p.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function editStock(productId) {
    const product = state.products.find(p => p.id === productId);
    const newStock = prompt(`Nuevo stock para ${product.name}:`, product.stock);
    if (newStock !== null) {
        product.stock = parseInt(newStock);
        renderInventory();
        showToast('Stock actualizado', 'success');
    }
}

// Reportes
function renderReports() {
    const container = document.getElementById('topProducts');
    if (!container) return;
    const topProducts = [...state.products].sort((a, b) => Math.random() - 0.5).slice(0, 5);
    container.innerHTML = topProducts.map((p, i) => `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; padding: 15px; background: var(--dark-lighter); border-radius: 10px;">
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary); width: 30px;">${i + 1}</div>
            <img src="assets/images/${p.image || ''}" width="50" height="50" style="object-fit: contain; border-radius: 8px; background: var(--dark);" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="image-fallback" style="display:none;align-items:center;justify-content:center;width:50px;height:50px;border-radius:8px;background:var(--dark);font-size:1.5rem;">${p.icon}</div>
            <div style="flex: 1;">
                <div style="font-weight: 600;">${p.name}</div>
                <div style="font-size: 0.85rem; opacity: 0.7;">${Math.floor(Math.random() * 100)} vendidos</div>
            </div>
            <div style="font-weight: 800; color: var(--success);">$${Math.floor(Math.random() * 5000)}</div>
        </div>
    `).join('');
}

// Utilidades
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle', info: 'info-circle' };
    toast.innerHTML = `<i class="fas fa-${icons[type]}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function playSound(type) {
    if (!state.soundEnabled) return;
    console.log(`🔊 Sonido: ${type}`);
}

function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    const btn = document.getElementById('soundBtn');
    if (btn) btn.innerHTML = `<i class="fas fa-volume-${state.soundEnabled ? 'up' : 'mute'}"></i>`;
    showToast(`Sonido ${state.soundEnabled ? 'activado' : 'desactivado'}`, 'info');
}

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    state.theme = next;
    localStorage.setItem('theme', next);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function startRealTimeUpdates() {
    setInterval(() => {
        const timer = document.getElementById('kitchenTimer');
        if (timer) {
            const now = new Date();
            timer.textContent = `${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
        }
    }, 1000);
}

function showNotifications() {
    showToast('No hay notificaciones nuevas', 'info');
    const dot = document.querySelector('.notification-dot');
    if (dot) dot.style.display = 'none';
}

// Login
function selectRole(role) {
    state.currentRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.role === role) btn.classList.add('active');
    });
    clearPin();
}

function enterPin(num) {
    if (state.pin.length < 4) {
        state.pin += num;
        updatePinDisplay();
        if (state.pin.length === 4) setTimeout(validatePin, 300);
    }
}

function deletePin() {
    state.pin = state.pin.slice(0, -1);
    updatePinDisplay();
}

function clearPin() {
    state.pin = '';
    updatePinDisplay();
}

function updatePinDisplay() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((dot, i) => dot.classList.toggle('filled', i < state.pin.length));
}

function validatePin() {
    const expectedPin = CONFIG.PINS[state.currentRole];
    if (state.pin === expectedPin) {
        loginSuccess();
    } else {
        showToast('PIN incorrecto', 'error');
        clearPin();
    }
}

function loginSuccess() {
    state.currentUser = CONFIG.ROLES[state.currentRole];
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('appContainer').style.display = 'grid';
    document.getElementById('userName').textContent = state.currentUser.name;
    document.getElementById('userRole').textContent = state.currentUser.name;
    document.getElementById('userAvatar').textContent = state.currentUser.name[0];
    if (state.currentRole === 'admin') document.getElementById('adminNav').style.display = 'block';
    if (state.currentRole === 'hieleras') showSection('hieleras');
    else if (state.currentRole === 'repartidor') showSection('reparto');
    else if (state.currentRole === 'caja') showSection('tienda');
    playSound('success');
    showToast(`Bienvenido, ${state.currentUser.name}`, 'success');
    startRealTimeUpdates();
}

function logout() {
    location.reload();
}

// Navegación principal
function showSection(section) {
    const sections = ['dashboardSection', 'tiendaSection', 'pedidosSection', 'hielerasSection', 'repartoSection', 'inventarioSection', 'reportesSection'];
    sections.forEach(sec => {
        const el = document.getElementById(sec);
        if (el) el.classList.add('hidden');
    });
    const targetSection = document.getElementById(section + 'Section');
    if (targetSection) targetSection.classList.remove('hidden');
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(n => n.classList.remove('active'));
    if (event && event.target) {
        const clicked = event.target.closest('.nav-item');
        if (clicked) clicked.classList.add('active');
    }
    const titles = {
        dashboard: 'Dashboard', tienda: 'Tienda', pedidos: 'Gestión de Pedidos',
        hieleras: 'Panel de Hieleras', reparto: 'Panel de Reparto', inventario: 'Inventario', reportes: 'Reportes'
    };
    const titleElem = document.getElementById('pageTitle');
    if (titleElem) titleElem.textContent = titles[section] || section;
    if (section === 'tienda') renderProducts();
    if (section === 'pedidos') renderAllOrders();
    if (section === 'hieleras') renderKitchenOrders();
    if (section === 'reparto') renderDeliveryOrders();
    if (section === 'inventario') renderInventory();
    if (section === 'reportes') renderReports();
}

// Cerrar modales al hacer click fuera
window.onclick = function(event) {
    if (event.target.classList && event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
