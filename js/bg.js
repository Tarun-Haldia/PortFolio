/* bg.js — Animated starfield background */
(function () {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], shootingStars = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.7 + 0.1,
      da: (Math.random() - 0.5) * 0.006,
      color: Math.random() > 0.85 ? '#a78bfa' : '#ffffff'
    };
  }

  function makeShooting() {
    return {
      x: Math.random() * W * 0.7,
      y: Math.random() * H * 0.4,
      len: Math.random() * 120 + 60,
      speed: Math.random() * 6 + 4,
      alpha: 1,
      angle: Math.PI / 6 + (Math.random() - 0.5) * 0.3,
      active: true
    };
  }

  function init() {
    resize();
    stars = Array.from({ length: 220 }, makeStar);
  }

  let lastShot = 0;
  function frame(ts) {
    ctx.clearRect(0, 0, W, H);

    // Stars
    stars.forEach(s => {
      s.alpha += s.da;
      if (s.alpha <= 0.05 || s.alpha >= 0.85) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Occasional shooting star
    if (ts - lastShot > 3800) {
      shootingStars.push(makeShooting());
      lastShot = ts;
    }
    shootingStars = shootingStars.filter(ss => ss.active);
    shootingStars.forEach(ss => {
      const dx = Math.cos(ss.angle) * ss.speed;
      const dy = Math.sin(ss.angle) * ss.speed;
      const grd = ctx.createLinearGradient(ss.x, ss.y, ss.x - Math.cos(ss.angle) * ss.len, ss.y - Math.sin(ss.angle) * ss.len);
      grd.addColorStop(0, `rgba(255,255,255,${ss.alpha})`);
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x - Math.cos(ss.angle) * ss.len, ss.y - Math.sin(ss.angle) * ss.len);
      ctx.strokeStyle = grd;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ss.x += dx; ss.y += dy;
      ss.alpha -= 0.018;
      if (ss.alpha <= 0 || ss.x > W || ss.y > H) ss.active = false;
    });

    requestAnimationFrame(frame);
  }

  init();
  window.addEventListener('resize', () => { resize(); stars = Array.from({ length: 220 }, makeStar); });
  requestAnimationFrame(frame);
})();
