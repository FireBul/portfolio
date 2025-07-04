/**
 * 최원혁 Portfolio Website - Main JavaScript
 * 모든 페이지에서 공통으로 사용되는 JavaScript 기능들
 */

// ===================================
// 메인 애플리케이션 클래스
// ===================================

class PortfolioApp {
    constructor() {
        this.nav = document.querySelector('.main-nav');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.header = document.querySelector('.site-header');
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupSmoothScroll();
        this.setupScrollAnimations();
        this.setupImageLazyLoading();
        this.setupHoverEffects();
        this.setupKeyboardNavigation();
    }
    
    // ===================================
    // 네비게이션 기능
    // ===================================
    
    setupNavigation() {
        // 모바일 메뉴 토글
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // 메뉴 항목 클릭 시 모바일 메뉴 닫기
        if (this.navMenu) {
            this.navMenu.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    this.closeMobileMenu();
                }
            });
        }
        
        // 스크롤 시 헤더 스타일 변경
        window.addEventListener('scroll', () => {
            this.handleHeaderScroll();
        });
        
        // 모바일 메뉴 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!this.nav.contains(e.target) && this.navMenu.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });
    }
    
    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        
        // 아이콘 변경
        if (this.navToggle) {
            this.navToggle.textContent = this.navMenu.classList.contains('active') ? '✕' : '☰';
        }
        
        // 접근성을 위한 aria 속성 업데이트
        const isExpanded = this.navMenu.classList.contains('active');
        this.navToggle.setAttribute('aria-expanded', isExpanded);
    }
    
    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        if (this.navToggle) {
            this.navToggle.textContent = '☰';
            this.navToggle.setAttribute('aria-expanded', 'false');
        }
    }
    
    handleHeaderScroll() {
        if (window.scrollY > 100) {
            this.header.style.background = 'rgba(255, 255, 255, 0.98)';
            this.header.classList.add('scrolled');
        } else {
            this.header.style.background = 'rgba(255, 255, 255, 0.95)';
            this.header.classList.remove('scrolled');
        }
    }
    
    // ===================================
    // 스무스 스크롤
    // ===================================
    
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    const headerHeight = this.header?.offsetHeight || 80;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // ===================================
    // 스크롤 애니메이션
    // ===================================
    
    setupScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // 애니메이션 대상 요소들 관찰
        const animateElements = document.querySelectorAll(
            '.project-card, .stat-card, .timeline-item, .gallery-item, ' +
            '.competence-card, .contact-item, .social-link, .collaboration-card'
        );
        
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
    
    // ===================================
    // 이미지 지연 로딩
    // ===================================
    
    setupImageLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            // 브라우저가 네이티브 지연 로딩을 지원하는 경우
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        } else {
            // 폴백: Intersection Observer 사용
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                        }
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    // ===================================
    // 호버 효과
    // ===================================
    
    setupHoverEffects() {
        // 카드 호버 효과
        const cards = document.querySelectorAll(
            '.project-card, .contact-item, .social-link, .collaboration-card, ' +
            '.gallery-item, .competence-card, .stat-card'
        );
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!card.classList.contains('no-hover')) {
                    card.style.transform = 'translateY(-4px) scale(1.02)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // 버튼 호버 효과
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (btn.classList.contains('btn-primary')) {
                    btn.style.transform = 'translateY(-2px)';
                }
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });
    }
    
    // ===================================
    // 키보드 네비게이션
    // ===================================
    
    setupKeyboardNavigation() {
        // ESC 키로 모바일 메뉴 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navMenu.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });
        
        // Tab 키 접근성 개선
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
}

// ===================================
// 프로젝트 페이지 필터링 기능
// ===================================

class ProjectFilter {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.projectCards = document.querySelectorAll('.project-card');
        
        if (this.filterButtons.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleFilter(button);
            });
        });
    }
    
    handleFilter(activeButton) {
        // 활성 버튼 변경
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
        
        const filterValue = activeButton.getAttribute('data-filter');
        
        // 프로젝트 카드 필터링
        this.projectCards.forEach(card => {
            const shouldShow = filterValue === 'all' || 
                             card.getAttribute('data-category') === filterValue;
            
            if (shouldShow) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease-in-out';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// ===================================
// FAQ 아코디언 기능
// ===================================

class FAQAccordion {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        
        if (this.faqItems.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            // 초기 상태 설정
            if (answer) {
                answer.style.display = 'none';
            }
            
            if (question) {
                question.addEventListener('click', () => {
                    this.toggleFAQ(item, answer);
                });
            }
        });
    }
    
    toggleFAQ(item, answer) {
        const isActive = item.classList.contains('active');
        
        // 모든 FAQ 아이템 닫기
        this.faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            if (otherAnswer) {
                otherAnswer.style.display = 'none';
            }
        });
        
        // 현재 아이템 토글
        if (!isActive && answer) {
            item.classList.add('active');
            answer.style.display = 'block';
        }
    }
}

