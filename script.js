// ============================================
// SUFFERLAND - Main JavaScript
// ============================================

// DOM Elements
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Default Configuration (embedded for static sites)
const defaultConfig = {
    server: {
        name: "SUFFERLAND",
        tagline: "SwordSMP x InfuseSMP x Economy",
        description: "SUFFERLAND is a SwordSMP x InfuseSMP x Economy survival server that combines competitive PvP combat with progression systems and a player-driven economy.",
        ip: "suffer.srein.xyz",
        port: "25567",
        discord: "https://discord.gg/XaUBr97NUW"
    },
    ranks: [
        {
            id: "vip",
            name: "VIP",
            price: "₱50",
            color: "#00FF00",
            perks: [
                "2x Homes",
                "10x Concurrent Auctions",
                "/grindstone Command",
                "/disposal Command",
                "/ec Command",
                "/kit Command"
            ]
        },
        {
            id: "mvp",
            name: "MVP",
            price: "₱100",
            color: "#00FFFF",
            perks: [
                "3x Homes",
                "15x Concurrent Auctions",
                "/cartographytable Command",
                "/stonecutter Command",
                "/disposal Command",
                "/craft Command",
                "/grindstone Command",
                "/kit Command"
            ]
        },
        {
            id: "elite",
            name: "ELITE",
            price: "₱150",
            color: "#FF00FF",
            perks: [
                "4x Homes",
                "20x Concurrent Auctions",
                "/craft Command",
                "/ec Command",
                "/disposal Command",
                "/stonecutter Command",
                "/grindstone Command",
                "/repair Command",
                "/anvil Command",
                "/cartographytable Command",
                "/kit Command"
            ]
        },
        {
            id: "giant",
            name: "GIANT",
            price: "₱200",
            color: "#FF6600",
            perks: [
                "5x Homes",
                "25x Concurrent Auctions",
                "/craft Command",
                "/ec Command",
                "/disposal Command",
                "/stonecutter Command",
                "/grindstone Command",
                "/anvil Command",
                "/smithingtable Command",
                "/cartographytable Command",
                "/repair Command",
                "/ptime Command",
                "/kit Command"
            ]
        },
        {
            id: "titan",
            name: "TITAN",
            price: "₱400",
            color: "#FF0000",
            perks: [
                "7x Homes",
                "30x Concurrent Auctions",
                "/craft Command",
                "/cartographytable Command",
                "/ec Command",
                "/stonecutter Command",
                "/grindstone Command",
                "/anvil Command",
                "/smithingtable Command",
                "/ptime Command",
                "/pweather Command",
                "/repair Command",
                "/near Command",
                "/kit Command"
            ]
        }
    ]
};

// Configuration
let serverConfig = null;

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    
    // Use default config immediately for static sites
    serverConfig = defaultConfig;
    updateWebsiteContent();
    
    // Try to load from API if backend is available
    loadConfig();
    loadServerStatus();
    
    // Refresh server status every 30 seconds
    setInterval(loadServerStatus, 30000);
});

// ============================================
// Navbar Scroll Effect
// ============================================
function initNavbar() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ============================================
// Mobile Menu
// ============================================
function initMobileMenu() {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// ============================================
// Scroll Animations
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Add fade-in class to elements
    const animateElements = document.querySelectorAll('.section-header, .status-card, .feature-item, .rank-card, .about-text');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ============================================
// Load Configuration
// ============================================
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            serverConfig = await response.json();
            updateWebsiteContent();
        }
    } catch (error) {
        // Use default config if API is not available (static site)
        console.log('Using default config (API not available)');
    }
}

// ============================================
// Update Website Content from Config
// ============================================
function updateWebsiteContent() {
    if (!serverConfig) return;
    
    // Update server info
    document.getElementById('server-ip').textContent = serverConfig.server.ip;
    document.getElementById('server-port').textContent = serverConfig.server.port;
    document.getElementById('server-tagline').textContent = serverConfig.server.tagline;
    document.getElementById('server-description').textContent = serverConfig.server.description;
    
    // Update Discord links
    document.querySelectorAll('a[href*="discord"]').forEach(link => {
        link.href = serverConfig.server.discord;
    });
    
    // Render ranks
    renderRanks(serverConfig.ranks);
}

