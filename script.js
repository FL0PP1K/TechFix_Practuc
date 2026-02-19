// ==========================================
// 1. СИНХРОНІЗАЦІЯ З АДМІНКОЮ (Акції та Відгуки)
// ==========================================
function syncSiteData() {
    // Читаємо акції
    const promoData = JSON.parse(localStorage.getItem('techfix_promo'));
    if (promoData) {
        const promoP = document.querySelector('#promo p');
        const promoBtn = document.querySelector('#promo .promo-code');
        if (promoP) promoP.innerText = promoData.text;
        if (promoBtn) promoBtn.innerText = "Промокод: " + promoData.code;
    }

    // Читаємо відгуки
    const reviewsData = JSON.parse(localStorage.getItem('techfix_reviews'));
    const reviewsContainer = document.getElementById('reviews-container');
    if (reviewsData && reviewsContainer) {
        reviewsContainer.innerHTML = ''; // Очищаємо старі
        reviewsData.forEach(rev => {
            const div = document.createElement('div');
            div.className = 'review'; // Використовуємо твій клас зі style.css
            div.innerHTML = `<strong>${rev.name}</strong> ${rev.text}`;
            reviewsContainer.appendChild(div);
        });
    }
}

// ==========================================
// 2. ПЕРЕВІРКА СТАТУСУ (Тепер з LocalStorage)
// ==========================================
function checkStatus() {
    const inputEl = document.getElementById("orderInput");
    const resultArea = document.getElementById("result-area");
    if (!inputEl || !resultArea) return;

    const input = inputEl.value.trim();
    // Беремо базу, яку ти заповнюєш в Admin.html
    const db = JSON.parse(localStorage.getItem('techfix_db')) || {};

    resultArea.style.display = "block";

    if (db[input]) {
        const order = db[input];
        const badge = document.getElementById("status-badge");
        badge.innerText = order.status;
        badge.className = "status-badge st-" + order.type;
        
        document.getElementById("device-name").innerText = order.device;
        document.getElementById("price-val").innerText = order.price || "—";
        document.getElementById("master-note").innerText = order.note || "";

        const colors = { done: "var(--success)", work: "var(--accent)", wait: "var(--danger)" };
        resultArea.style.borderLeft = `5px solid ${colors[order.type]}`;
    } else {
        alert("Замовлення не знайдено! Перевірте номер.");
        resultArea.style.display = "none";
    }
}

// ==========================================
// 3. НАВІГАЦІЯ ТА ТЕМА (Твій оригінальний код)
// ==========================================
function navigateTo(targetId) {
    const homeContent = document.getElementById('home-content');
    const statusSection = document.getElementById('check-status');

    if (targetId === 'check-status') {
        homeContent.style.display = 'none';
        statusSection.style.display = 'block';
    } else {
        statusSection.style.display = 'none';
        homeContent.style.display = 'block';
        if (targetId === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const section = document.getElementById(targetId);
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function handleEnter(e) { if (e.key === 'Enter') checkStatus(); }

// Ініціалізація теми
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
if (toggleSwitch) {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') toggleSwitch.checked = true;
    }
    toggleSwitch.addEventListener('change', function(e) {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
}

// ЗАПУСК ВСЬОГО ПРИ ЗАВАНТАЖЕННІ
document.addEventListener('DOMContentLoaded', syncSiteData);