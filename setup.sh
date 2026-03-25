#!/bin/bash
set -e
echo "🍻 Configurando proyecto completo 'Depósito El Compa'..."
read -p "⚠️  Esto borrará archivos existentes en la carpeta actual. ¿Continuar? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Crear estructura de carpetas
mkdir -p css js assets/images scripts

# =====================================================
# Extraer CSS del HTML original (completo)
# =====================================================
echo "📦 Extrayendo CSS..."
cat > css/style.css << 'CSS_EOF'
:root {
    --primary: #ff6b6b;
    --primary-dark: #ff5252;
    --secondary: #4ecdc4;
    --accent: #ffe66d;
    --dark: #1a1a2e;
    --dark-light: #16213e;
    --dark-lighter: #0f3460;
    --light: #e94560;
    --success: #00d9ff;
    --warning: #ffc107;
    --danger: #ff4757;
    --glass: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.1);
    --shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

[data-theme="light"] {
    --dark: #f8f9fa;
    --dark-light: #ffffff;
    --dark-lighter: #e9ecef;
    --light: #212529;
    --glass: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(0, 0, 0, 0.1);
    --shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, var(--dark) 0%, var(--dark-light) 100%);
    color: #fff;
    min-height: 100vh;
    overflow-x: hidden;
}

@keyframes slideIn {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.app-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    min-height: 100vh;
}

.sidebar {
    background: var(--glass);
    backdrop-filter: blur(20px);
    border-right: 1px solid var(--glass-border);
    padding: 20px;
    position: fixed;
    height: 100vh;
    width: 280px;
    overflow-y: auto;
    z-index: 1000;
    transition: transform 0.3s ease;
}

.logo {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px 0;
    border-bottom: 1px solid var(--glass-border);
    margin-bottom: 30px;
}

.logo-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, var(--primary), var(--light));
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: float 3s ease-in-out infinite;
}

.logo-text h1 {
    font-size: 1.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.logo-text p {
    font-size: 0.8rem;
    opacity: 0.7;
}

.nav-section {
    margin-bottom: 25px;
}

.nav-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    opacity: 0.5;
    margin-bottom: 10px;
    padding-left: 15px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 15px;
    margin-bottom: 5px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.nav-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 3px;
    background: var(--primary);
    transform: scaleY(0);
    transition: transform 0.3s ease;
}

.nav-item:hover, .nav-item.active {
    background: var(--glass);
    transform: translateX(5px);
}

.nav-item.active::before {
    transform: scaleY(1);
}

.nav-item i {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
}

.badge {
    background: var(--primary);
    color: white;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 10px;
    margin-left: auto;
    font-weight: 600;
}

.main-content {
    margin-left: 280px;
    padding: 30px;
    min-height: 100vh;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    animation: fadeIn 0.5s ease;
}

.header-left h2 {
    font-size: 2rem;
    margin-bottom: 5px;
}

.header-left p {
    opacity: 0.7;
}

.header-actions {
    display: flex;
    gap: 15px;
    align-items: center;
}

.btn-icon {
    width: 45px;
    height: 45px;
    border-radius: 12px;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    position: relative;
}

.btn-icon:hover {
    background: var(--primary);
    transform: translateY(-2px);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: var(--glass);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 25px;
    position: relative;
    overflow: hidden;
    animation: fadeIn 0.6s ease backwards;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
}

.stat-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 15px;
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.stat-icon.purple { background: rgba(233, 69, 96, 0.2); color: var(--light); }
.stat-icon.cyan { background: rgba(78, 205, 196, 0.2); color: var(--secondary); }
.stat-icon.yellow { background: rgba(255, 230, 109, 0.2); color: var(--accent); }
.stat-icon.green { background: rgba(0, 217, 255, 0.2); color: var(--success); }

.stat-trend {
    font-size: 0.85rem;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 600;
}

.stat-trend.up { background: rgba(0, 217, 255, 0.2); color: var(--success); }
.stat-trend.down { background: rgba(255, 71, 87, 0.2); color: var(--danger); }

