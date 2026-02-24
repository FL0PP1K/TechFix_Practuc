// 1. ІНІЦІАЛІЗАЦІЯ FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDI0MJrR_BNuvVWR8Imz4orlymbVKXkqF0",
    authDomain: "techfix-base.firebaseapp.com",
    databaseURL: "https://techfix-base-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "techfix-base",
    storageBucket: "techfix-base.firebasestorage.app",
    messagingSenderId: "451050923808",
    appId: "1:451050923808:web:8271809979968b2a1f9945"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- 2. ФУНКЦІЇ ДЛЯ КЛІЄНТА (index.html) ---

function syncSiteData() {
    // Оновлення акцій
    db.ref('promo').on('value', (snap) => {
        const data = snap.val();
        if (data) {
            const p = document.querySelector('#promo p');
            const code = document.querySelector('#promo .promo-code');
            if (p) p.innerText = data.text;
            if (code) code.innerText = "Промокод: " + data.code;
        }
    });

    // Оновлення відгуків
    db.ref('reviews').on('value', (snap) => {
        const container = document.getElementById('reviews-container');
        if (container) {
            container.innerHTML = '';
            const data = snap.val() || {};
            Object.values(data).reverse().forEach(rev => {
                container.innerHTML += `<div class="review-card"><strong>${rev.name}</strong><p>${rev.text}</p></div>`;
            });
        }
    });
}

function checkStatus() {
    const id = document.getElementById("orderInput")?.value.trim();
    if (!id) return alert("Введіть номер!");
    
    db.ref('orders/' + id).once('value').then(snap => {
        const res = document.getElementById("result-area");
        if (snap.exists()) {
            const o = snap.val();
            res.style.display = "block";
            document.getElementById("status-badge").innerText = o.status;
            document.getElementById("status-badge").className = "status-badge st-" + o.type;
            document.getElementById("device-name").innerText = o.device;
            document.getElementById("price-val").innerText = o.price;
            document.getElementById("master-note").innerText = o.note || "Немає";
        } else { alert("Не знайдено!"); }
    });
}

// --- 3. УСІ ФУНКЦІЇ АДМІНКИ (admin.html) ---

function login() {
    if (document.getElementById('pass').value === 'admin') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        loadAdminData();
    } else alert('Помилка!');
}

// Замовлення
function saveOrder() {
    const id = document.getElementById('order-id').value;
    const statusEl = document.getElementById('order-status');
    db.ref('orders/' + id).set({
        device: document.getElementById('order-device').value,
        price: document.getElementById('order-price').value,
        type: statusEl.value,
        status: statusEl.options[statusEl.selectedIndex].text,
        note: document.getElementById('order-note')?.value || ""
    });
    alert("Замовлення збережено!");
}

function delOrder(id) {
    if(confirm('Видалити замовлення?')) db.ref('orders/' + id).remove();
}

// Акції
function savePromo() {
    db.ref('promo').set({
        text: document.getElementById('promo-text').value,
        code: document.getElementById('promo-code').value
    });
    alert("Акцію оновлено!");
}

// Відгуки
function addReview() {
    const name = document.getElementById('rev-name').value;
    const text = document.getElementById('rev-text').value;
    if(name && text) db.ref('reviews').push({ name, text });
}

function delReview(id) {
    db.ref('reviews/' + id).remove();
}

// Завантаження даних в адмінку
function loadAdminData() {
    // Таблиця замовлень
    db.ref('orders').on('value', snap => {
        const tbody = document.getElementById('orders-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        const orders = snap.val() || {};
        for(let id in orders) {
            tbody.innerHTML += `<tr><td>${id}</td><td>${orders[id].device}</td><td>${orders[id].status}</td>
            <td><button onclick="delOrder('${id}')">🗑️</button></td></tr>`;
        }
    });

    // Список відгуків для видалення
    db.ref('reviews').on('value', snap => {
        const list = document.getElementById('reviews-list');
        if (!list) return;
        list.innerHTML = '';
        const revs = snap.val() || {};
        for(let id in revs) {
            list.innerHTML += `<div class="item-card">${revs[id].name} <button onclick="delReview('${id}')">🗑️</button></div>`;
        }
    });
}

// Тема та ініціалізація
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('promo')) syncSiteData();
    
    // Перемикач теми
    const themeBtn = document.querySelector('.theme-switch input');
    if (themeBtn) {
        themeBtn.addEventListener('change', () => {
            const theme = themeBtn.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    }
});
