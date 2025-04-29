let demo = false;
const guideOverlay = document.getElementById('guide-overlay');
const focusRing = document.getElementById('focus-ring');
const guideText = document.getElementById('guide-text');
const closeBtn = document.getElementById('close-guide');

// Текст гайда (элементы будут инициализированы позже)
const guideSteps = [
    { selector: '.header', text: 'Это ваш профиль. Здесь отображается уровень, опыт и монеты' },
    { selector: '.missions-section', text: 'Миссии помогут заработать опыт. Выполняйте их ежедневно!' },
    { selector: '.shop-section', text: 'В магазине можно купить косметику для профиля за монеты' }
];

let currentStep = 0;

// Функция посимвольного вывода текста
function typeText(text, callback) {
    let i = 0;
    guideText.innerHTML = '';
    
    const typingInterval = setInterval(() => {
        if (i < text.length) {
            guideText.innerHTML += text.charAt(i);
            i++;
        } else {
            clearInterval(typingInterval);
            if (callback) callback();
        }
    }, 30);
}

// Получение текущего элемента
function getCurrentElement() {
    return document.querySelector(guideSteps[currentStep].selector);
}

// Функция показа гайда
function showGuide() {
    if (!demo) return;
    
    // Блокируем интерактивные элементы
    document.querySelectorAll('button, a, input').forEach(el => el.style.pointerEvents = 'none');
    
    // Показываем первый шаг
    if (currentStep < guideSteps.length) {
        const element = getCurrentElement();
        
        if (!element) {
            console.error(`Элемент ${guideSteps[currentStep].selector} не найден`);
            return;
        }

        // Анимация фокусировки
        focusRing.style.transition = 'all 0.5s ease';
        guideOverlay.style.opacity = 1;
        
        // Получаем позицию и размер элемента
        const rect = element.getBoundingClientRect();
        focusRing.style.width = `${rect.width + 40}px`;
        focusRing.style.height = `${rect.height + 40}px`;
        focusRing.style.left = `${rect.left - 20}px`;
        focusRing.style.top = `${rect.top - 20}px`;
        
        // Применяем border-radius из оригинального элемента
        const computedStyle = window.getComputedStyle(element);
        focusRing.style.borderRadius = computedStyle.borderRadius || '50%';
        
        // Запускаем эффект печатания текста
        setTimeout(() => {
            guideText.style.opacity = 1;
            typeText(guideSteps[currentStep].text, () => {
                // Ожидание клика для продолжения
                const nextStep = () => {
                    guideText.style.opacity = 0;
                    currentStep++;
                    
                    // Условие для переходов между страницами
                    if (currentStep === 2) {
                        router.showPage('shop'); // Пример перехода в магазин
                        setTimeout(router.showPage('main', false), 1500); // Возврат через 1.5с
                    }
                    
                    setTimeout(showGuide, 500);
                    document.removeEventListener('click', nextStep);
                };
                
                document.addEventListener('click', nextStep);
            });
        }, 600);
    } else {
        // Завершение гайда
        guideOverlay.style.opacity = 0;
        focusRing.style.width = focusRing.style.height = '0';
        document.querySelectorAll('button, a, input').forEach(el => el.style.pointerEvents = 'auto');
        demo = false;
        currentStep = 0;
    }
}

// Обработчик кнопки Demo
document.querySelector('.demo-btn')?.addEventListener('click', () => {
    demo = !demo;
    if (demo) {
        guideOverlay.style.display = 'block';
        focusRing.style.display = 'block';
        guideText.style.display = 'block';
        closeBtn.style.opacity = 1;
        currentStep = 0;
        showGuide();
    }
});

// Обработчик закрытия гайда
closeBtn.addEventListener('click', () => {
    demo = false;
    guideOverlay.style.opacity = 0;
    focusRing.style.width = focusRing.style.height = '0';
    guideText.style.opacity = 0;
    closeBtn.style.opacity = 0;
    document.querySelectorAll('button, a, input').forEach(el => el.style.pointerEvents = 'auto');
});

let userData = {
    activeMissions: new Set(["Попить воды 1 раз - 100xp", "Попить воды 2 раза - 150xp", "Попить воды 3 раза - 200xp"]),
    completedMissions: new Set(),
    purchasedItems: new Set()
};

function updateUserData(type, value) {
    userData[type] = value;
    document.querySelectorAll(`[data-${type}]`).forEach(el => {
        el.textContent = type === 'coins' ? `${value}c` : value;
    });
    if(type === 'xp') document.querySelector('.progress').style.width = `${Math.min(value, 100)}%`;
}

