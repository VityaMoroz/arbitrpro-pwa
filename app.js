/* ============================================
   АРБИТРПРО — ЛОГИКА PWA-ПРОТОТИПА
   ============================================ */

// Тестовые должники (для демо)
const TEST_USERS = {
    '502712345678': { snils: '12345678901', name: 'Иванов Иван Иванович', scenario: 'active' },
    '770123456789': { snils: '98765432100', name: 'Петров Пётр Петрович', scenario: 'blocked-hard' },
    '500123456789': { snils: '11122233344', name: 'Сидоров Сидор Сидорович', scenario: 'closed' },
    '771234567890': { snils: '55566677788', name: 'Кузнецов Алексей', scenario: 'blocked-soft' }
};

// ==================== УТИЛИТЫ ====================

// Маска СНИЛС: XXX-XXX-XXX XX
function formatSnils(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    let result = '';
    if (digits.length > 0) result += digits.slice(0, 3);
    if (digits.length > 3) result += '-' + digits.slice(3, 6);
    if (digits.length > 6) result += '-' + digits.slice(6, 9);
    if (digits.length > 9) result += ' ' + digits.slice(9, 11);
    return result;
}

// Валидация ИНН (12 цифр)
function validateINN(inn) {
    return /^\d{12}$/.test(inn);
}

// ==================== ЭКРАН ВХОДА ====================

const innInput = document.getElementById('inn');
const snilsInput = document.getElementById('snils');
const loginForm = document.getElementById('loginForm');
const authError = document.getElementById('authError');
const helpLink = document.getElementById('helpLink');

if (innInput) {
    innInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 12);
    });
}

if (snilsInput) {
    snilsInput.addEventListener('input', (e) => {
        const cursorPos = e.target.selectionStart;
        const oldLen = e.target.value.length;
        const formatted = formatSnils(e.target.value);
        e.target.value = formatted;
        // Восстановление позиции курсора
        const newLen = formatted.length;
        const diff = newLen - oldLen;
        e.target.setSelectionRange(cursorPos + diff, cursorPos + diff);
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inn = innInput.value.trim();
        const snilsRaw = snilsInput.value.replace(/\D/g, '');

        if (!validateINN(inn)) {
            authError.textContent = 'ИНН должен содержать 12 цифр';
            authError.style.display = 'block';
            return;
        }
        if (snilsRaw.length !== 11) {
            authError.textContent = 'СНИЛС должен содержать 11 цифр';
            authError.style.display = 'block';
            return;
        }

        const user = TEST_USERS[inn];
        if (!user || user.snils !== snilsRaw) {
            authError.textContent = 'Данные не найдены. Проверьте ИНН и СНИЛС.';
            authError.style.display = 'block';
            return;
        }

        authError.style.display = 'none';
        // Редирект по сценарию
        const routes = {
            'active': 'dashboard.html',
            'blocked-hard': 'blocked-hard.html',
            'blocked-soft': 'blocked-soft.html',
            'closed': 'closed.html'
        };
        window.location.href = routes[user.scenario] || 'dashboard.html';
    });
}

if (helpLink) {
    helpLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Здесь будет переход в мессенджер (заглушка).');
    });
}

// ==================== DASHBOARD ====================

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

const topupBtn = document.getElementById('topupBtn');
if (topupBtn) {
    topupBtn.addEventListener('click', () => {
        window.location.href = 'topup.html';
    });
}

const contactBtn = document.getElementById('contactBtn');
if (contactBtn) {
    contactBtn.addEventListener('click', () => {
        alert('Здесь будет чат с АрбитрПро (заглушка).');
    });
}

// Демо-панель: управление статусами
const pmStepper = document.getElementById('pmStepper');
const pmStatus = document.getElementById('pmStatus');
const caseTimeline = document.getElementById('caseTimeline');

function setPmStep(step) {
    if (!pmStepper) return;
    const steps = pmStepper.querySelectorAll('.step');
    steps.forEach((el, idx) => {
        el.classList.remove('active', 'done');
        if (idx + 1 < step) el.classList.add('done');
        if (idx + 1 === step) el.classList.add('active');
    });

    const messages = {
        1: 'Поход в банк запланирован на <b>18.11.2026</b>',
        2: 'Ориентировочная дата выплаты ПМ: <b>22.11.2026</b>',
        3: '✓ Выплата ПМ совершена. Ожидайте новый цикл.'
    };
    if (pmStatus) pmStatus.innerHTML = messages[step] || '';
}

function setPmFail() {
    if (!pmStatus) return;
    pmStatus.innerHTML = '⚠ Поход перенесён на <b>25.11.2026</b>. Причина: документы не готовы.';
    pmStatus.style.background = '#FFF3E0';
    pmStatus.style.borderLeftColor = '#C9A961';
    pmStatus.style.color = '#7A5A1F';
}

function setPmNoMoney() {
    if (!pmStatus) return;
    pmStatus.innerHTML = '⚠ Поход совершён, но денег на счёте нет. Уточните дату поступления.';
    pmStatus.style.background = '#FDECEB';
    pmStatus.style.borderLeftColor = '#C0392B';
    pmStatus.style.color = '#8B2A1F';
}

function advanceCase() {
    if (!caseTimeline) return;
    const items = caseTimeline.querySelectorAll('.timeline-item');
    let activeIdx = -1;
    items.forEach((el, idx) => {
        if (el.classList.contains('active')) activeIdx = idx;
    });
    if (activeIdx >= 0 && activeIdx < items.length - 1) {
        items[activeIdx].classList.remove('active');
        items[activeIdx].classList.add('done');
        items[activeIdx].querySelector('.timeline-dot').textContent = '✓';
        items[activeIdx + 1].classList.add('active');
        items[activeIdx + 1].querySelector('.timeline-dot').textContent = '●';
    }
}

function completeCase() {
    window.location.href = 'closed.html';
}

document.querySelectorAll('.btn-demo').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'pm-step-1') setPmStep(1);
        if (action === 'pm-step-2') setPmStep(2);
        if (action === 'pm-step-3') setPmStep(3);
        if (action === 'pm-fail') setPmFail();
        if (action === 'pm-no-money') setPmNoMoney();
        if (action === 'case-next') advanceCase();
        if (action === 'case-done') completeCase();
    });
});

// ==================== BLOCKED HARD ====================

const grantAccessBtn = document.getElementById('grantAccessBtn');
if (grantAccessBtn) {
    grantAccessBtn.addEventListener('click', () => {
        alert('Переход на Госуслуги (заглушка). После предоставления доступа вы вернётесь в кабинет.');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    });
}

// ==================== TOPUP FORM ====================

const backBtn = document.getElementById('backBtn');
if (backBtn) {
    backBtn.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
}

const fileBtn = document.getElementById('fileBtn');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');

if (fileBtn && fileInput) {
    fileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file || !filePreview) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = document.createElement('img');
            img.src = ev.target.result;
            filePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

const topupForm = document.getElementById('topupForm');
if (topupForm) {
    topupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('✓ Данные отправлены. Мы обработаем их и обновим статус.');
        window.location.href = 'dashboard.html';
    });
}

// ==================== PWA: Service Worker ====================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW зарегистрирован'))
            .catch(err => console.log('SW ошибка:', err));
    });
}