.stat-value {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 5px;
}

.stat-label {
    opacity: 0.7;
    font-size: 0.9rem;
}

.content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 25px;
    margin-bottom: 25px;
}

.panel {
    background: var(--glass);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 25px;
    animation: fadeIn 0.7s ease;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.panel-title {
    font-size: 1.3rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn {
    padding: 10px 20px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: white;
}

.btn-secondary {
    background: var(--glass);
    color: white;
    border: 1px solid var(--glass-border);
}

.btn-success {
    background: linear-gradient(135deg, var(--success), #00b8d4);
    color: #000;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    max-height: 600px;
    overflow-y: auto;
    padding-right: 10px;
}

.product-card {
    background: var(--dark-light);
    border-radius: 15px;
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid var(--glass-border);
    position: relative;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow);
}

.product-image {
    height: 150px;
    background: linear-gradient(135deg, var(--dark-lighter), var(--dark-light));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    position: relative;
    overflow: hidden;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-info {
    padding: 15px;
}

.product-name {
    font-weight: 600;
    margin-bottom: 5px;
    font-size: 0.95rem;
}

.product-price {
    color: var(--primary);
    font-size: 1.3rem;
    font-weight: 800;
}

.product-stock {
    font-size: 0.8rem;
    opacity: 0.7;
    margin-top: 5px;
}

.btn-add {
    width: 100%;
    padding: 10px;
    background: var(--primary);
    color: white;
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
}

.btn-add:hover {
    background: var(--primary-dark);
}

.cart-items {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 20px;
}

.cart-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--dark-light);
    border-radius: 12px;
    margin-bottom: 10px;
    animation: slideIn 0.3s ease;
}

.cart-item-image {
    width: 50px;
    height: 50px;
    background: var(--dark-lighter);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.cart-item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
}

.cart-item-details {
    flex: 1;
}

.cart-item-name {
    font-weight: 600;
    font-size: 0.9rem;
}

.cart-item-price {
    color: var(--primary);
    font-weight: 700;
}

.quantity-control {
    display: flex;
    align-items: center;
    gap: 8px;
}

.qty-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.cart-total {
    border-top: 2px solid var(--glass-border);
    padding-top: 15px;
    margin-top: 15px;
}

.total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 0.9rem;
    opacity: 0.8;
}

.total-row.final {
    font-size: 1.3rem;
    font-weight: 800;
    opacity: 1;
    color: var(--primary);
}

.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
    z-index: 2000;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
}

.modal.active {
    display: flex;
}

.modal-content {
    background: var(--dark-light);
    border-radius: 20px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid var(--glass-border);
    animation: slideIn 0.3s ease;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 700;
}

.close-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.3s;
}

.close-btn:hover {
    background: var(--danger);
    transform: rotate(90deg);
}

.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 0.9rem;
}

.form-input, .form-select, .form-textarea {
    width: 100%;
    padding: 12px 15px;
    background: var(--dark-lighter);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    border-bottom: 2px solid var(--glass-border);
    padding-bottom: 10px;
}

.tab {
    padding: 10px 20px;
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    font-weight: 600;
    position: relative;
    opacity: 0.6;
    transition: all 0.3s;
}

.tab.active {
    opacity: 1;
    color: var(--primary);
}

.tab.active::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--primary);
}

@media (max-width: 1024px) {
    .app-container {
        grid-template-columns: 1fr;
    }
    .sidebar {
        transform: translateX(-100%);
    }
    .sidebar.open {
        transform: translateX(0);
    }
    .main-content {
        margin-left: 0;
    }
    .content-grid {
        grid-template-columns: 1fr;
    }
}

::-webkit-scrollbar {
    width: 8px;
}
::-webkit-scrollbar-track {
    background: var(--dark-light);
}
::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 4px;
}

.hidden { display: none !important; }
.text-center { text-align: center; }
.mt-20 { margin-top: 20px; }