// ============================================
// Render Rank Cards
// ============================================
function renderRanks(ranks) {
    const container = document.getElementById('ranks-container');
    if (!container || !ranks) return;
    
    container.innerHTML = ranks.map(rank => `
        <div class="rank-card" style="--rank-color: ${rank.color}; --rank-glow: ${rank.color}40">
            <div class="rank-header">
                <span class="rank-name" style="color: ${rank.color}">${rank.name}</span>
                <span class="rank-price">${rank.price}</span>
            </div>
            <div class="rank-divider"></div>
            <p class="rank-perks-title">Rank Perks:</p>
            <ul class="rank-perks">
                ${rank.perks.map(perk => `
                    <li><i class="fas fa-arrow-right"></i> ${perk}</li>
                `).join('')}
            </ul>
        </div>
    `).join('');
    
    // Re-observe new rank cards for animations
    const newCards = container.querySelectorAll('.rank-card');
    newCards.forEach(card => {
        card.classList.add('fade-in');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        observer.observe(card);
    });
}

// ============================================
// Load Server Status
// ============================================
async function loadServerStatus() {
    try {
        const response = await fetch('/api/status');
        if (response.ok) {
            const status = await response.json();
            updateStatusDisplay(status);
        }
    } catch (error) {
        console.error('Error loading server status:', error);
        updateStatusDisplay({ online: false, players: { online: 0, max: 0 }, version: 'Unknown' });
    }
}

// ============================================
// Update Status Display
// ============================================
function updateStatusDisplay(status) {
    const indicator = document.getElementById('server-status-indicator');
    const statusText = document.getElementById('server-status-text');
    const pulse = indicator.querySelector('.pulse');
    const playersOnline = document.getElementById('players-online');
    const playersMax = document.getElementById('players-max');
    const playersProgress = document.getElementById('players-progress');
    const versionValue = document.getElementById('server-version');
    
    // Update status indicator
    if (status.online) {
        pulse.classList.remove('offline');
        statusText.textContent = 'Online';
        statusText.classList.add('online');
        statusText.classList.remove('offline');
    } else {
        pulse.classList.add('offline');
        statusText.textContent = 'Offline';
        statusText.classList.add('offline');
        statusText.classList.remove('online');
    }
    
    // Update player counts
    playersOnline.textContent = status.players.online;
    playersMax.textContent = status.players.max;
    
    // Update progress bar
    const percentage = status.players.max > 0 
        ? (status.players.online / status.players.max) * 100 
        : 0;
    playersProgress.style.width = `${percentage}%`;
    
    // Update version
    versionValue.textContent = status.version || '1.20+';
}

// ============================================
// Copy IP to Clipboard
// ============================================
function copyIP() {
    const ip = document.getElementById('server-ip').textContent;
    const port = document.getElementById('server-port').textContent;
    const fullIP = `${ip}:${port}`;
    
    navigator.clipboard.writeText(fullIP).then(() => {
        showToast('Server IP copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = fullIP;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Server IP copied to clipboard!');
    });
}

// ============================================
// Show Toast Notification
// ============================================
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// Smooth Scroll for Anchor Links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 70; // Navbar height
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Parallax Effect for Hero Section
// ============================================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const orbs = document.querySelectorAll('.gradient-orb');
    
    orbs.forEach((orb, index) => {
        const speed = 0.2 + (index * 0.1);
        orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ============================================
// Add Particle Effect on Button Click
// ============================================
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        if (this.getAttribute('href')?.startsWith('#')) return;
        
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const particle = document.createElement('span');
        particle.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            pointer-events: none;
            left: ${x}px;
            top: ${y}px;
            animation: particle 0.6s ease-out forwards;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(particle);
        
        setTimeout(() => particle.remove(), 600);
    });
});

// Add particle animation keyframes
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes particle {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.5;
        }
        100% {
            transform: translate(var(--tx, 50px), var(--ty, -50px)) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyle);
