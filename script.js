/* ============================================
   Jewelina Wen - Interactive Portfolio
   Water Canvas + Key Animation + Scroll Effects
   ============================================ */

// ============================================
// Water Canvas Animation
// ============================================
class WaterCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.time = 0;
    this.particles = [];
    this.ripples = [];
    this.mouse = { x: 0, y: 0 };
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      if (Math.random() > 0.7) {
        this.addRipple(e.clientX, e.clientY);
      }
    });
    this.createParticles();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    const count = Math.floor(this.width * this.height / 8000);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.3 + 0.05,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  addRipple(x, y) {
    this.ripples.push({
      x, y,
      radius: 0,
      maxRadius: 80 + Math.random() * 60,
      opacity: 0.15,
      speed: 1.5 + Math.random()
    });
  }

  drawWater() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const t = this.time;

    // Deep water background gradient
    const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.5, w * 0.8);
    bgGrad.addColorStop(0, '#0d1a2a');
    bgGrad.addColorStop(0.4, '#0a1220');
    bgGrad.addColorStop(0.7, '#080e18');
    bgGrad.addColorStop(1, '#050810');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Animated water waves
    for (let layer = 0; layer < 4; layer++) {
      ctx.beginPath();
      const baseY = h * (0.35 + layer * 0.12);
      const amplitude = 20 + layer * 8;
      const frequency = 0.003 - layer * 0.0005;
      const speed = t * (0.5 + layer * 0.15);
      const alpha = 0.03 + layer * 0.01;

      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 4) {
        const y = baseY +
          Math.sin(x * frequency + speed) * amplitude +
          Math.sin(x * frequency * 2.3 + speed * 0.7) * (amplitude * 0.4) +
          Math.cos(x * frequency * 0.5 + speed * 1.3) * (amplitude * 0.6);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();

      const waveColor = layer < 2
        ? `rgba(15, 35, 60, ${alpha})`
        : `rgba(20, 45, 75, ${alpha})`;
      ctx.fillStyle = waveColor;
      ctx.fill();
    }

    // Light caustics
    for (let i = 0; i < 6; i++) {
      const cx = w * (0.2 + Math.sin(t * 0.3 + i * 1.2) * 0.3);
      const cy = h * (0.3 + Math.cos(t * 0.25 + i * 0.8) * 0.2);
      const cr = 100 + Math.sin(t * 0.5 + i) * 50;

      const caustic = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      caustic.addColorStop(0, 'rgba(180, 160, 100, 0.03)');
      caustic.addColorStop(0.5, 'rgba(140, 130, 90, 0.015)');
      caustic.addColorStop(1, 'rgba(100, 100, 80, 0)');
      ctx.fillStyle = caustic;
      ctx.fillRect(0, 0, w, h);
    }
  }

  drawParticles() {
    const ctx = this.ctx;
    const t = this.time;

    for (const p of this.particles) {
      p.x += p.speedX + Math.sin(t * 0.5 + p.phase) * 0.2;
      p.y += p.speedY + Math.cos(t * 0.3 + p.phase) * 0.1;

      // Wrap around
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      const flickerOpacity = p.opacity * (0.7 + Math.sin(t * 2 + p.phase) * 0.3);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 190, 150, ${flickerOpacity})`;
      ctx.fill();
    }
  }

  drawRipples() {
    const ctx = this.ctx;

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += r.speed;
      r.opacity *= 0.97;

      if (r.opacity < 0.001 || r.radius > r.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(180, 160, 100, ${r.opacity})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  drawCentralGlow() {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height * 0.42;
    const pulse = 1 + Math.sin(this.time * 0.8) * 0.1;
    const radius = 200 * pulse;

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    glow.addColorStop(0, 'rgba(212, 168, 83, 0.06)');
    glow.addColorStop(0.3, 'rgba(212, 168, 83, 0.03)');
    glow.addColorStop(1, 'rgba(212, 168, 83, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  animate() {
    this.time += 0.016;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawWater();
    this.drawParticles();
    this.drawRipples();
    this.drawCentralGlow();
    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// Key Scroll Zoom Effect
// ============================================
class KeyAnimation {
  constructor() {
    this.keyContainer = document.getElementById('key-container');
    this.landingText = document.getElementById('landing-text');
    this.scrollHint = document.getElementById('scroll-hint');
    this.landing = document.getElementById('landing');
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.onScroll());
  }

  onScroll() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const progress = Math.min(scrollY / (vh * 0.8), 1);

    // Key zooms in as user scrolls
    const scale = 1 + progress * 3;
    const opacity = 1 - progress * 1.5;
    const translateY = -progress * 200;

    if (this.keyContainer) {
      this.keyContainer.style.transform = `translate(-50%, -50%) scale(${scale}) translateY(${translateY}px)`;
      this.keyContainer.style.opacity = Math.max(0, opacity);
    }

    // Fade out landing text
    if (this.landingText) {
      this.landingText.style.opacity = Math.max(0, 1 - progress * 2);
    }

    // Fade out scroll hint
    if (this.scrollHint) {
      this.scrollHint.style.opacity = Math.max(0, 1 - progress * 3);
    }
  }
}

// ============================================
// Navigation Controller
// ============================================
class NavController {
  constructor() {
    this.nav = document.getElementById('main-nav');
    this.links = document.querySelectorAll('.nav-links a');
    this.sections = document.querySelectorAll('.section');
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.onScroll());
    this.links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  onScroll() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    // Show/hide nav after landing
    if (scrollY > vh * 0.5) {
      this.nav.classList.remove('hidden');
    } else {
      this.nav.classList.add('hidden');
    }

    // Update active link
    let current = '';
    this.sections.forEach(section => {
      const top = section.offsetTop - vh * 0.3;
      if (scrollY >= top) {
        current = section.id;
      }
    });

    this.links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === current) {
        link.classList.add('active');
      }
    });
  }
}

// ============================================
// Research Tag Filter
// ============================================
class ResearchFilter {
  constructor() {
    this.tags = document.querySelectorAll('.research-tags .tag');
    this.cards = document.querySelectorAll('.pub-card');
    this.init();
  }

  init() {
    this.tags.forEach(tag => {
      tag.addEventListener('click', () => {
        this.filter(tag.dataset.tag);
        this.tags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
      });
    });
  }

  filter(tagName) {
    this.cards.forEach(card => {
      if (tagName === 'all' || card.dataset.tags.includes(tagName)) {
        card.classList.remove('hidden');
        // Re-trigger animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 50);
      } else {
        card.classList.add('hidden');
      }
    });
  }
}

// ============================================
// Scroll Reveal Animations
// ============================================
class ScrollReveal {
  constructor() {
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // Staggered animation for timeline nodes
          if (entry.target.classList.contains('journey-timeline')) {
            const nodes = entry.target.querySelectorAll('.timeline-node');
            nodes.forEach((node, i) => {
              setTimeout(() => {
                node.classList.add('visible');
              }, i * 200);
            });
          }
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements
    document.querySelectorAll('.pub-card, .exhibition-card, .reveal').forEach(el => {
      observer.observe(el);
    });

    // Observe about section
    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
      const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      }, { threshold: 0.1 });
      aboutObserver.observe(aboutSection);
    }

    // Observe journey timeline
    const timeline = document.querySelector('.journey-timeline');
    if (timeline) {
      observer.observe(timeline);
    }
  }
}

// ============================================
// Smooth Parallax on About Background
// ============================================
class ParallaxEffect {
  constructor() {
    this.aboutBg = document.querySelector('.about-bg-img');
    if (this.aboutBg) {
      window.addEventListener('scroll', () => this.onScroll());
    }
  }

  onScroll() {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    const rect = aboutSection.getBoundingClientRect();
    const vh = window.innerHeight;

    if (rect.top < vh && rect.bottom > 0) {
      const progress = (vh - rect.top) / (vh + rect.height);
      const translateY = progress * 60 - 30;
      this.aboutBg.style.transform = `scale(1.1) translateY(${translateY}px)`;
    }
  }
}

// ============================================
// Cursor Glow Effect (Desktop only)
// ============================================
class CursorGlow {
  constructor() {
    if (window.matchMedia('(pointer: fine)').matches) {
      this.createGlow();
    }
  }

  createGlow() {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(212,168,83,0.04) 0%, transparent 70%);
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(glow);

    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }
}

// ============================================
// Initialize Everything
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Water canvas
  const canvas = document.getElementById('water-canvas');
  if (canvas) {
    new WaterCanvas(canvas);
  }

  // Key animation
  new KeyAnimation();

  // Navigation
  new NavController();

  // Research filter
  new ResearchFilter();

  // Scroll reveals
  new ScrollReveal();

  // Parallax
  new ParallaxEffect();

  // Cursor glow
  new CursorGlow();

  // Logo click -> scroll to top
  const logo = document.querySelector('.nav-logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