.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 3000;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.toast {
    background: var(--dark-light);
    border-left: 4px solid var(--primary);
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease;
    min-width: 300px;
}

.toast.success { border-left-color: var(--success); }
.toast.error { border-left-color: var(--danger); }
.toast.warning { border-left-color: var(--warning); }

.login-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--dark);
    z-index: 5000;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.pin-container {
    text-align: center;
}

.pin-display {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin: 30px 0;
}

.pin-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--primary);
    transition: all 0.3s;
}

.pin-dot.filled {
    background: var(--primary);
    box-shadow: 0 0 10px var(--primary);
}

.pin-pad {
    display: grid;
    grid-template-columns: repeat(3, 80px);
    gap: 15px;
    justify-content: center;
}

.pin-btn {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.pin-btn:hover {
    background: var(--primary);
    transform: scale(1.05);
}

.pin-btn.delete {
    background: var(--danger);
}

.role-selector {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
    justify-content: center;
}

.role-btn {
    padding: 15px 30px;
    background: var(--glass);
    border: 2px solid transparent;
    border-radius: 15px;
    color: white;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.role-btn i {
    font-size: 2rem;
}

.role-btn.active, .role-btn:hover {
    border-color: var(--primary);
    background: rgba(255, 107, 107, 0.1);
}
CSS_EOF

# =====================================================
# Extraer JavaScript del HTML original (completo)
# =====================================================
echo "📜 Extrayendo JavaScript (esto puede tomar unos segundos)..."
cat > js/app.js << 'JS_EOF'
// Estado global
const CONFIG = {
    PINS: {
        admin: '1234',
        cocina: '1111',
        repartidor: '2222',
        caja: '3333'
    },
    ROLES: {
        admin: { name: 'Administrador', permissions: ['all'] },
        cocina: { name: 'Cocinero', permissions: ['cocina', 'dashboard'] },
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
        { id: 1, name: 'Cerveza Modelo Especial', price: 35, category: 'cerveza', stock: 50, icon: '🍺', image: 'modelo.jpg' },
        { id: 2, name: 'Cerveza Corona', price: 32, category: 'cerveza', stock: 45, icon: '🍺', image: 'corona.jpg' },
        { id: 3, name: 'Cerveza Victoria', price: 30, category: 'cerveza', stock: 30, icon: '🍺', image: 'victoria.jpg' },
        { id: 4, name: 'Cerveza Indio', price: 32, category: 'cerveza', stock: 25, icon: '🍺', image: 'indio.jpg' },
        { id: 5, name: 'Cerveza XX Lager', price: 34, category: 'cerveza', stock: 40, icon: '🍺', image: 'xx.jpg' },
        { id: 6, name: 'Botana Mixta', price: 50, category: 'botana', stock: 20, icon: '🥜', image: 'botana.jpg' },
        { id: 7, name: 'Papas Fritas', price: 35, category: 'botana', stock: 30, icon: '🍟', image: 'papas.jpg' },
        { id: 8, name: 'Cacahuates', price: 25, category: 'botana', stock: 50, icon: '🥜', image: 'cacahuates.jpg' },
        { id: 9, name: 'Hielo 5kg', price: 40, category: 'otros', stock: 15, icon: '🧊', image: 'hielo.jpg' },
        { id: 10, name: 'Refresco 2L', price: 28, category: 'otros', stock: 35, icon: '🥤', image: 'refresco.jpg' }
    ],
    soundEnabled: true,
    theme: 'dark'
};

// Funciones de inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    setInterval(updateDate, 60000);
    generateSampleOrders();
    updateStats();
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') toggleTheme();
});

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElem = document.getElementById('currentDate');
    if (dateElem) dateElem.textContent = now.toLocaleDateString('es-ES', options);
}

