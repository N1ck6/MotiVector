class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.history = [];
        this.currentIndex = -1;
        
        window.addEventListener('hashchange', () => this.parseHash());
        window.addEventListener('popstate', (e) => {
            if (e.state) {
                this.showPage(e.state.route, false);
            }
        });
    }

    addRoute(name, element) {
        this.routes[name] = element;
    }

    parseHash() {
        const hash = window.location.hash.slice(1) || 'main';
        this.showPage(hash);
    }

    async showPage(routeName, pushState = true) {
        const newPage = this.routes[routeName];
        if (!newPage || newPage === this.currentRoute) return;

        // Анимация выхода
        if (this.currentRoute) {
            const oldPage = this.routes[this.currentRoute];
            oldPage.classList.remove('active');
            oldPage.classList.add('slide-exit');
            
            await new Promise(r => setTimeout(r, 300));
            oldPage.classList.remove('slide-exit');
        }

        // Анимация входа
        newPage.classList.add('slide-enter');
        newPage.classList.add('active');
        
        setTimeout(() => {
            newPage.classList.remove('slide-enter');
        }, 100);

        this.currentRoute = routeName;
        if (pushState) {
            this.history = this.history.slice(0, this.currentIndex + 1);
            this.history.push({ route: routeName });
            this.currentIndex++;
            window.history.pushState({ route: routeName }, '', `#${routeName}`);
        }
    }

    back() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            const prevState = this.history[this.currentIndex];
            this.showPage(prevState.route, false);
            window.history.back();
        }
    }
}

// Инициализация роутера
const router = new Router();
document.querySelectorAll('.page').forEach(page => {
    router.addRoute(page.id, page);
});

document.querySelectorAll('[data-navigate]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-navigate');
        router.showPage(target);
    });
});

// Дополнительные настройки
document.querySelector('.header__back').addEventListener('click', () => {
    router.back();
});

// Preloader
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelector('.preloader').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.preloader').style.display = 'none';
        }, 500);
    }, 500);
});

// Плавный скролл
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Micro-interactions
document.querySelectorAll('.mission-item').forEach(item => {
    item.addEventListener('click', () => {
        item.style.transform = 'scale(0.98)';
        setTimeout(() => item.style.transform = '', 200);
    });
});

// Доступность
document.querySelectorAll('input').forEach(input => {
    input.setAttribute('aria-label', 'Статус выполнения');
});