function initUserData() {
    updateUserData('name', 'Ник');
    updateUserData('xp', 80);
    updateUserData('level', 10);
    updateUserData('coins', 2000);
}
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = "main";
        window.history.pushState({ route: this.currentRoute }, '', `#${this.currentRoute}`);
        window.addEventListener("popstate", (e) => {
            if (e.state) this.showPage(e.state.route, false);
        });
        document.querySelectorAll('.page').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.active').forEach(el => {
            el.style.display = 'block';
        });
    }

    addRoute(name, element) {
        this.routes[name] = element;
    }

    async showPage(routeName, pushState = true) {
        if (routeName === this.currentRoute) return;

        const newPage = this.routes[routeName];
        const oldPage = this.routes[this.currentRoute];
        const backButton = document.querySelector('.header__back');
        const displayCoins = document.querySelector('.header__coins');

        if (!newPage) return;
        newPage.style.display = 'block';
        if (oldPage) {
            if (!pushState) oldPage.style.transform = "translateX(30%)";
            else oldPage.style.transform = "translateX(-30%)";
            oldPage.style.opacity = "0";
            await new Promise((r) => setTimeout(r, 300));
            oldPage.classList.remove("active");
            oldPage.style.display = 'none';
        }

        newPage.style.transform = 'translateX(30%)';
        newPage.style.opacity = '0';
        newPage.classList.add('active');
        
        displayCoins.style.display = routeName === "shop" || routeName === "item" ? "flex" : "none";
        backButton.style.display = routeName === "main" ? "none" : "flex";
        backButton.setAttribute('data-navigate', this.currentRoute);
        
        requestAnimationFrame(() => {
            newPage.style.transform = "translateX(0)";
            newPage.style.opacity = "1";
        });

        if (pushState) window.history.pushState({ route: routeName }, '', `#${routeName}`);
        this.currentRoute = routeName;
    }
    back() {
        window.history.back();
    }
}
function createMissionElement(text, isActive = false) {
    const mission = document.createElement('div');
    mission.className = 'mission-item';
    mission.innerHTML = `
        ${text} 
        <input type="checkbox" ${isActive ? 'checked' : ''}>
    `;
    
    mission.addEventListener('click', (e) => {
        if(e.target.tagName !== 'INPUT') toggleMissionCompletion(text);
        else updateActiveMissions()
    });
    return mission;
}

function toggleMissionCompletion(text) {
    Array.from(document.querySelectorAll('.mission-item')).filter(item => item.textContent.trim() === text.trim()).forEach(mission => {
        if(mission.classList.contains('completed')) {
            mission.classList.remove('completed');
            userData.completedMissions.delete(text);
        } else {
            mission.classList.add('completed');
            userData.completedMissions.add(text);
        }
    });
}

function updateActiveMissions() {
    const mainMissions = document.querySelector('#main .missions-grid');
    mainMissions.innerHTML = '';
    
    Array.from(userData.activeMissions).forEach(text => {
        mission = createMissionElement(text, true);
        if (userData.completedMissions.has(text)) mission.classList.add('completed');
        mainMissions.appendChild(mission);
    });
}

function loadMissions() {
    const soloMissions = [
        "Попить воды 1 раз - 100xp",
        "Попить воды 2 раза - 150xp",
        "Попить воды 3 раза - 200xp",
        "Попить воды 4 раза - 250xp"
    ];
    const teamMissions = [
        "Обпейся воды - 1000xp",
        "Обпейся воды - 1500xp",
        "Обпейся воды - 2000xp"
    ];
    const ownMissions = [
        "Подтянуться 1 раз - 100xp",
        "Отжаться 1 раз - 100xp", 
        "Проснуться вовремя 1 раз - 1000xp"
    ];

    container = document.querySelector('#solo-missions');
    soloMissions.forEach((m) => {
        mission = createMissionElement(m, userData.activeMissions.has(m));
        container.appendChild(mission);
    });

    container = document.querySelector('#team-missions');
    teamMissions.forEach((m) => {
        mission = createMissionElement(m, userData.activeMissions.has(m));
        container.appendChild(mission);
    });

    container = document.querySelector('#own-missions');
    ownMissions.forEach((m) => {
        mission = createMissionElement(m, userData.activeMissions.has(m));
        container.appendChild(mission);
    });

    const mainMissions = document.querySelector('#main .missions-grid');
    mainMissions.innerHTML = '';
    Array.from(userData.activeMissions).forEach(text => {
        mission = createMissionElement(text, true);
        mainMissions.appendChild(mission);
    });
}

