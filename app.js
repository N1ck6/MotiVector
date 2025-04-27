class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = "main";
        
        window.addEventListener("popstate", (e) => {
            if (e.state) this.showPage(e.state.route, false);
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

        if (!newPage) return;
        if (oldPage) {
            if (!pushState) oldPage.style.transform = "translateX(30%)";
            else oldPage.style.transform = "translateX(-30%)";
            oldPage.style.opacity = "0";
            await new Promise((r) => setTimeout(r, 300));
            oldPage.classList.remove("active");
        }

        newPage.style.transform = 'translateX(30%)';
        newPage.style.opacity = '0';
        newPage.classList.add('active');
        
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
    if (!window.Telegram.WebApp || !window.Telegram.WebApp.initData) {
        console.error("Откройте приложение через Telegram!");
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
    mainPic.style = "";
    mainPic.style.backgroundImage = `url(${user.photo_url})`;
    profilePic.style = "";
    profilePic.style.backgroundImage = `url(${user.photo_url})`;
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
    const selectedFruits = shuffledFruits.slice(0, 12);
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
