/* global React, lucide */
// =========================================================================
// Last Onion Knight — effects + utilities
// Particles canvas, stage auto-scale, Lucide icon helper.
// =========================================================================

const { useEffect, useRef, useState, useLayoutEffect, useMemo } = React;

// ── Auto-scale stage to viewport while preserving 16:9 letterbox ─────────
function useStageScale(designW = 1920, designH = 1080) {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  useLayoutEffect(() => {
    function fit() {
      if (!wrapRef.current || !stageRef.current) return;
      const w = wrapRef.current.clientWidth;
      const h = wrapRef.current.clientHeight;
      const s = Math.min(w / designW, h / designH);
      stageRef.current.style.transform =
        `translate(${(w - designW * s) / 2}px, ${(h - designH * s) / 2}px) scale(${s})`;
    }
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrapRef.current);
    window.addEventListener('resize', fit);
    return () => { ro.disconnect(); window.removeEventListener('resize', fit); };
  }, [designW, designH]);
  return { wrapRef, stageRef };
}

// ── Ember particles canvas — drifting upward with twinkle ────────────────
function ParticleField({ enabled = true, density = 60 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let raf;
    let particles = [];
    let alive = true;

    function resize() {
      c.width = 1920;
      c.height = 1080;
    }
    resize();

    function spawn() {
      return {
        x: Math.random() * 1920,
        y: 1080 + Math.random() * 80,
        vy: 0.25 + Math.random() * 0.7,
        vx: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 2.5,
        life: 0,
        maxLife: 600 + Math.random() * 600,
        hue: 18 + Math.random() * 18,
        sat: 80 + Math.random() * 15,
        l:   55 + Math.random() * 15,
      };
    }
    for (let i = 0; i < density; i++) {
      const p = spawn();
      p.y = Math.random() * 1080;
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    function frame() {
      if (!alive) return;
      ctx.clearRect(0, 0, 1920, 1080);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life += 1;
        p.y -= p.vy;
        p.x += p.vx;
        const t = p.life / p.maxLife;
        const alpha = t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.l}%, ${alpha * 0.85})`;
        ctx.shadowColor = `hsla(${p.hue}, ${p.sat}%, ${p.l + 10}%, 0.9)`;
        ctx.shadowBlur = 12;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.life >= p.maxLife || p.y < -20) {
          particles[i] = spawn();
        }
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(frame);
    }
    if (enabled) frame();

    return () => { alive = false; cancelAnimationFrame(raf); };
  }, [enabled, density]);
  if (!enabled) return null;
  return <canvas ref={ref} className="particles" />;
}

// ── Lucide icon: a tiny wrapper that creates the svg via the global lib ──
function Icon({ name, size = 18, color, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = `<i data-lucide="${name}" style="width:${size}px;height:${size}px"></i>`;
      window.lucide.createIcons({ icons: undefined, nameAttr: 'data-lucide' });
    }
  }, [name, size]);
  return <span ref={ref} style={{ display: 'inline-flex', width: size, height: size, color: color || 'currentColor', ...style }} />;
}

// ── Animated number — eases from previous to next when value changes ─────
function useAnimNumber(value, durMs = 600) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef(performance.now());
  useEffect(() => {
    fromRef.current = shown;
    startRef.current = performance.now();
    let raf;
    function step(now) {
      const t = Math.min(1, (now - startRef.current) / durMs);
      const e = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(fromRef.current + (value - fromRef.current) * e));
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, [value]);
  return shown;
}

// ── Real-time Eorzea Time (FFXIV clock runs ~20x faster than real time) ──
function useEorzeaTime() {
  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  // ET multiplier: 1 Earth second = 175 / 6 Eorzean seconds ≈ 29.166...
  // FFXIV docs: 1 Eorzean day = 70 Earth minutes -> factor = 24*60 / 70 = 20.571…
  const factor = (24 * 60) / 70;
  const etSec = Math.floor((tick / 1000) * factor) % (24 * 3600);
  const h = Math.floor(etSec / 3600);
  const m = Math.floor((etSec % 3600) / 60);
  const lt = new Date(tick);
  return {
    et: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,
    lt: `${String(lt.getHours()).padStart(2,'0')}:${String(lt.getMinutes()).padStart(2,'0')}:${String(lt.getSeconds()).padStart(2,'0')}`,
  };
}

// ── XP bar shimmer — pulse to animate the value forward over time ────────
function useLiveXP(initial = 62) {
  const [xp, setXp] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => setXp(v => (v >= 100 ? 0 : v + 0.05)), 250);
    return () => clearInterval(id);
  }, []);
  return xp;
}

// ── Shared GCD timer — visualized as a sweeping conic-gradient ring ──────
function useGCD(speedMs = 2400) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    function step(now) {
      const p = ((now - start) % speedMs) / speedMs;
      setT(p);
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [speedMs]);
  return t;
}

Object.assign(window, {
  useStageScale, ParticleField, Icon, useAnimNumber, useEorzeaTime, useLiveXP, useGCD,
});