loadMissions();
updateActiveMissions();

document.querySelectorAll('.mission-item input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        const missionText = e.target.parentElement.textContent.trim();
        if(e.target.checked) {
            if(userData.activeMissions.size >= 4) {
                e.target.checked = false;
                if (!notified) {
                    notified = true;
                    new Notification(`Максимум ${userData.activeMissions.size} активные миссии!`).show();
                    setTimeout(() => {
                        notified = false;
                    }, 1200);
                }
                return;
            }
            userData.activeMissions.add(missionText);
        } else userData.activeMissions.delete(missionText);
        updateActiveMissions();
    });
});
const router = new Router();
document.querySelectorAll('.page').forEach(page => {
    router.addRoute(page.id, page);
});

document.querySelectorAll("[data-navigate]").forEach((link) => {
    if (!link.classList.contains("header__back")) {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = link.getAttribute("data-navigate");
            router.showPage(target);
        });
    }
});
document.querySelector('.header__back').addEventListener('click', () => router.back());

document.addEventListener("DOMContentLoaded", () => {
    initUserData();
    
    document.querySelectorAll('.item-placeholder').forEach(item => {
        if(userData.purchasedItems.has(item.name)) {
            item.innerHTML += `<div class="purchased-overlay">Куплено</div>`;
            item.style.pointerEvents = 'none';
        }
    });
    if (!window.Telegram.WebApp || !window.Telegram.WebApp.initData) {
        console.error("Откройте приложение через Telegram!");
        mainPic = document.getElementById("profile-pic");
        profilePic = document.getElementById("profile-pic-large");
        mainPic.style.backgroundImage = `url(data/avatar.png)`;
        profilePic.style.backgroundImage = `url(data/avatar.png)`;
        return;
    }

    const initData = new URLSearchParams(window.Telegram.WebApp.initData);
    const user = JSON.parse(decodeURIComponent(initData.get("user") || "{}"));
    if (!user.id) {
        console.error("Пользователь не авторизован");
        return;
    }
    Telegram.WebApp.expand();
    const nameValue = document.getElementById("header-name");
    nameValue.textContent = user.username;
    mainPic = document.getElementById("profile-pic");
    profilePic = document.getElementById("profile-pic-large");
    mainPic.style.backgroundImage = `url(${user.photo_url})`;
    profilePic.style.backgroundImage = `url(${user.photo_url})`;

    const theme = window.Telegram.WebApp.themeParams;
    const primaryColor = theme.secondary_bg_color || "#4e0000";
    const accentColor = theme.button_color || "#ff1a1a";
    document.documentElement.style.setProperty("--secondary", primaryColor);
    document.documentElement.style.setProperty("--accent", accentColor);
});
window.addEventListener("load", () => {
    setTimeout(() => {
        document.querySelector(".preloader").style.opacity = "0";
        setTimeout(() => {
            document.querySelector(".preloader").remove();
        }, 500);
        }, 500);
    });

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth",
        });
    });
});

document.querySelectorAll(".mission-item").forEach((item) => {
    item.addEventListener("click", () => {
        item.style.transform = "scale(0.98)";
        setTimeout(() => (item.style.transform = ""), 200);
    });
});

document.querySelectorAll("input").forEach((input) => {
    input.setAttribute("aria-label", "Статус выполнения");
});

const fruits = [
    { name: "Apple", price: 200 },
    { name: "Banana", price: 100 },
    { name: "Orange", price: 250 },
    { name: "Grape", price: 400 },
    { name: "Strawberry", price: 500 },
    { name: "Blueberry", price: 550 },
    { name: "Raspberry", price: 700 },
    { name: "Pineapple", price: 800 },
    { name: "Mango", price: 900 },
    { name: "Peach", price: 1000 },
    { name: "Pear", price: 1100 },
    { name: "Plum", price: 1200 },
    { name: "Cherry", price: 1300 },
    { name: "Kiwi", price: 1400 },
    { name: "Lemon", price: 1500 },
    { name: "Lime", price: 1600 },
    { name: "Grapefruit", price: 1700 },
    { name: "Watermelon", price: 1800 },
    { name: "Cantaloupe", price: 1900 },
    { name: "Honeydew", price: 2000 },
];

function getSeed() {
    return Math.floor(Date.now() / 86400000);
}