// ===================================
// 폼 유효성 검사
// ===================================

class FormValidator {
    constructor() {
        this.forms = document.querySelectorAll('form');
        
        if (this.forms.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
        });
        
        // 실시간 유효성 검사
        const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }
    
    validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        
        if (!value) {
            this.showFieldError(field, '이 필드는 필수입니다.');
            return false;
        }
        
        // 이메일 유효성 검사
        if (field.type === 'email' && !this.isValidEmail(value)) {
            this.showFieldError(field, '올바른 이메일 주소를 입력해주세요.');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }
    
    showFieldError(field, message) {
        field.style.borderColor = '#ef4444';
        
        // 에러 메시지 표시 (선택사항)
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            errorElement.style.color = '#ef4444';
            errorElement.style.fontSize = '0.875rem';
            errorElement.style.marginTop = '0.25rem';
            errorElement.style.display = 'block';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
    
    clearFieldError(field) {
        field.style.borderColor = 'var(--border)';
        
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// ===================================
// 성능 최적화 유틸리티
// ===================================

class PerformanceOptimizer {
    static init() {
        this.setupCriticalResourceHints();
        this.trackWebVitals();
        this.optimizeImages();
    }
    
    static setupCriticalResourceHints() {
        // 중요한 리소스 프리로드
        const criticalImages = [
            'assets/images/profile.jpg',
            'assets/images/hero-photo.jpg'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = src;
            link.as = 'image';
            document.head.appendChild(link);
        });
    }
    
    static trackWebVitals() {
        // Web Vitals 측정 (실제 환경에서는 analytics 서비스로 전송)
        if ('web-vitals' in window) {
            const { getCLS, getFID, getFCP, getLCP, getTTFB } = window['web-vitals'];
            
            function sendToAnalytics(metric) {
                console.log(`${metric.name}: ${metric.value}`);
                // 실제로는 Google Analytics 등으로 전송
                // gtag('event', metric.name, { value: metric.value });
            }
            
            getCLS(sendToAnalytics);
            getFID(sendToAnalytics);
            getFCP(sendToAnalytics);
            getLCP(sendToAnalytics);
            getTTFB(sendToAnalytics);
        }
    }
    
    static optimizeImages() {
        // WebP 지원 확인 및 이미지 최적화
        const supportsWebP = () => {
            return new Promise((resolve) => {
                const webP = new Image();
                webP.onload = webP.onerror = () => {
                    resolve(webP.height === 2);
                };
                webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
            });
        };
        
        supportsWebP().then(supported => {
            if (supported) {
                document.body.classList.add('webp-supported');
            }
        });
    }
}

// ===================================
// 다크 모드 토글 (선택사항)
// ===================================

class DarkModeToggle {
    constructor() {
        this.darkModeKey = 'portfolio-dark-mode';
        this.isDarkMode = localStorage.getItem(this.darkModeKey) === 'true';
        
        this.init();
    }
    
    init() {
        // 초기 다크 모드 설정 적용
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // 다크 모드 토글 버튼이 있다면 이벤트 리스너 추가
        const toggleButton = document.querySelector('.dark-mode-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                this.toggle();
            });
        }
    }
    
    toggle() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        localStorage.setItem(this.darkModeKey, this.isDarkMode.toString());
    }
}

// ===================================
// 초기화
// ===================================

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 메인 애플리케이션 초기화
    new PortfolioApp();
    
    // 페이지별 기능 초기화
    new ProjectFilter();
    new FAQAccordion();
    new FormValidator();
    
    // 성능 최적화 적용
    PerformanceOptimizer.init();
    
    // 다크 모드 (선택사항)
    // new DarkModeToggle();
    
    console.log('Portfolio website initialized successfully! 🚀');
});

// 서비스 워커 등록 (PWA 기능, 선택사항)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// ===================================
// 유틸리티 함수들
// ===================================

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 스로틀 함수
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 요소가 뷰포트에 있는지 확인
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// 부드러운 스크롤 유틸리티
function smoothScrollTo(element, duration = 1000) {
    const targetPosition = element.offsetTop - (document.querySelector('.site-header')?.offsetHeight || 80);
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

// 전역 유틸리티 객체
window.PortfolioUtils = {
    debounce,
    throttle,
    isInViewport,
    smoothScrollTo
};