/* June to the Moon — game engine. Vocabulary lives in data/questions.json. */
'use strict';
const $ = s => document.querySelector(s);
const PRAISE = ['Yes!', 'Great job!', 'You got it!', 'Awesome!', 'Super pilot!', 'Nice one!'];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const ROCKET = `<svg viewBox="0 0 100 170" aria-hidden="true">
 <g class="flame"><path d="M38 128Q50 178 62 128Z" fill="url(#fl)"/><path d="M44 128Q50 158 56 128Z" fill="#fff6a8"/></g>
 <path d="M30 90L5 138L34 122Z" fill="#ff5fb8"/><path d="M70 90L95 138L66 122Z" fill="#ff5fb8"/>
 <path d="M50 4C78 30 80 80 72 128H28C20 80 22 30 50 4Z" fill="url(#bd)"/>
 <path d="M50 4C62 16 69 30 71 44H29C31 30 38 16 50 4Z" fill="#ff5fb8"/>
 <circle cx="50" cy="66" r="17" fill="url(#sv)"/>
 <polygon points="50,92 52.5,98 59,98.5 54,102.5 55.5,109 50,105.5 44.5,109 46,102.5 41,98.5 47.5,98" fill="url(#sv)"/>
 <rect x="26" y="118" width="48" height="9" rx="3" fill="url(#sv)"/></svg>`;
document.querySelectorAll('.rocket').forEach(r => r.insertAdjacentHTML('afterbegin', ROCKET));

/* ---------- sound (synthesised; no files, no services) ---------- */
let AC, muted = false;
try { muted = localStorage.getItem('jttm-muted') === '1'; } catch (e) {}
function tone(f, t, d, type = 'sine', v = .18) {
  if (muted || !AC) return;
  const o = AC.createOscillator(), g = AC.createGain(), n = AC.currentTime + t;
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(v, n + .02); g.gain.exponentialRampToValueAtTime(.001, n + d);
  o.connect(g).connect(AC.destination); o.start(n); o.stop(n + d + .05);
}
const sfx = {
  chime() { [784, 988, 1319].forEach((f, k) => tone(f, k * .09, .4)); },
  nope() { tone(330, 0, .18, 'triangle', .14); tone(262, .14, .26, 'triangle', .14); },
  go() { [220, 330, 440, 660, 880].forEach((f, k) => tone(f, k * .1, .3, 'sawtooth', .07)); },
  win() { [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, k) => tone(f, k * .14, .5, 'triangle', .2)); }
};
function paintSound() { const b = $('#snd'); b.textContent = muted ? '🔇' : '🔊'; b.setAttribute('aria-pressed', muted); }
function toggleSound() {
  muted = !muted; try { localStorage.setItem('jttm-muted', muted ? '1' : '0'); } catch (e) {}
  if (muted && window.speechSynthesis) speechSynthesis.cancel();
  paintSound();
}
$('#snd').onclick = toggleSound; paintSound();

/* ---------- star fields (title + cockpit window) ---------- */
const fields = [];
function starField(cv) {
  const c = cv.getContext('2d'), f = { boost: 0, speed: 1, S: [] };
  f.resize = () => {
    const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    f.d = d; f.W = cv.width = Math.max(1, r.width * d); f.H = cv.height = Math.max(1, r.height * d);
    f.S = Array.from({ length: 120 }, () => ({ x: Math.random() * f.W, y: Math.random() * f.H, z: Math.random() * .8 + .2, t: Math.random() * 6, h: [0, 320, 270, 200][Math.random() * 4 | 0] }));
  };
  f.draw = () => {
    c.clearRect(0, 0, f.W, f.H);
    for (const s of f.S) {
      s.y += (.5 + f.boost * 22) * s.z * f.speed * f.d * (reduce ? .3 : 1); s.t += .05;
      if (s.y > f.H) { s.y = -20; s.x = Math.random() * f.W; }
      c.globalAlpha = .5 + .5 * Math.sin(s.t);
      c.fillStyle = s.h ? `hsl(${s.h},100%,85%)` : '#fff'; c.strokeStyle = c.fillStyle;
      const r = (1 + s.z * 1.8) * f.d;
      if (f.boost > .05) { c.lineWidth = r; c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.x, s.y - f.boost * s.z * 70 * f.d); c.stroke(); }
      c.beginPath(); c.arc(s.x, s.y, r, 0, 7); c.fill();
    }
    f.boost *= .94;
  };
  f.resize(); fields.push(f); return f;
}
const titleStars = starField($('#title .stars')), winStars = starField($('#win .stars'));
(function loop() { fields.forEach(f => f.draw()); requestAnimationFrame(loop); })();

