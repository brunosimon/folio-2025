/* ============================================
   Portfolio JavaScript - Enhanced Visual Effects
   ============================================ */

'use strict';

// ================================
// DOM Elements
// ================================
const DOM = {
    // Canvas
    particlesCanvas: document.getElementById('particles-canvas'),
    
    // Weather
    rainContainer: document.getElementById('rain-container'),
    snowContainer: document.getElementById('snow-container'),
    weatherBtns: document.querySelectorAll('.weather-btn'),
    
    // Navigation
    navToggle: document.querySelector('.nav-toggle'),
    navLinks: document.querySelector('.nav-links'),
    navLinksItems: document.querySelectorAll('.nav-link'),
    mobileMenu: document.querySelector('.mobile-menu'),
    mobileNavLinks: document.querySelectorAll('.mobile-nav-link'),
    navigation: document.querySelector('.navigation'),
    
    // Content
    projectsShowcase: document.getElementById('projects-showcase'),
    labGrid: document.getElementById('lab-grid'),
    socialGrid: document.getElementById('social-grid'),
    skillsCloud: document.getElementById('skills-cloud'),
    
    // Form
    contactForm: document.getElementById('contact-form'),
    
    // Stats
    statNumbers: document.querySelectorAll('[data-count]'),
    cardNumbers: document.querySelectorAll('.card-number[data-count]'),
    
    // Cursor
    cursorFollower: document.querySelector('.cursor-follower'),
    cursorDot: document.querySelector('.cursor-dot'),
    cursorRing: document.querySelector('.cursor-ring'),
    
    // 3D Elements
    cube: document.querySelector('.cube'),
    heroSection: document.querySelector('.hero-section'),
    
    // Sections
    sections: document.querySelectorAll('.section'),
    
    // Interactive elements
    interactiveElements: document.querySelectorAll('a, button, .lab-card, .project-card-large, .stat-card, .social-link-card')
};

// ================================
// State
// ================================
const state = {
    currentWeather: 'clear',
    mousePosition: { x: 0, y: 0 },
    targetMousePosition: { x: 0, y: 0 },
    scrollPosition: 0,
    isScrolling: false,
    particles: [],
    rainDrops: [],
    snowFlakes: []
};

// ================================
// Skills Data
// ================================
const skills = [
    'WebGL', 'Three.js', 'WebGPU', 'JavaScript', 'TypeScript',
    'GSAP', 'Shaders', '3D Design', 'Physics', 'React',
    'CSS Animation', 'Canvas API', 'Web Audio API', 'Performance',
    'Web Animation API', 'SVG Animation', 'Rapier Physics',
    'OGL', 'Cannon.js', 'Vite', 'npm', 'Git'
];

// ================================
// Initialization
// ================================
document.addEventListener('DOMContentLoaded', init);

function init() {
    console.log('🚀 Portfolio Initialized');
    
    // Setup particles
    setupParticles();
    
    // Setup cursor follower
    setupCursorFollower();
    
    // Setup weather effects
    setupWeatherEffects();
    
    // Setup navigation
    setupNavigation();
    
    // Setup scroll effects
    setupScrollEffects();
    
    // Setup 3D cube mouse follow
    setup3DEffects();
    
    // Render content
    renderProjects();
    renderLabProjects();
    renderSocialLinks();
    renderSkills();
    
    // Setup intersection observer
    setupIntersectionObserver();
    
    // Setup form handling
    setupFormHandling();
    
    // Setup interactive elements
    setupInteractiveElements();
    
    // Setup keyboard navigation
    setupKeyboardNavigation();
    
    // Start animation loop
    requestAnimationFrame(animate);
}