function createRandom(seed) {
    let x = seed;
    return () => {
        x = (1664525 * x + 1013904223) % 4294967296;
        return x / 4294967296;
    };
}

function shuffleArray(array, randomFunc) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(randomFunc() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initializeItems() {
    const seed = getSeed();
    const seededRandom = createRandom(seed);
    const shuffledFruits = shuffleArray([...fruits], seededRandom);
    const selectedFruits = shuffledFruits.slice(0, 20);
    const allItemsDiv = document.getElementById("all-items");
    selectedFruits.forEach((fruit) => {
        const item = document.createElement("div");
        item.className = "item-placeholder";
        item.style.backgroundImage = `url('data/${fruit.name}.png')`;
        item.style.backgroundSize = "cover";
        item.style.backgroundPosition = "center";
        item.name = fruit.name;
        item.price = fruit.price;
        item.innerHTML = `<div class="price-tag">${fruit.price}c</div>`;
        allItemsDiv.appendChild(item);
    });
    const mainSalesDiv = document.getElementById("main-sales");
    const salesFruits = shuffleArray([...fruits], seededRandom).slice(0, 3);
    salesFruits.forEach((fruit) => {
        const item = document.createElement("div");
        item.className = "item-placeholder";
        item.style.backgroundImage = `url('data/${fruit.name}.png')`;
        item.style.backgroundSize = "cover";
        item.style.backgroundPosition = "center";
        item.name = fruit.name;
        item.price = fruit.price;
        item.innerHTML = `<div class="price-tag">${fruit.price}c</div>`;
        mainSalesDiv.appendChild(item);
    });
}
initializeItems();

document.querySelectorAll(".item-placeholder").forEach((item) => {
    item.addEventListener("click", () => {
        document.getElementById("showcase-name").textContent = item.name;
        document.getElementById("showcase-price").textContent = item.price;
        document.getElementById("showcase-image").style.backgroundImage =
            item.style.backgroundImage;
        router.showPage("item");
    });
});

const now = Date.now() / 1000;
const canvas = document.getElementById("sandCanvas");
const ctx = canvas.getContext("2d");
let notified = false;
canvas.width = 300;
canvas.height = 300;
ctx.beginPath();
ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 -7, 0, Math.PI * 2);
ctx.clip();

class Grain {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 1.5 + 0.5;
        this.color = "rgba(250, 232, 185, 0.9)";
    }
    update() {
        this.y -= this.speedY;
        if (this.y < 0) this.y = canvas.height;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
const grains = [];
for (let i = 0; i < 100; i++) {
    grains.push(new Grain());
}
function rotateHands() {
    if (!document.getElementById("hourHand")) return;
    const now1 = Date.now() / 1000;
    const secAngle = (((now1 - now) * Math.PI) / 2) % (Math.PI * 4); // 2-second rotation
    document.getElementById("hourHand").style.transform = `rotate(${secAngle}rad)`;
    document.getElementById("minuteHand").style.transform = `rotate(${
        secAngle * 0.5
    }rad)`;
}
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grains.forEach((grain) => {
        grain.update();
        grain.draw();
    });
    if (!document.getElementById("hourHand")) return;
    rotateHands();
    requestAnimationFrame(animate);
}
animate();

document.querySelector('.buy-button').addEventListener('click', () => {
    const price = parseInt(document.getElementById('showcase-price').textContent);
    const itemName = document.getElementById('showcase-name').textContent;
    
    if(userData.coins >= price && !userData.purchasedItems.has(itemName)) {
        userData.coins -= price;
        userData.purchasedItems.add(itemName);
        updateUserData('coins', userData.coins);
        new Notification('Покупка успешна!').show();
    } else {
        new Notification('Недостаточно монет!').show();
        return
    }
    document.querySelectorAll('.item-placeholder').forEach(item => {
        if(item.name === itemName) {
            item.replaceChildren();
            item.innerHTML += `<div class="purchased-overlay"><b>Куплено</b></div>`;
            item.style.pointerEvents = 'none';
        }
    });

    const avatars = document.querySelectorAll('.avatar-item');
    avatars.forEach(avatar => {
        avatar.style.backgroundImage = `url('data/${itemName}.png')`;
        avatar.style.border = `2px solid var(--secondary)`;
    });
});
class Notification {
    constructor(text) {
        this.el = document.createElement('div');
        this.el.className = 'notification';
        this.el.textContent = text;
        document.body.appendChild(this.el);
    }
    
    show() {
        setTimeout(() => this.el.remove(), 1200);
    }
}