/* ---------- scene: Earth recedes, Moon grows ---------- */
const win = $('#win');
let progress = 0, landed = false;
function place(el, cx, cy, size) { Object.assign(el.style, { left: cx + 'px', top: cy + 'px', width: size + 'px', height: size + 'px' }); }
function scene() {
  const { width: W, height: H } = win.getBoundingClientRect(), p = progress;
  if (landed) { place($('#moon'), W * .5, H * .76 + W * 1.3, W * 2.6); place($('#earth'), W * .14, H * .2, W * .14); return; }
  place($('#moon'), W * (.72 - .22 * p), H * (.22 + .1 * p), W * (.1 + .75 * Math.pow(p, 1.8)));
  place($('#earth'), W * (.2 - .08 * p), H * (1 - .2 * p), W * (.55 - .49 * p));
}
function flyby() {
  const el = document.createElement('div'), sz = 24 + Math.random() * 40, h = Math.random() * 360;
  el.className = 'planet' + (Math.random() < .4 ? ' ring' : '');
  Object.assign(el.style, { width: sz + 'px', height: sz + 'px', left: 5 + Math.random() * 85 + '%', '--dx': (Math.random() * 120 - 60) + '%',
    background: `radial-gradient(circle at 30% 28%,hsl(${h},90%,80%),hsl(${h},75%,50%) 60%,hsl(${h},70%,25%))` });
  win.appendChild(el); el.addEventListener('animationend', () => el.remove());
}

/* ---------- game state ---------- */
let Q = [], i = 0, busy = true, shuffledKey = 0;
const shuffle = a => { for (let k = a.length - 1; k > 0; k--) { const j = Math.random() * (k + 1) | 0; [a[k], a[j]] = [a[j], a[k]]; } return a; };
const isImg = v => /[\/.]/.test(v) && !/^\p{Extended_Pictographic}/u.test(v);

async function loadQuestions() {
  const data = await (await fetch('data/questions.json', { cache: 'no-cache' })).json();
  Q = data.questions.filter(q => q.word && q.image && q.others && new Set([q.image, ...q.others]).size === 4);
  if (Q.length !== data.questions.length) console.warn('Some questions were skipped: each needs 4 distinct pictures.');
  $('#track').setAttribute('aria-valuemax', Q.length);
}