// ================================
// Particle System (Inspired by original project)
// ================================
function setupParticles() {
    if (!DOM.particlesCanvas) return;
    
    const canvas = DOM.particlesCanvas;
    const ctx = canvas.getContext('2d');
    
    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create particles
    const particleCount = 80;
    state.particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        state.particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            color: getRandomParticleColor()
        });
    }
    
    function getRandomParticleColor() {
        const colors = [
            'rgba(255, 206, 202, ',
            'rgba(255, 135, 162, ',
            'rgba(107, 230, 255, ',
            'rgba(179, 136, 255, '
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Mouse influence
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Animation function
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        state.particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Mouse influence
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const force = (150 - distance) / 150;
                particle.x -= dx * force * 0.02;
                particle.y -= dy * force * 0.02;
            }
            
            // Wrap around screen
            if (particle.x < -50) particle.x = canvas.width + 50;
            if (particle.x > canvas.width + 50) particle.x = -50;
            if (particle.y < -50) particle.y = canvas.height + 50;
            if (particle.y > canvas.height + 50) particle.y = -50;
            
            // Draw connections
            state.particles.forEach((otherParticle, otherIndex) => {
                if (index === otherIndex) return;
                
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.strokeStyle = `rgba(255, 206, 202, ${(1 - dist / 120) * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color + particle.opacity + ')';
            ctx.fill();
            
            // Glow effect
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = particle.color + (particle.opacity * 0.3) + ')';
            ctx.fill();
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

// ================================
// Custom Cursor Follower
// ================================
function setupCursorFollower() {
    if (!DOM.cursorFollower || window.innerWidth <= 1024) return;
    
    const cursorDot = DOM.cursorDot;
    const cursorRing = DOM.cursorRing;
    
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;
    
    document.addEventListener('mousemove', (e) => {
        state.targetMousePosition.x = e.clientX;
        state.targetMousePosition.y = e.clientY;
    });
    
    // Smooth follow animation
    function updateCursor() {
        // Dot follows directly
        dotX = state.targetMousePosition.x;
        dotY = state.targetMousePosition.y;
        
        // Ring follows with delay
        ringX += (state.targetMousePosition.x - ringX) * 0.15;
        ringY += (state.targetMousePosition.y - ringY) * 0.15;
        
        if (cursorDot) {
            cursorDot.style.left = dotX + 'px';
            cursorDot.style.top = dotY + 'px';
        }
        
        if (cursorRing) {
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
        }
        
        requestAnimationFrame(updateCursor);
    }
    
    updateCursor();
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        DOM.cursorFollower.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        DOM.cursorFollower.style.opacity = '1';
    });
}

// ================================
// Weather Effects (Inspired by original project)
// ================================
function setupWeatherEffects() {
    if (!DOM.weatherBtns) return;
    
    DOM.weatherBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const weather = btn.dataset.weather;
            setWeather(weather);
            
            // Update active state
            DOM.weatherBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function setWeather(weather) {
    state.currentWeather = weather;
    
    // Clear all effects
    if (DOM.rainContainer) DOM.rainContainer.classList.remove('active');
    if (DOM.snowContainer) DOM.snowContainer.classList.remove('active');
    
    // Clear existing particles
    state.rainDrops = [];
    state.snowFlakes = [];
    
    switch (weather) {
        case 'rain':
            createRainEffect();
            break;
        case 'snow':
            createSnowEffect();
            break;
        case 'clear':
        default:
            break;
    }
}

function createRainEffect() {
    if (!DOM.rainContainer) return;
    
    DOM.rainContainer.classList.add('active');
    DOM.rainContainer.innerHTML = '';
    
    const dropCount = 100;
    
    for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
        drop.style.animationDelay = Math.random() * 2 + 's';
        drop.style.opacity = Math.random() * 0.5 + 0.3;
        DOM.rainContainer.appendChild(drop);
    }
}

function createSnowEffect() {
    if (!DOM.snowContainer) return;
    
    DOM.snowContainer.classList.add('active');
    DOM.snowContainer.innerHTML = '';
    
    const flakeCount = 60;
    const snowChars = ['❄', '❅', '❆', '✻', '✼'];
    
    for (let i = 0; i < flakeCount; i++) {
        const flake = document.createElement('div');
        flake.className = 'snow-flake';
        flake.textContent = snowChars[Math.floor(Math.random() * snowChars.length)];
        flake.style.left = Math.random() * 100 + '%';
        flake.style.fontSize = (Math.random() * 16 + 8) + 'px';
        flake.style.animationDuration = (Math.random() * 5 + 5) + 's';
        flake.style.animationDelay = Math.random() * 5 + 's';
        flake.style.opacity = Math.random() * 0.5 + 0.3;
        DOM.snowContainer.appendChild(flake);
    }
}

// ================================
// Navigation
// ================================
function setupNavigation() {
    // Mobile toggle
    if (DOM.navToggle && DOM.mobileMenu) {
        DOM.navToggle.addEventListener('click', () => {
            DOM.navToggle.classList.toggle('is-active');
            DOM.mobileMenu.classList.toggle('is-open');
            document.body.style.overflow = DOM.mobileMenu.classList.contains('is-open') ? 'hidden' : '';
        });
    }
    
    // Nav links - desktop
    setupNavLinks(DOM.navLinksItems);
    
    // Nav links - mobile
    setupNavLinks(DOM.mobileNavLinks);
}

function setupNavLinks(links) {
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.dataset.section;
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                smoothScrollTo(targetElement);
                
                // Update active state
                updateActiveNavLink(targetId);
                
                // Close mobile menu if open
                if (DOM.mobileMenu && DOM.mobileMenu.classList.contains('is-open')) {
                    DOM.navToggle.classList.remove('is-active');
                    DOM.mobileMenu.classList.remove('is-open');
                    document.body.style.overflow = '';
                }
            }
        });
    });
}

function updateActiveNavLink(activeId) {
    // Desktop
    DOM.navLinksItems.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === activeId) {
            link.classList.add('active');
        }
    });
    
    // Mobile
    DOM.mobileNavLinks.forEach(link => {
        link.style.color = 'var(--text-faded)';
        if (link.dataset.section === activeId) {
            link.style.color = 'var(--accent-primary)';
        }
    });
}

function smoothScrollTo(element) {
    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// ================================
// Scroll Effects
// ================================
function setupScrollEffects() {
    let lastScroll = 0;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        state.scrollPosition = window.pageYOffset;
        
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
}

function handleScroll() {
    const currentScroll = state.scrollPosition;
    
    // Nav background
    if (DOM.navigation) {
        if (currentScroll > 50) {
            DOM.navigation.classList.add('scrolled');
        } else {
            DOM.navigation.classList.remove('scrolled');
        }
    }
    
    // Update active nav link based on scroll position
    updateActiveNavFromScroll();
    
    // Parallax effect for hero elements
    handleParallax();
}

function updateActiveNavFromScroll() {
    const sections = ['hero', 'projects', 'lab', 'about', 'contact'];
    
    for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (!section) continue;
        
        const rect = section.getBoundingClientRect();
        if (rect.top <= 200 && rect.bottom >= 200) {
            updateActiveNavLink(sections[i]);
            break;
        }
    }
}

function handleParallax() {
    const scrollY = state.scrollPosition;
    
    // Glow orbs parallax
    const orbs = document.querySelectorAll('.glow-orb');
    orbs.forEach((orb, index) => {
        const speed = 0.1 + (index * 0.05);
        orb.style.transform = `translate(${scrollY * speed * 0.5}px, ${scrollY * speed}px)`;
    });
    
    // Hero 3D elements
    if (DOM.heroSection) {
        const heroRect = DOM.heroSection.getBoundingClientRect();
        if (heroRect.bottom > 0) {
            const progress = Math.max(0, Math.min(1, -heroRect.top / (window.innerHeight * 0.5)));
            
            const hero3D = document.querySelector('.hero-3d-decoration');
            if (hero3D) {
                hero3D.style.transform = `translateY(${progress * 100}px)`;
                hero3D.style.opacity = 1 - progress;
            }
            
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.transform = `translateY(${progress * 50}px)`;
                heroContent.style.opacity = 1 - progress * 0.5;
            }
        }
    }
}

// ================================
// 3D Effects
// ================================
function setup3DEffects() {
    if (!DOM.heroSection || !DOM.cube) return;
    
    let targetRotationX = -20;
    let targetRotationY = 0;
    let currentRotationX = -20;
    let currentRotationY = 0;
    
    DOM.heroSection.addEventListener('mousemove', (e) => {
        const rect = DOM.heroSection.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        targetRotationY = x * 30;
        targetRotationX = -20 + y * 20;
    });
    
    function update3DRotation() {
        // Smooth interpolation
        currentRotationX += (targetRotationX - currentRotationX) * 0.08;
        currentRotationY += (targetRotationY - currentRotationY) * 0.08;
        
        if (DOM.cube) {
            DOM.cube.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
        }
        
        // Floating shapes
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const offset = index * 10;
            shape.style.transform = `translate(${Math.sin(Date.now() / 1000 + offset) * 10}px, ${Math.cos(Date.now() / 1500 + offset) * 15}px)`;
        });
        
        requestAnimationFrame(update3DRotation);
    }
    
    update3DRotation();
}

// ================================
// Render Content
// ================================
function renderProjects() {
    if (!DOM.projectsShowcase || !window.projectsData) return;
    
    DOM.projectsShowcase.innerHTML = window.projectsData.map((project, index) => {
        const distinctions = project.distinctions.map(d => 
            `<span class="award-badge ${d}">${getAwardLabel(d)}</span>`
        ).join('');
        
        let metaTags = [];
        if (project.attributes.role) {
            const roles = Array.isArray(project.attributes.role) 
                ? project.attributes.role 
                : [project.attributes.role];
            metaTags = [...metaTags, ...roles];
        }
        if (project.attributes.at) {
            metaTags.push(`@ ${project.attributes.at}`);
        }
        if (project.attributes.with) {
            const withs = Array.isArray(project.attributes.with)
                ? project.attributes.with
                : [project.attributes.with];
            metaTags = [...metaTags, ...withs];
        }
        
        const metaHtml = metaTags.map(tag => 
            `<span class="meta-tag">${tag}</span>`
        ).join('');
        
        const isEven = index % 2 === 1;
        
        return `
            <article class="project-card-large animate-on-scroll" data-index="${index}">
                <div class="project-image-wrapper">
                    <div class="project-visual">
                        <div class="project-visual-pattern">
                            ${Array(9).fill('<div class="pattern-cell"></div>').join('')}
                        </div>
                    </div>
                </div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description || 'An innovative web experience featuring advanced WebGL techniques and creative design.'}</p>
                    <div class="project-meta">
                        ${metaHtml}
                    </div>
                    ${distinctions ? `<div class="project-awards">${distinctions}</div>` : ''}
                    <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-link">
                        <span>View Project</span>
                        <span class="project-link-icon">→</span>
                    </a>
                </div>
            </article>
        `;
    }).join('');
}

function getAwardLabel(award) {
    const labels = {
        'awwwards': 'Awwwards',
        'fwa': 'FWA',
        'cssda': 'CSSDA'
    };
    return labels[award] || award.toUpperCase();
}

function renderLabProjects() {
    if (!DOM.labGrid || !window.labData) return;
    
    const icons = ['🧪', '✨', '🌟', '💫', '🔬', '⚡', '🎨', '🔮', '🌀', '🌈', '💎', '🎭', '🛸'];
    
    DOM.labGrid.innerHTML = window.labData.map((project, index) => `
        <a href="${project.url}" target="_blank" rel="noopener noreferrer" 
           class="lab-card animate-on-scroll-scale" data-index="${index}">
            <div class="lab-card-image">
                <div class="lab-card-visual">
                    <span class="lab-icon">${icons[index % icons.length]}</span>
                </div>
                <div class="lab-card-overlay">
                    <span class="lab-view-text">
                        <span>Explore</span>
                        <span>↗</span>
                    </span>
                </div>
            </div>
            <div class="lab-card-content">
                <h3 class="lab-card-title">${project.title}</h3>
                <p class="lab-card-description">${project.description || 'A creative experiment exploring new technologies and techniques.'}</p>
            </div>
        </a>
    `).join('');
}

function renderSocialLinks() {
    if (!DOM.socialGrid || !window.socialData) return;
    
    DOM.socialGrid.innerHTML = window.socialData.map(link => `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-link-card">
            <span class="social-link-icon">${link.icon}</span>
            <span class="social-link-name">${link.name}</span>
        </a>
    `).join('');
}

function renderSkills() {
    if (!DOM.skillsCloud) return;
    
    DOM.skillsCloud.innerHTML = skills.map((skill, index) => `
        <span class="skill-bubble" style="animation-delay: ${index * 0.05}s">${skill}</span>
    `).join('');
}

// ================================
// Intersection Observer
// ================================
function setupIntersectionObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // Check if this element has stat numbers to animate
                const statNumbers = entry.target.querySelectorAll('[data-count]');
                if (statNumbers.length > 0) {
                    statNumbers.forEach(num => animateCountUp(num));
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe animated elements
    const animatedElements = document.querySelectorAll(
        '.animate-on-scroll, .animate-on-scroll-left, .animate-on-scroll-right, .animate-on-scroll-scale'
    );
    animatedElements.forEach(el => observer.observe(el));
    
    // Also observe stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => observer.observe(card));
}

// ================================
// Count Up Animation
// ================================
function animateCountUp(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    
    function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);
        
        // Format with K for thousands
        if (target >= 1000) {
            element.textContent = (current / 1000).toFixed(current >= 1000 ? 0 : 0) + 'K+';
        } else {
            element.textContent = current + '+';
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateCount);
        }
    }
    
    requestAnimationFrame(updateCount);
}

// ================================
// Form Handling
// ================================
function setupFormHandling() {
    if (!DOM.contactForm) return;
    
    DOM.contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(DOM.contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // Validation
        if (!name || !email || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Get submit button
        const submitBtn = DOM.contactForm.querySelector('.form-submit-btn');
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Simulate submission
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.classList.add('success');
            
            showNotification('Thank you for your message! I\'ll get back to you soon.', 'success');
            
            // Reset form after delay
            setTimeout(() => {
                DOM.contactForm.reset();
                submitBtn.classList.remove('success');
                submitBtn.disabled = false;
            }, 2000);
        }, 1500);
    });
}

// ================================
// Notification System
// ================================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => {
        n.style.transform = 'translateX(120%)';
        n.style.opacity = '0';
        setTimeout(() => n.remove(), 300);
    });
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ================================
// Interactive Elements
// ================================
function setupInteractiveElements() {
    if (!DOM.cursorFollower || window.innerWidth <= 1024) return;
    
    const interactiveElements = document.querySelectorAll('a, button, .lab-card, .project-card-large, .stat-card, .social-link-card, .skill-bubble');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            DOM.cursorFollower.classList.add('hovering');
        });
        
        el.addEventListener('mouseleave', () => {
            DOM.cursorFollower.classList.remove('hovering');
        });
    });
    
    // Click effect
    document.addEventListener('mousedown', () => {
        DOM.cursorFollower.classList.add('clicking');
    });
    
    document.addEventListener('mouseup', () => {
        DOM.cursorFollower.classList.remove('clicking');
    });
}

// ================================
// Keyboard Navigation
// ================================
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Escape to close mobile menu
        if (e.key === 'Escape' && DOM.mobileMenu && DOM.mobileMenu.classList.contains('is-open')) {
            DOM.navToggle.classList.remove('is-active');
            DOM.mobileMenu.classList.remove('is-open');
            document.body.style.overflow = '';
        }
    });
}

// ================================
// Main Animation Loop
// ================================
function animate(currentTime) {
    // Continuous animations can be added here
    
    requestAnimationFrame(animate);
}

// ================================
// Utility Functions
// ================================
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

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ================================
// Export for global access
// ================================
window.Portfolio = {
    setWeather,
    showNotification,
    smoothScrollTo,
    getState: () => ({ ...state })
};

// ================================
// Performance Optimizations
// ================================
// Preload critical resources
const criticalLinks = document.querySelectorAll('link[rel="preconnect"]');

// Lazy loading for any future images
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
}

// Service Worker hint (if needed)
if ('serviceWorker' in navigator) {
    // Can add SW registration here for PWA support
}
