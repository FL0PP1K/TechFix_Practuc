// 1. ІНІЦІАЛІЗАЦІЯ БАЗИ ДАНИХ FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDI0MJrR_BNuvVWR8Imz4orlymbVKXkqF0",
    authDomain: "techfix-base.firebaseapp.com",
    databaseURL: "https://techfix-base-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "techfix-base",
    storageBucket: "techfix-base.firebasestorage.app",
    messagingSenderId: "451050923808",
    appId: "1:451050923808:web:8271809979968b2a1f9945"
  };

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// 2. СИНХРОНІЗАЦІЯ В РЕАЛЬНОМУ ЧАСІ (Акції та Відгуки)
function syncSiteData() {
    // Слухаємо зміни в Акціях
    db.ref('promo').on('value', (snapshot) => {
        const promoData = snapshot.val();
        if (promoData) {
            const promoP = document.querySelector('#promo p');
            const promoBtn = document.querySelector('#promo .promo-code');
            if (promoP) promoP.innerText = promoData.text;
            if (promoBtn) promoBtn.innerText = "Промокод: " + promoData.code;
        }
    });

    // Слухаємо зміни у Відгуках
    db.ref('reviews').on('value', (snapshot) => {
        const reviewsData = snapshot.val();
        const reviewsContainer = document.getElementById('reviews-container');
        if (reviewsData && reviewsContainer) {
            reviewsContainer.innerHTML = ''; 
            // Перетворюємо дані з бази у зручний список
            const reviewsArray = Object.values(reviewsData).reverse(); 
            
            reviewsArray.forEach(rev => {
                const div = document.createElement('div');
                div.className = 'review-card';
                div.style.marginBottom = "20px";
                div.style.padding = "15px";
                div.style.background = "var(--bg-card)";
                div.style.borderRadius = "8px";
                div.innerHTML = `<strong>${rev.name}</strong><p>${rev.text}</p>`;
                reviewsContainer.appendChild(div);
            });
        }
    });
}

// 3. ПЕРЕВІРКА СТАТУСУ (Звертається до хмари)
function checkStatus() {
    const inputEl = document.getElementById("orderInput");
    const resultArea = document.getElementById("result-area");
    if (!inputEl || !resultArea) return;

    const input = inputEl.value.trim();
    if (!input) return alert("Введіть номер квитанції!");

    resultArea.style.display = "block";

    // Шукаємо замовлення в базі Firebase
    db.ref('orders/' + input).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const order = snapshot.val();
            const badge = document.getElementById("status-badge");
            badge.innerText = order.status;
            badge.className = "status-badge st-" + order.type;
            
            document.getElementById("device-name").innerText = order.device;
            document.getElementById("price-val").innerText = order.price || "—";
            document.getElementById("master-note").innerText = order.note || "Немає коментарів";

            const colors = { done: "var(--success)", work: "var(--accent)", wait: "var(--danger)" };
            resultArea.style.borderLeft = `5px solid ${colors[order.type]}`;
        } else {
            document.getElementById("status-badge").innerText = "Не знайдено";
            document.getElementById("status-badge").style.background = "#555";
            document.getElementById("device-name").innerText = "Замовлення не існує";
            document.getElementById("price-val").innerText = "-";
            document.getElementById("master-note").innerText = "Перевірте номер.";
            resultArea.style.borderLeft = "5px solid #555";
        }
    });
}

// Навігація та Тема (Без змін)
function navigateTo(targetId) {
    const homeContent = document.getElementById('home-content');
    const statusSection = document.getElementById('check-status');
    if (targetId === 'check-status') {
        if(homeContent) homeContent.style.display = 'none';
        if(statusSection) { statusSection.style.display = 'block'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
    } else {
        if(statusSection) statusSection.style.display = 'none';
        if(homeContent) homeContent.style.display = 'block';
        if (targetId === 'home') { window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const section = document.getElementById(targetId);
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}
function handleEnter(e) { if (e.key === 'Enter') checkStatus(); }

function initTheme() {
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark' && toggleSwitch) toggleSwitch.checked = true;
    }
    if (toggleSwitch) {
        toggleSwitch.addEventListener('change', function(e) {
            const theme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    syncSiteData();
});
