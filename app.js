class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = 'main';
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
        if (routeName === this.currentRoute) return;

        const newPage = this.routes[routeName];
        const oldPage = this.routes[this.currentRoute];
        
        if (!newPage) return;
        window.scroll(0, 0);
        if (oldPage) {
            oldPage.style.transform = 'translateX(-100%)';
            oldPage.style.opacity = '0';
            
            await new Promise(r => setTimeout(r, 400));
            oldPage.classList.remove('active');
        }

        newPage.style.transform = 'translateX(100%)';
        newPage.style.opacity = '0';
        newPage.classList.add('active');
        
        this.updateHeader(routeName);
        
        requestAnimationFrame(() => {
            newPage.style.transform = 'translateX(0)';
            newPage.style.opacity = '1';
        });

        if (pushState) {
            this.history.push({ route: routeName });
            this.currentIndex++;
            window.history.pushState({ route: routeName }, '', `#${routeName}`);
        }
        
        this.currentRoute = routeName;
    }

    updateHeader(routeName) {
        const backButton = document.querySelector('.header__back');
        const isMainPage = routeName === 'main';
        backButton.style.display = isMainPage ? 'none' : 'flex';
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
router.updateHeader('main');

document.querySelector('.header__back').addEventListener('click', () => {
    router.back();
});

window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelector('.preloader').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.preloader').style.display = 'none';
        }, 500);
    }, 500);
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

document.querySelectorAll('.mission-item').forEach(item => {
    item.addEventListener('click', () => {
        item.style.transform = 'scale(0.98)';
        setTimeout(() => item.style.transform = '', 200);
    });
});

document.querySelectorAll('input').forEach(input => {
    input.setAttribute('aria-label', 'Статус выполнения');
});