function say(text, kind) {
  const m = $('#msg'); m.textContent = text; m.className = 'show ' + (kind || '');
  clearTimeout(say.t); say.t = setTimeout(() => m.className = '', kind === 'good' ? 1100 : 1400);
}
function june(cls, text) {
  const f = $('#face'), s = $('#say');
  f.className = ''; void f.offsetWidth; f.className = cls; s.textContent = text; s.classList.add('on');
  clearTimeout(june.t); june.t = setTimeout(() => s.classList.remove('on'), 1600);
}
function setProgress() {
  const n = Q.length, pct = i / n * 100;
  $('#plabel').textContent = i >= n ? 'Landed on the Moon!' : `Question ${i + 1} of ${n}`;
  $('#fill').style.width = pct + '%'; $('#mark').style.left = pct + '%';
  $('#track').setAttribute('aria-valuenow', i);
  document.body.dataset.step = i;
  progress = i / n; scene();
}
function render() {
  const q = Q[i], opts = shuffle([{ v: q.image, ok: true }, ...q.others.map(v => ({ v, ok: false }))]);
  $('#word').textContent = q.word;
  const box = $('#choices'); box.innerHTML = '';
  opts.forEach((o, k) => {
    const b = document.createElement('button'); b.className = 'choice'; b.dataset.k = k + 1;
    b.title = `Picture ${k + 1}`; b.setAttribute('aria-label', `Picture ${k + 1}`);
    b.innerHTML = isImg(o.v) ? `<img src="${o.v}" alt="">` : `<span role="img">${o.v}</span>`;
    b.onclick = () => answer(b, o.ok); box.appendChild(b);
  });
  busy = false;
}
function answer(btn, ok) {
  if (busy) return;                                   // lock: a correct answer counts exactly once
  if (!ok) {
    sfx.nope(); btn.classList.remove('nope'); void btn.offsetWidth; btn.classList.add('nope');
    say('Not quite! Try again!'); june('oops', 'Try again!'); return;   // same question, no progress change
  }
  busy = true; i++;
  btn.classList.add('yes'); sfx.chime(); say(PRAISE[Math.random() * PRAISE.length | 0], 'good'); june('happy', 'Yay!');
  const ship = $('#ship'); ship.classList.remove('boost'); void ship.offsetWidth; ship.classList.add('boost');
  winStars.boost = 1; flyby(); setProgress();
  if (i >= Q.length) setTimeout(land, 1200); else setTimeout(render, 1300);
}

/* ---------- landing sequence ---------- */
function land() {
  $('#game').classList.add('landing'); landed = true; winStars.speed = 0; winStars.boost = 0;
  requestAnimationFrame(() => { scene(); }); sfx.win();
  setTimeout(() => { $('#game').classList.add('landed'); win.classList.add('celebrate'); confetti(); sfx.win();
    $('#done').hidden = false; $('#plabel').textContent = 'Mission complete!'; }, 2700);
}
function confetti() {
  for (let k = 0; k < 70; k++) {
    const e = document.createElement('i'), c = [`#ff5fb8`, '#8a4dff', '#d9dcf0', '#ffe86b', '#86ccff'][k % 5];
    e.className = 'conf'; Object.assign(e.style, { left: Math.random() * 100 + 'vw', background: c, '--dx': (Math.random() * 20 - 10) + 'vw',
      animationDuration: 2.5 + Math.random() * 2.5 + 's', animationDelay: Math.random() * 1.5 + 's' });
    document.body.appendChild(e); e.addEventListener('animationend', () => e.remove());
  }
}

/* ---------- flow ---------- */
function show(id) { ['#title', '#game'].forEach(s => $(s).hidden = s !== id); document.body.dataset.screen = id.slice(1); }
async function launch() {
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); AC.resume(); } catch (e) {}
  if (!Q.length) { try { await loadQuestions(); } catch (e) { alert('Could not load the words. Open this page through a web server (see README).'); return; } }
  sfx.go(); i = 0; landed = false; progress = 0; winStars.speed = 1;
  const g = $('#game'); g.classList.remove('landing', 'landed'); win.classList.remove('celebrate'); $('#done').hidden = true;
  show('#game'); winStars.resize(); setProgress(); render();
}
$('#launch').onclick = launch;
$('#again').onclick = () => { show('#title'); titleStars.resize(); };
$('#word').onclick = () => { if (!muted && window.speechSynthesis) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(Q[i].word); u.rate = .8; speechSynthesis.speak(u); } };
addEventListener('keydown', e => {
  if (e.key === 'm' || e.key === 'M') toggleSound();
  if (e.key === 'Enter' && !$('#title').hidden && document.activeElement === document.body) launch();
  if (!$('#game').hidden && !busy && /^[1-4]$/.test(e.key)) document.querySelector(`.choice[data-k="${e.key}"]`)?.click();
});
addEventListener('resize', () => fields.forEach(f => f.resize()));
new ResizeObserver(() => scene()).observe(win);   // keep Moon/Earth geometry correct whenever the window size changes
loadQuestions().catch(() => {});