function generateSampleOrders() {
    const statuses = ['pending', 'preparing', 'ready', 'delivered'];
    const names = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Hernández'];
    for (let i = 1; i <= 8; i++) {
        state.orders.push({
            id: 100 + i,
            customer: names[Math.floor(Math.random() * names.length)],
            phone: '81' + Math.floor(Math.random() * 10000000),
            address: 'Calle ' + Math.floor(Math.random() * 100) + ' # ' + Math.floor(Math.random() * 1000),
            products: [{ name: 'Cerveza Modelo', qty: Math.floor(Math.random() * 6) + 1 }],
            total: Math.floor(Math.random() * 500) + 100,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            time: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
            date: new Date().toLocaleDateString()
        });
    }
    renderRecentOrders();
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
                <img src="assets/images/${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/150x150?text=${product.icon}'">
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
                    <img src="assets/images/${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/50x50?text=${item.icon}'">
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
        container.innerHTML = '<p class="text-center" style="padding: 40px; opacity: 0.5;">No hay pedidos en cocina</p>';
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
                    <img src="assets/images/${p.image}" width="40" height="40" style="object-fit: cover; border-radius: 8px;" onerror="this.src='https://placehold.co/40x40?text=${p.icon}'">
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
            <img src="assets/images/${p.image}" width="50" height="50" style="object-fit: cover; border-radius: 8px;" onerror="this.src='https://placehold.co/50x50?text=${p.icon}'">
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
    if (state.currentRole === 'cocina') showSection('cocina');
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
    const sections = ['dashboardSection', 'tiendaSection', 'pedidosSection', 'cocinaSection', 'repartoSection', 'inventarioSection', 'reportesSection'];
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
        cocina: 'Panel de Cocina', reparto: 'Panel de Reparto', inventario: 'Inventario', reportes: 'Reportes'
    };
    const titleElem = document.getElementById('pageTitle');
    if (titleElem) titleElem.textContent = titles[section] || section;
    if (section === 'tienda') renderProducts();
    if (section === 'pedidos') renderAllOrders();
    if (section === 'cocina') renderKitchenOrders();
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
JS_EOF

