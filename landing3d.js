/* ============================================
   Landing - Living Taiji
   Static image + flowing energy particles inside
   ============================================ */

export function initLanding(container) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, t = 0;
  let mouse = { x: -999, y: -999 };
  let ripples = [];

  // Load taiji image
  const img = new Image();
  img.src = 'assets/images/about.jpg';
  let imgReady = false;
  img.onload = () => { imgReady = true; };

  // Energy particles that flow along yin-yang curves
  let flowParticles = [];
  // Ambient floating particles
  let ambientParticles = [];

  function resize() {
    W = canvas.width = container.clientWidth;
    H = canvas.height = container.clientHeight;
    initParticles();
  }

  // Get taiji center and radius
  function taijiCenter() {
    return {
      cx: W / 2,
      cy: H / 2 - H * 0.02,
      r: Math.min(W, H) * 0.26
    };
  }

  function initParticles() {
    const { cx, cy, r } = taijiCenter();

    // Flow particles - follow yin-yang S-curve paths
    flowParticles = [];
    for (let i = 0; i < 200; i++) {
      flowParticles.push(createFlowParticle(cx, cy, r, i));
    }

    // Ambient particles (background)
    ambientParticles = [];
    for (let i = 0; i < 60; i++) {
      ambientParticles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.08,
        o: Math.random() * 0.25 + 0.03,
        ph: Math.random() * Math.PI * 2
      });
    }
  }

  function createFlowParticle(cx, cy, r, seed) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * r * 0.95;
    // Speed varies - faster at edges, slower near center
    const speedMult = 0.3 + (dist / r) * 0.7;
    return {
      // Current position on the flow path
      angle: angle,
      dist: dist,
      // Flow parameters
      speed: (0.002 + Math.random() * 0.004) * speedMult,
      // Which "stream" - determines the S-curve offset
      stream: Math.random(),
      // Visual
      size: Math.random() * 2 + 0.4,
      brightness: Math.random(),
      phase: Math.random() * Math.PI * 2,
      life: 1,
      maxLife: 300 + Math.random() * 500,
      age: Math.floor(Math.random() * 500),
      // Color variation
      hue: Math.random() > 0.8 ? 'silver' : 'gold'
    };
  }

  // Calculate flowing position - particles follow the yin-yang S-curve
  function getFlowPos(p, cx, cy, r, time) {
    // The yin-yang has an S-curve dividing line
    // Particles flow in circular paths but deflected by the S-curve
    const a = p.angle + time * p.speed;

    // S-curve deflection: particles near the center follow the S more
    const sInfluence = 1 - (p.dist / r);
    const sWave = Math.sin(a * 2) * r * 0.3 * sInfluence;

    // Base circular orbit
    let x = cx + Math.cos(a) * p.dist + Math.cos(a + Math.PI / 2) * sWave * 0.3;
    let y = cy + Math.sin(a) * p.dist + Math.sin(a + Math.PI / 2) * sWave * 0.3;

    // Add organic turbulence
    x += Math.sin(time * 3 + p.phase) * 2;
    y += Math.cos(time * 2.5 + p.phase * 1.3) * 2;

    return { x, y };
  }

  // Check if point is inside the taiji circle
  function insideTaiji(x, y, cx, cy, r) {
    const dx = x - cx, dy = y - cy;
    return (dx * dx + dy * dy) < (r * r);
  }

  function draw() {
    t += 0.008;
    ctx.clearRect(0, 0, W, H);
    const { cx, cy, r } = taijiCenter();

    // === Dark background with subtle warmth ===
    ctx.fillStyle = '#050608';
    ctx.fillRect(0, 0, W, H);

    // Warm radial glow behind taiji
    const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.5);
    bgGlow.addColorStop(0, 'rgba(30,22,10,0.3)');
    bgGlow.addColorStop(0.4, 'rgba(15,10,5,0.15)');
    bgGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, W, H);

    // === Draw the static taiji image ===
    if (imgReady) {
      const imgSize = r * 2.15;
      ctx.save();
      // Clip to circle for clean edges
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, cx - imgSize / 2, cy - imgSize / 2, imgSize, imgSize);
      ctx.restore();
    }

    // === Flowing energy particles INSIDE the taiji ===
    for (const p of flowParticles) {
      p.age++;
      // Respawn when too old
      if (p.age > p.maxLife) {
        Object.assign(p, createFlowParticle(cx, cy, r, 0));
        p.age = 0;
      }

      const pos = getFlowPos(p, cx, cy, r, t * 8);

      // Only draw if inside the taiji circle
      if (!insideTaiji(pos.x, pos.y, cx, cy, r * 1.02)) continue;

      // Fade in/out over lifetime
      const lifeFrac = p.age / p.maxLife;
      const lifeFade = lifeFrac < 0.1 ? lifeFrac / 0.1
                     : lifeFrac > 0.85 ? (1 - lifeFrac) / 0.15
                     : 1;

      // Flicker
      const flicker = 0.4 + Math.sin(t * 10 + p.phase) * 0.3 + Math.sin(t * 7 + p.phase * 2.3) * 0.2;
      const alpha = flicker * lifeFade * (0.3 + p.brightness * 0.5);

      // Mouse proximity boost
      const mdx = pos.x - mouse.x, mdy = pos.y - mouse.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      const mouseBoost = mDist < 120 ? (1 - mDist / 120) * 0.6 : 0;

      const finalAlpha = Math.min(1, alpha + mouseBoost);
      const finalSize = p.size * (1 + mouseBoost * 0.8);

      // Draw particle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, finalSize, 0, Math.PI * 2);
      if (p.hue === 'gold') {
        ctx.fillStyle = `rgba(${210 + p.brightness * 40},${160 + p.brightness * 30},${60 + p.brightness * 30},${finalAlpha})`;
      } else {
        ctx.fillStyle = `rgba(${200 + p.brightness * 50},${195 + p.brightness * 50},${180 + p.brightness * 50},${finalAlpha * 0.7})`;
      }
      ctx.fill();

      // Glow for larger/brighter particles
      if (finalSize > 1.2 && finalAlpha > 0.2) {
        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, finalSize * 5);
        if (p.hue === 'gold') {
          glow.addColorStop(0, `rgba(220,175,70,${finalAlpha * 0.12})`);
        } else {
          glow.addColorStop(0, `rgba(210,210,200,${finalAlpha * 0.08})`);
        }
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(pos.x - finalSize * 5, pos.y - finalSize * 5, finalSize * 10, finalSize * 10);
      }
    }

    // === Energy streams - flowing light trails along the S-curve ===
    for (let s = 0; s < 6; s++) {
      ctx.beginPath();
      const streamSpeed = t * 6 + s * Math.PI / 3;
      let first = true;
      for (let i = 0; i < 40; i++) {
        const a = streamSpeed + i * 0.08;
        const d = r * (0.15 + i * 0.02);
        const sWave = Math.sin(a * 2) * r * 0.25 * (1 - d / r);
        const x = cx + Math.cos(a) * d + Math.cos(a + Math.PI / 2) * sWave * 0.3;
        const y = cy + Math.sin(a) * d + Math.sin(a + Math.PI / 2) * sWave * 0.3;

        if (!insideTaiji(x, y, cx, cy, r)) continue;

        if (first) { ctx.moveTo(x, y); first = false; }
        else ctx.lineTo(x, y);
      }
      const streamAlpha = 0.02 + Math.sin(t * 3 + s) * 0.01;
      ctx.strokeStyle = `rgba(220,180,80,${streamAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // === Pulsing glow overlay on taiji ===
    const pulse = Math.sin(t * 1.5) * 0.5 + 0.5;
    const glowR = r * (0.9 + pulse * 0.15);
    const glow = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, glowR);
    glow.addColorStop(0, `rgba(212,168,83,${0.01 + pulse * 0.015})`);
    glow.addColorStop(0.5, `rgba(180,140,50,${0.005 + pulse * 0.008})`);
    glow.addColorStop(1, 'rgba(150,110,30,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
    ctx.fill();

    // === Ambient particles (outside taiji, in background) ===
    for (const p of ambientParticles) {
      p.x += p.vx + Math.sin(t * 2 + p.ph) * 0.04;
      p.y += p.vy + Math.cos(t * 1.5 + p.ph) * 0.03;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      const alpha = p.o * (0.4 + Math.sin(t * 4 + p.ph) * 0.6);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,160,120,${alpha})`;
      ctx.fill();
    }

    // === Mouse ripples ===
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.radius += rp.speed;
      rp.opacity *= 0.96;
      if (rp.opacity < 0.003 || rp.radius > rp.maxRadius) {
        ripples.splice(i, 1);
        continue;
      }
      for (let j = 0; j < 2; j++) {
        const rad = rp.radius - j * 4;
        if (rad <= 0) continue;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212,180,100,${rp.opacity * (1 - j * 0.4)})`;
        ctx.lineWidth = 1 - j * 0.3;
        ctx.stroke();
      }
    }

    // === Mouse glow ===
    if (mouse.x > 0) {
      const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
      mg.addColorStop(0, 'rgba(212,168,83,0.04)');
      mg.addColorStop(1, 'rgba(212,168,83,0)');
      ctx.fillStyle = mg;
      ctx.fillRect(mouse.x - 80, mouse.y - 80, 160, 160);
    }

    // === Vignette ===
    const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.65);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(3,4,6,0.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(draw);
  }

  // --- Ripples ---
  function addRipple(x, y) {
    ripples.push({
      x, y, radius: 2,
      maxRadius: 45 + Math.random() * 35,
      opacity: 0.1 + Math.random() * 0.05,
      speed: 0.7 + Math.random() * 0.5
    });
  }

  // --- Mouse / touch ---
  let lastRipple = 0;
  container.addEventListener('mousemove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    if (Date.now() - lastRipple > 180) {
      addRipple(e.clientX, e.clientY);
      lastRipple = Date.now();
    }
  });
  container.addEventListener('touchmove', e => {
    const t = e.touches[0];
    mouse.x = t.clientX; mouse.y = t.clientY;
    if (Date.now() - lastRipple > 120) {
      addRipple(t.clientX, t.clientY);
      lastRipple = Date.now();
    }
  }, { passive: true });
  container.addEventListener('click', e => {
    for (let i = 0; i < 4; i++)
      setTimeout(() => addRipple(e.clientX + (Math.random()-.5)*25, e.clientY + (Math.random()-.5)*25), i * 70);
  });
  container.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  window.addEventListener('resize', resize);
  resize();
  draw();
}