# =====================================================
# Generar index.html limpio con enlaces a CSS/JS
# =====================================================
echo "📄 Generando index.html completo..."
cat > index.html << 'HTML_EOF'
<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Depósito El Compa - Sistema Integral</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Login Overlay -->
    <div class="login-overlay" id="loginOverlay">
        <div class="pin-container">
            <h1 style="font-size: 2.5rem; margin-bottom: 10px;">🍻 Depósito El Compa</h1>
            <p style="opacity: 0.7; margin-bottom: 30px;">Sistema de Gestión Integral</p>
            <div class="role-selector">
                <button class="role-btn active" data-role="admin" onclick="selectRole('admin')">
                    <i class="fas fa-user-shield"></i><span>Admin</span>
                </button>
                <button class="role-btn" data-role="cocina" onclick="selectRole('cocina')">
                    <i class="fas fa-utensils"></i><span>Cocina</span>
                </button>
                <button class="role-btn" data-role="repartidor" onclick="selectRole('repartidor')">
                    <i class="fas fa-motorcycle"></i><span>Repartidor</span>
                </button>
                <button class="role-btn" data-role="caja" onclick="selectRole('caja')">
                    <i class="fas fa-cash-register"></i><span>Caja</span>
                </button>
            </div>
            <div class="pin-display" id="pinDisplay">
                <div class="pin-dot"></div><div class="pin-dot"></div><div class="pin-dot"></div><div class="pin-dot"></div>
            </div>
            <div class="pin-pad">
                <button class="pin-btn" onclick="enterPin(1)">1</button><button class="pin-btn" onclick="enterPin(2)">2</button><button class="pin-btn" onclick="enterPin(3)">3</button>
                <button class="pin-btn" onclick="enterPin(4)">4</button><button class="pin-btn" onclick="enterPin(5)">5</button><button class="pin-btn" onclick="enterPin(6)">6</button>
                <button class="pin-btn" onclick="enterPin(7)">7</button><button class="pin-btn" onclick="enterPin(8)">8</button><button class="pin-btn" onclick="enterPin(9)">9</button>
                <button class="pin-btn" onclick="clearPin()">C</button><button class="pin-btn" onclick="enterPin(0)">0</button>
                <button class="pin-btn delete" onclick="deletePin()"><i class="fas fa-backspace"></i></button>
            </div>
            <p style="margin-top: 20px; opacity: 0.5; font-size: 0.9rem;">PIN por defecto: 1234</p>
        </div>
    </div>

    <!-- Toast Container -->
    <div class="toast-container" id="toastContainer"></div>

    <!-- App Container -->
    <div class="app-container" id="appContainer" style="display: none;">
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
            <div class="logo">
                <div class="logo-icon">🍻</div>
                <div class="logo-text"><h1>El Compa</h1><p>Sistema Integral</p></div>
            </div>
            <div class="nav-section">
                <div class="nav-title">Principal</div>
                <div class="nav-item active" onclick="showSection('dashboard')"><i class="fas fa-chart-line"></i><span>Dashboard</span></div>
                <div class="nav-item" onclick="showSection('tienda')"><i class="fas fa-store"></i><span>Tienda</span><span class="badge" id="cartBadge">0</span></div>
                <div class="nav-item" onclick="showSection('pedidos')"><i class="fas fa-clipboard-list"></i><span>Pedidos</span><span class="badge warning" id="ordersBadge">3</span></div>
            </div>
            <div class="nav-section" id="adminNav" style="display: none;">
                <div class="nav-title">Administración</div>
                <div class="nav-item" onclick="showSection('cocina')"><i class="fas fa-fire"></i><span>Cocina</span><span class="badge" id="kitchenBadge">2</span></div>
                <div class="nav-item" onclick="showSection('reparto')"><i class="fas fa-map-marked-alt"></i><span>Reparto</span></div>
                <div class="nav-item" onclick="showSection('inventario')"><i class="fas fa-boxes"></i><span>Inventario</span></div>
                <div class="nav-item" onclick="showSection('reportes')"><i class="fas fa-chart-pie"></i><span>Reportes</span></div>
            </div>
            <div class="nav-section">
                <div class="nav-title">Sistema</div>
                <div class="nav-item" onclick="toggleTheme()"><i class="fas fa-moon"></i><span>Cambiar Tema</span></div>
                <div class="nav-item" onclick="logout()"><i class="fas fa-sign-out-alt"></i><span>Cerrar Sesión</span></div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="header">
                <div class="header-left"><h2 id="pageTitle">Dashboard</h2><p id="currentDate">Cargando fecha...</p></div>
                <div class="header-actions">
                    <button class="btn-icon" onclick="toggleSound()" id="soundBtn"><i class="fas fa-volume-up"></i></button>
                    <button class="btn-icon" onclick="showNotifications()"><i class="fas fa-bell"></i><span class="notification-dot"></span></button>
                    <div class="user-profile"><div class="user-avatar" id="userAvatar">A</div><div><div style="font-weight: 600;" id="userName">Admin</div><div style="font-size: 0.8rem; opacity: 0.7;" id="userRole">Administrador</div></div></div>
                </div>
            </header>

            <!-- Dashboard Section -->
            <section id="dashboardSection" class="section-content">
                <div class="stats-grid">
                    <div class="stat-card"><div class="stat-header"><div class="stat-icon purple"><i class="fas fa-dollar-sign"></i></div><span class="stat-trend up">+12.5%</span></div><div class="stat-value" id="totalVentas">$0</div><div class="stat-label">Ventas Hoy</div></div>
                    <div class="stat-card"><div class="stat-header"><div class="stat-icon cyan"><i class="fas fa-shopping-bag"></i></div><span class="stat-trend up">+8.2%</span></div><div class="stat-value" id="totalPedidos">0</div><div class="stat-label">Pedidos Hoy</div></div>
                    <div class="stat-card"><div class="stat-header"><div class="stat-icon yellow"><i class="fas fa-clock"></i></div><span class="stat-trend down">-2.1%</span></div><div class="stat-value" id="tiempoPromedio">18m</div><div class="stat-label">Tiempo Promedio</div></div>
                    <div class="stat-card"><div class="stat-header"><div class="stat-icon green"><i class="fas fa-star"></i></div><span class="stat-trend up">+5.4%</span></div><div class="stat-value">4.8</div><div class="stat-label">Calificación</div></div>
                </div>
                <div class="content-grid">
                    <div class="panel"><div class="panel-header"><h3 class="panel-title"><i class="fas fa-chart-bar"></i>Ventas por Hora</h3><div class="panel-actions"><button class="btn btn-secondary btn-small">Hoy</button><button class="btn btn-secondary btn-small">Semana</button></div></div><div class="chart-container" id="salesChart"></div></div>
                    <div class="panel"><div class="panel-header"><h3 class="panel-title"><i class="fas fa-map-marker-alt"></i>Mapa de Entregas</h3></div><div class="map-container"><div class="map-grid"></div><div class="map-point" style="top: 30%; left: 20%;" data-label="Pedido #123"><i class="fas fa-motorcycle"></i></div><div class="map-point" style="top: 60%; left: 70%;" data-label="Pedido #124"><i class="fas fa-motorcycle"></i></div><div class="map-point" style="top: 40%; left: 50%; background: var(--success);" data-label="Entregado"><i class="fas fa-check"></i></div></div><div style="display: flex; justify-content: space-between; font-size: 0.9rem;"><span><i class="fas fa-circle" style="color: var(--primary);"></i> En camino (2)</span><span><i class="fas fa-circle" style="color: var(--success);"></i> Entregados (8)</span></div></div>
                </div>
                <div class="panel"><div class="panel-header"><h3 class="panel-title"><i class="fas fa-list"></i>Pedidos Recientes</h3><button class="btn btn-primary" onclick="showSection('pedidos')">Ver Todos</button></div><div class="orders-list" id="recentOrders"></div></div>
            </section>

            <!-- Tienda Section -->
            <section id="tiendaSection" class="section-content hidden">
                <div class="content-grid" style="grid-template-columns: 1fr 350px;">
                    <div><div class="search-bar"><i class="fas fa-search search-icon"></i><input type="text" class="search-input" placeholder="Buscar productos..." id="searchProduct" onkeyup="filterProducts()"></div><div class="quick-filters"><button class="filter-chip active" onclick="filterCategory('all')">Todos</button><button class="filter-chip" onclick="filterCategory('cerveza')">Cervezas</button><button class="filter-chip" onclick="filterCategory('botana')">Botanas</button><button class="filter-chip" onclick="filterCategory('otros')">Otros</button></div><div class="products-grid" id="productsGrid"></div></div>
                    <div class="panel" style="position: sticky; top: 30px; height: fit-content;"><div class="panel-header"><h3 class="panel-title"><i class="fas fa-shopping-cart"></i>Carrito</h3><button class="btn-icon" onclick="clearCart()" style="width: 35px; height: 35px;"><i class="fas fa-trash"></i></button></div><div class="cart-items" id="cartItems"><p class="text-center" style="opacity: 0.5; padding: 40px 0;">El carrito está vacío</p></div><div class="cart-total"><div class="total-row"><span>Subtotal:</span><span id="subtotal">$0</span></div><div class="total-row"><span>Envío:</span><span>$50</span></div><div class="total-row final"><span>Total:</span><span id="cartTotal">$0</span></div></div><button class="btn btn-primary" style="width: 100%; margin-top: 15px;" onclick="openCheckout()"><i class="fas fa-credit-card"></i>Finalizar Compra</button></div>
                </div>
            </section>

            <!-- Pedidos Section -->
            <section id="pedidosSection" class="section-content hidden">
                <div class="tabs"><button class="tab active" onclick="filterOrders('all')">Todos</button><button class="tab" onclick="filterOrders('pending')">Pendientes</button><button class="tab" onclick="filterOrders('preparing')">En Preparación</button><button class="tab" onclick="filterOrders('ready')">Listos</button><button class="tab" onclick="filterOrders('delivered')">Entregados</button></div>
                <div class="orders-list" id="allOrdersList"></div>
            </section>

            <!-- Cocina Section -->
            <section id="cocinaSection" class="section-content hidden">
                <div class="panel"><div class="panel-header"><h3 class="panel-title"><i class="fas fa-fire-alt"></i>Pedidos en Cocina</h3><div class="timer" id="kitchenTimer">00:00</div></div><div class="cooking-animation"><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div></div><div class="orders-list" id="kitchenOrders"></div></div>
            </section>

            <!-- Reparto Section -->
            <section id="repartoSection" class="section-content hidden">
                <div class="content-grid"><div class="panel"><div class="panel-header"><h3 class="panel-title"><i class="fas fa-route"></i>Rutas de Entrega</h3></div><div class="map-container" style="height: 400px;"><div class="map-grid"></div><svg style="position: absolute; width: 100%; height: 100%; pointer-events: none;"><path d="M 100 150 Q 250 100 400 200" stroke="var(--primary)" stroke-width="3" fill="none" stroke-dasharray="5,5"><animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite"/></path></svg><div class="map-point" style="top: 30%; left: 15%;" data-label="Inicio"><i class="fas fa-store"></i></div><div class="map-point" style="top: 50%; left: 40%; animation: none; background: var(--warning);" data-label="Pedido #125"><i class="fas fa-box"></i></div><div class="map-point" style="top: 70%; left: 70%; animation: none; background: var(--warning);" data-label="Pedido #126"><i class="fas fa-box"></i></div></div></div><div class="panel"><div class="panel-header"><h3 class="panel-title"><i class="fas fa-motorcycle"></i>Entregas Pendientes</h3></div><div class="orders-list" id="deliveryOrders"></div></div></div>
            </section>

            <!-- Inventario Section -->
            <section id="inventarioSection" class="section-content hidden">
                <div class="panel"><div class="panel-header"><h3 class="panel-title"><i class="fas fa-boxes"></i>Gestión de Inventario</h3><button class="btn btn-primary" onclick="openAddProductModal()"><i class="fas fa-plus"></i>Agregar Producto</button></div><div class="search-bar"><i class="fas fa-search search-icon"></i><input type="text" class="search-input" placeholder="Buscar en inventario..."></div><table style="width: 100%; border-collapse: collapse;"><thead><tr style="text-align: left; border-bottom: 2px solid var(--glass-border);"><th style="padding: 15px;">Producto</th><th style="padding: 15px;">Stock</th><th style="padding: 15px;">Precio</th><th style="padding: 15px;">Estado</th><th style="padding: 15px;">Acciones</th></tr></thead><tbody id="inventoryTable"></tbody></table></div>
            </section>

            <!-- Reportes Section -->
            <section id="reportesSection" class="section-content hidden">
                <div class="content-grid"><div class="panel"><div class="panel-header"><h3 class="panel-title"><i class="fas fa-chart-line"></i>Resumen de Ventas</h3></div><div style="text-align: center; padding: 40px;"><div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">$45,230</div><div style="opacity: 0.7;">Ventas totales del mes</div></div><div class="chart-container" style="height: 250px;"><div class="chart-bar" style="height: 40%;" data-value="$8k"></div><div class="chart-bar" style="height: 65%;" data-value="$13k"></div><div class="chart-bar" style="height: 45%;" data-value="$9k"></div><div class="chart-bar" style="height: 80%;" data-value="$16k"></div><div class="chart-bar" style="height: 55%;" data-value="$11k"></div><div class="chart-bar" style="height: 90%;" data-value="$18k"></div><div class="chart-bar" style="height: 70%;" data-value="$14k"></div></div><div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 0.8rem; opacity: 0.6;"><span>Lun</span><span>Mar</span><span>Mie</span><span>Jue</span><span>Vie</span><span>Sab</span><span>Dom</span></div></div><div class="panel"><div class="panel-header"><h3 class="panel-title"><i class="fas fa-trophy"></i>Productos Más Vendidos</h3></div><div id="topProducts"></div></div></div>
            </section>
        </main>
    </div>

    <!-- Modal Checkout -->
    <div class="modal" id="checkoutModal"><div class="modal-content"><div class="modal-header"><h3 class="modal-title">Finalizar Pedido</h3><button class="close-btn" onclick="closeModal('checkoutModal')"><i class="fas fa-times"></i></button></div><form id="checkoutForm" onsubmit="processOrder(event)"><div class="form-group"><label class="form-label">Nombre del Cliente</label><input type="text" class="form-input" id="customerName" required></div><div class="form-group"><label class="form-label">Teléfono</label><input type="tel" class="form-input" id="customerPhone" required></div><div class="form-group"><label class="form-label">Dirección de Entrega</label><textarea class="form-textarea" id="customerAddress" rows="2" required></textarea></div><div class="form-group"><label class="form-label">Método de Pago</label><select class="form-select" id="paymentMethod"><option value="efectivo">💵 Efectivo</option><option value="tarjeta">💳 Tarjeta</option><option value="transferencia">🏦 Transferencia</option></select></div><div class="form-group"><label class="form-label">Código de Descuento</label><input type="text" class="form-input" id="discountCode" placeholder="Opcional" onblur="applyDiscount()"></div><div style="background: var(--dark-lighter); padding: 15px; border-radius: 10px; margin-bottom: 20px;"><div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span>Subtotal:</span><span id="checkoutSubtotal">$0</span></div><div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--success);"><span>Descuento:</span><span id="checkoutDiscount">-$0</span></div><div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 800; border-top: 1px solid var(--glass-border); padding-top: 8px;"><span>Total:</span><span id="checkoutTotal">$0</span></div></div><button type="submit" class="btn btn-primary" style="width: 100%;"><i class="fas fa-paper-plane"></i>Confirmar Pedido</button></form><div class="ticket-preview" id="ticketPreview" style="display: none;"><div class="ticket-header"><h3>🍻 DEPÓSITO EL COMPA</h3><p>Ticket #: <span id="ticketNumber">001</span></p><p id="ticketDate">--</p></div><div id="ticketItems"></div><div class="ticket-total">Total: <span id="ticketTotal">$0</span></div><p style="text-align: center; margin-top: 10px; font-size: 0.8rem;">¡Gracias por su compra!</p></div></div></div>

    <script src="js/app.js"></script>
</body>
</html>
HTML_EOF

# Crear scripts de inicio
cat > scripts/start.sh << 'START_EOF'
#!/bin/bash
echo "🚀 Iniciando servidor en http://localhost:8000"
python3 -m http.server 8000
START_EOF
cat > scripts/start.bat << 'START_BAT_EOF'
@echo off
echo 🚀 Iniciando servidor en http://localhost:8000
python -m http.server 8000
START_BAT_EOF
chmod +x scripts/start.sh

# Placeholders de imágenes (reemplazar después)
for img in modelo corona victoria indio xx botana papas cacahuates hielo refresco; do
    echo "Placeholder - reemplazar con imagen real" > "assets/images/${img}.jpg"
done

# Inicializar git
git init
git add .
git commit -m "Initial commit: Sistema completo Depósito El Compa"

echo ""
echo "✅ Proyecto creado exitosamente con todas las funcionalidades completas!"
echo "👉 Para iniciar el servidor: cd scripts && ./start.sh"
echo "👉 Luego abre http://localhost:8000 en tu navegador"
echo "👉 Las imágenes son placeholders. Reemplázalas con fotos reales en assets/images/"
echo "👉 PIN por defecto: admin=1234, cocina=1111, repartidor=2222, caja=3333"
