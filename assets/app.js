/* ===== הגדרות כלליות — כאן משנים את שם האתר ===== */
const SITE_NAME = 'שם זמני';
const UPDATED = 'נובמבר 2026';
const VERSION = 4; // להעלות בכל עדכון, יחד עם ?v= בקבצי ה-HTML

const NAV = [
  ['index.html', 'בית', 'home'],
  ['basics.html', 'עקרונות יסוד', 'basics'],
  ['alt.html', 'דרכים אחרות', 'alt'],
  ['tricks.html', 'טריקים', 'tricks'],
  ['game.html', '🎮 משחק', 'game'],
];

/* ===== אחסון מקומי (עובד גם כשהדפדפן חוסם) ===== */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* בלי זיכרון */ } },
};

/* ===== עזרים ===== */
const fmt = (n) => Math.round(n).toLocaleString('he-IL');
const ils = (n) => `${fmt(n)} ₪`;
const compact = (n) => {
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 1e6) return `${s}${(a / 1e6).toFixed(a >= 1e7 ? 0 : 1)}M`;
  if (a >= 1e3) return `${s}${Math.round(a / 1e3)}K`;
  return `${s}${Math.round(a)}`;
};
const num = (form, name) => {
  const el = form.elements[name];
  if (!el) return 0;
  const v = parseFloat(String(el.value).replace(/[^\d.\-]/g, ''));
  return Number.isFinite(v) ? v : 0;
};
const out = (form, key, html) => {
  form.querySelectorAll(`[data-out="${key}"]`).forEach((el) => { el.innerHTML = html; });
};
function pmt(principal, annualRatePct, years) {
  const n = Math.round(years * 12);
  if (n <= 0 || principal <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}
function pv(payment, annualRatePct, years) {
  const n = Math.round(years * 12);
  if (n <= 0 || payment <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return payment * n;
  return (payment * (1 - Math.pow(1 + r, -n))) / r;
}
function yearsMonths(m) {
  const y = Math.floor(m / 12), mo = m % 12;
  const ys = y === 0 ? '' : y === 1 ? 'שנה' : y === 2 ? 'שנתיים' : `${y} שנים`;
  const ms = mo === 0 ? '' : mo === 1 ? 'חודש' : mo === 2 ? 'חודשיים' : `${mo} חודשים`;
  if (!ys && !ms) return 'עכשיו';
  if (!ys || !ms) return ys || ms;
  return `${ys} ${/^\d/.test(ms) ? 'ו־' : 'ו'}${ms}`;
}
const HE_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
function dateIn(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return `${HE_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
// סימולציית חיסכון: מחזיר מספר חודשים עד היעד ואת היתרה בכל חודש
function simulateSavings({ target, saved, monthly, ret, maxMonths = 600 }) {
  const rm = Math.pow(1 + ret, 1 / 12) - 1;
  let bal = saved, m = 0;
  const path = [bal];
  while (bal < target && m < maxMonths) { bal = bal * (1 + rm) + monthly; m++; path.push(bal); }
  return { months: bal >= target ? m : Infinity, path };
}

/* ===== פרופיל אישי ===== */
const Profile = {
  get() { return store.get('profile-v1', null); },
  set(p) { store.set('profile-v1', p); },
};

/* ===== רמות ותגים ===== */
const LEVELS = [
  [0, 'שוכר מתחיל', '🐣'],
  [100, 'חוסך מתחיל', '🐷'],
  [250, 'צייד ריביות', '🏹'],
  [450, 'בלש טאבו', '🕵️'],
  [700, 'מומחה נדל״ן', '🧠'],
  [1000, 'בעל מפתח', '🔑'],
];
const BADGES = {
  onboard: { e: '🚀', name: 'יצאתם לדרך', hint: 'בנו מפה אישית בעמוד הבית', xp: 50 },
  visit_basics: { e: '🧱', name: 'יסודות', hint: 'בקרו בעקרונות יסוד', xp: 15 },
  visit_alt: { e: '🛥️', name: 'חושבים אחרת', hint: 'בקרו בדרכים אחרות לחיות', xp: 15 },
  visit_tricks: { e: '⚡', name: 'סקרנים', hint: 'בקרו בטריקים', xp: 15 },
  calc_savings: { e: '⏳', name: 'מחשבי זמן', hint: 'שחקו עם מחשבון החיסכון', xp: 30 },
  calc_habits: { e: '☕', name: 'גלאי קפה', hint: 'בדקו כמה עולים לכם ההרגלים', xp: 30 },
  calc_afford: { e: '🧮', name: 'יודעים את הגבול', hint: 'בדקו כמה דירה אתם יכולים להרשות', xp: 30 },
  calc_mortgage: { e: '📆', name: 'מבינים משכנתא', hint: 'חשבו החזר חודשי', xp: 30 },
  stress: { e: '😱', name: 'שרדתם מבחן לחץ', hint: 'העלו את הריבית במבחן הלחץ', xp: 40 },
  calc_tax: { e: '🧾', name: 'חברים של רשות המסים', hint: 'חשבו מס רכישה', xp: 30 },
  calc_rentbuy: { e: '⚖️', name: 'שופטים הוגנים', hint: 'השוו קנייה מול שכירות', xp: 30 },
  tricks10: { e: '🤓', name: '10 טריקים', hint: 'גלו 10 טריקים', xp: 40 },
  tricks25: { e: '🧙', name: '25 טריקים', hint: 'גלו 25 טריקים', xp: 60 },
  tricksAll: { e: '👑', name: 'כל הטריקים', hint: 'גלו את כל הטריקים', xp: 150 },
  share: { e: '📤', name: 'חברים טובים', hint: 'שתפו משהו עם חבר', xp: 30 },
  game_start: { e: '🎮', name: 'שחקנים', hint: 'התחילו את משחק החיים', xp: 30 },
  game_finish: { e: '🏁', name: 'שרדתם עד 35', hint: 'סיימו משחק', xp: 150 },
  game_owner: { e: '🔑', name: 'בעלי בית (במשחק)', hint: 'קנו דירה במשחק', xp: 60 },
  game_yacht: { e: '⛵', name: 'זאבי ים', hint: 'גורו על יאכטה במשחק', xp: 60 },
  game_kibbutz: { e: '🌾', name: 'קיבוצניקים', hint: 'עברו לקיבוץ במשחק', xp: 60 },
  game_rich: { e: '💰', name: 'מיליונרים', hint: 'סיימו משחק עם שווי של מיליון ₪', xp: 80 },
  game_veteran: { e: '🎖️', name: 'ותיקי המשחק', hint: 'שחקו 3 משחקים', xp: 80 },
};
const XP = {
  _list: store.get('badges-v1', []),
  earned() { return this._list; },
  has(id) { return this._list.includes(id); },
  total() { return this._list.reduce((s, id) => s + (BADGES[id] ? BADGES[id].xp : 0), 0); },
  levelIndex(xp) { let i = 0; LEVELS.forEach((l, j) => { if (xp >= l[0]) i = j; }); return i; },
  award(id) {
    const b = BADGES[id];
    if (!b || this.has(id)) return;
    const before = this.levelIndex(this.total());
    this._list.push(id);
    store.set('badges-v1', this._list);
    const after = this.levelIndex(this.total());
    renderPill();
    toast(`${b.e} תג חדש: ${b.name} · +${b.xp} XP`);
    confetti(after > before ? 180 : 50);
    if (after > before) toast(`🎉 עליתם רמה! עכשיו אתם ${LEVELS[after][1]} ${LEVELS[after][2]}`);
  },
};

/* ===== Toast (תור הודעות) ===== */
const toastQueue = [];
let toastBusy = false;
function toast(msg) {
  toastQueue.push(msg);
  if (!toastBusy) nextToast();
}
function nextToast() {
  const msg = toastQueue.shift();
  if (!msg) { toastBusy = false; return; }
  toastBusy = true;
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => { el.classList.remove('show'); setTimeout(nextToast, 250); }, 2300);
}

/* ===== קונפטי ===== */
function confetti(n = 80) {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas');
  c.className = 'confetti';
  const dpr = window.devicePixelRatio || 1;
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  const colors = ['#6B3BFF', '#FF5A5F', '#FFD23F', '#3DDC97', '#7CC8FF', '#FFB3D1'];
  const parts = Array.from({ length: n }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 12 - 4,
    w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
    r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
    c: colors[Math.floor(Math.random() * colors.length)],
  }));
  const start = performance.now();
  (function frame(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach((p) => {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    });
    if (t - start < 2200) requestAnimationFrame(frame); else c.remove();
  })(start);
}

/* ===== חלון (מודאל) ===== */
function openModal(html, { onClose, wide } = {}) {
  const d = document.createElement('dialog');
  d.className = `modal${wide ? ' wide' : ''}`;
  d.innerHTML = `<button class="modal-x" type="button" aria-label="סגירה">✕</button><div class="modal-body">${html}</div>`;
  document.body.appendChild(d);
  const close = () => { d.close(); };
  d.querySelector('.modal-x').addEventListener('click', close);
  d.addEventListener('click', (e) => { if (e.target === d) close(); });
  d.addEventListener('close', () => { d.remove(); if (onClose) onClose(); });
  d.showModal();
  return d;
}

/* ===== כותרת, תחתית ופס רמה ===== */
function renderPill() {
  const pill = document.querySelector('.xp-pill');
  if (!pill) return;
  const xp = XP.total();
  const i = XP.levelIndex(xp);
  const cur = LEVELS[i], nxt = LEVELS[i + 1];
  const pct = nxt ? ((xp - cur[0]) / (nxt[0] - cur[0])) * 100 : 100;
  pill.innerHTML = `<span aria-hidden="true">${cur[2]}</span><span class="xp-text">${cur[1]}</span>
    <span class="xp-bar" aria-hidden="true"><i style="width:${pct}%"></i></span>`;
  pill.setAttribute('aria-label', `רמה: ${cur[1]}, ${xp} נקודות. לחצו לתגים`);
}
function openBadges() {
  const xp = XP.total();
  const i = XP.levelIndex(xp);
  const nxt = LEVELS[i + 1];
  const ladder = LEVELS.map((l, j) => `<li class="${j <= i ? 'done' : ''}${j === i ? ' now' : ''}">
      <span>${l[2]}</span> ${l[1]} <small>${l[0]} XP</small></li>`).join('');
  const grid = Object.entries(BADGES).map(([id, b]) => {
    const got = XP.has(id);
    return `<li class="badge ${got ? 'got' : ''}" title="${b.hint}">
      <span class="be">${got ? b.e : '🔒'}</span><b>${b.name}</b><small>${got ? `+${b.xp} XP` : b.hint}</small></li>`;
  }).join('');
  openModal(`
    <h2>${LEVELS[i][2]} ${LEVELS[i][1]}</h2>
    <p class="muted">${xp} XP${nxt ? ` · עוד ${nxt[0] - xp} עד ${nxt[1]} ${nxt[2]}` : ' · הגעתם לפסגה! 🔑'}</p>
    <ol class="ladder">${ladder}</ol>
    <h3>התגים שלכם (${XP.earned().length}/${Object.keys(BADGES).length})</h3>
    <ul class="badges">${grid}</ul>`, { wide: true });
}

(function layout() {
  const section = document.body.dataset.section || '';
  const header = document.getElementById('site-header');
  if (header) {
    header.className = 'site-header';
    header.innerHTML = `
      <div class="wrap">
        <div class="head-row">
          <a class="logo" href="index.html">🏠 <span>${SITE_NAME}</span></a>
          <button type="button" class="xp-pill"></button>
        </div>
        <nav class="nav" aria-label="ניווט ראשי">
          ${NAV.map(([href, label, key]) =>
            `<a href="${href}"${key === section ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
        </nav>
      </div>`;
    header.querySelector('.xp-pill').addEventListener('click', openBadges);
    renderPill();
  }
  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="wrap">
        <p><strong>חשוב:</strong> המידע כאן כללי ונועד לעשות סדר בראש. הוא לא ייעוץ משפטי, פיננסי או מיסויי.
        מספרים, מדרגות מס ומענקים משתנים, אז לפני החלטה גדולה בודקים במקור (רשות המסים, בנק ישראל, משרד הבינוי והשיכון)
        ומתייעצים עם בעלי מקצוע.</p>
        <p>הנתונים האישיים שלכם נשמרים רק בדפדפן שלכם, ולא נשלחים לשום מקום.</p>
        <p>עודכן לאחרונה: ${UPDATED} · גרסה ${VERSION} · ${SITE_NAME} · נבנה באהבה ובקצת חרדה מהמשכנתא 🫠</p>
      </div>`;
  }
  if (['basics', 'alt', 'tricks'].includes(section)) setTimeout(() => XP.award(`visit_${section}`), 600);
})();

/* ===== סליידרים: <input data-range="min,max,step"> ===== */
const UNITS = {
  price: '₪', saved: '₪', monthly: '₪', income: '₪', equity: '₪', loan: '₪', rent: '₪',
  ret: '%', rate: '%', share: '%', appr: '%', inv: '%', stress: '%',
  years: 'שנים', horizon: 'שנים',
};
const parseNum = (str) => {
  const v = parseFloat(String(str).replace(/[^\d.\-]/g, ''));
  return Number.isFinite(v) ? v : 0;
};
function fmtField(v, step) {
  return Number(v).toLocaleString('he-IL', { maximumFractionDigits: step < 1 ? 2 : 0 });
}
// מציב ערך בשדה משודרג (גם בסליידר שלידו)
function setField(input, v) {
  const step = input.dataset.range ? Number(input.dataset.range.split(',')[2]) : 1;
  input.value = input.dataset.enhanced ? fmtField(v, step) : v;
  const range = input.closest('.slider-pair') && input.closest('.slider-pair').querySelector('input[type="range"]');
  if (range) range.value = v;
  input.classList.remove('flash'); void input.offsetWidth; input.classList.add('flash');
}
function enhanceSliders(root = document) {
  root.querySelectorAll('input[data-range]').forEach((input) => {
    if (input.dataset.enhanced) return;
    input.dataset.enhanced = '1';
    const [min, max, step] = input.dataset.range.split(',').map(Number);
    const range = document.createElement('input');
    range.type = 'range'; range.min = min; range.max = max; range.step = step;
    range.setAttribute('aria-hidden', 'true'); range.tabIndex = -1;
    const start = parseNum(input.value);
    range.value = start;
    input.type = 'text';
    input.inputMode = step < 1 ? 'decimal' : 'numeric';
    input.autocomplete = 'off';
    input.value = fmtField(start, step);
    const wrap = document.createElement('div');
    wrap.className = 'slider-pair';
    input.parentNode.insertBefore(wrap, input);
    const unit = UNITS[input.name];
    if (unit) {
      const uw = document.createElement('span');
      uw.className = 'unit-wrap';
      uw.innerHTML = `<span class="unit" aria-hidden="true">${unit}</span>`;
      uw.prepend(input);
      wrap.appendChild(range); wrap.appendChild(uw);
      const label = input.id && document.querySelector(`label[for="${input.id}"]`);
      if (label) label.innerHTML = label.innerHTML.replace(/\s*\((₪|%)\)/, '');
    } else {
      wrap.appendChild(range); wrap.appendChild(input);
    }
    range.addEventListener('input', () => {
      input.value = fmtField(range.value, step);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    input.addEventListener('input', (e) => {
      if (!e.isTrusted) return;
      if (step >= 1) {
        // פסיקים בזמן ההקלדה, בלי שהסמן יקפוץ
        const pos = input.selectionStart ?? input.value.length;
        const digitsBefore = input.value.slice(0, pos).replace(/\D/g, '').length;
        const digits = input.value.replace(/\D/g, '');
        if (!digits) { range.value = min; return; }
        const v = Number(digits);
        input.value = fmtField(v, step);
        let i = 0, seen = 0;
        while (i < input.value.length && seen < digitsBefore) { if (/\d/.test(input.value[i])) seen++; i++; }
        try { input.setSelectionRange(i, i); } catch (err) { /* לא נתמך */ }
        range.value = v;
      } else {
        range.value = parseNum(input.value);
      }
    });
    input.addEventListener('focus', () => { setTimeout(() => { try { input.select(); } catch (e) {} }, 0); });
    input.addEventListener('blur', () => { input.value = fmtField(parseNum(input.value), step); });
  });
}

/* ===== גרף קווי פשוט ב־SVG ===== */
function lineChart(el, series, { xLabel = (i) => i, points } = {}) {
  if (!el) return;
  const W = 400, H = 190, L = 44, R = 10, T = 12, B = 26;
  const all = series.flatMap((s) => s.data);
  let max = Math.max(...all, 1), min = Math.min(0, ...all);
  const n = Math.max(...series.map((s) => s.data.length)) - 1 || 1;
  const x = (i) => L + (i / n) * (W - L - R);
  const y = (v) => T + (1 - (v - min) / (max - min)) * (H - T - B);
  const grid = [0, 0.5, 1].map((f) => {
    const v = min + (max - min) * f;
    return `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="g"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${compact(v)}</text>`;
  }).join('');
  const lines = series.map((s) => {
    const d = s.data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
    return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="3" ${s.dash ? 'stroke-dasharray="6 5"' : ''} stroke-linecap="round"/>`;
  }).join('');
  const xs = (points || [0, n]).map((i) => `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${xLabel(i)}</text>`).join('');
  const legend = series.filter((s) => s.label).map((s) =>
    `<span><i style="background:${s.color}"></i>${s.label}</span>`).join('');
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="גרף" direction="ltr">${grid}${lines}${xs}</svg>
    ${legend ? `<div class="legend">${legend}</div>` : ''}`;
}

/* ===== מס רכישה (מדרגות 2025, הוקפאו — לבדוק ברשות המסים) ===== */
const TAX_SOLE = [[1978745, 0], [2347040, 0.035], [6055070, 0.05], [20183565, 0.08], [Infinity, 0.10]];
const TAX_EXTRA = [[6055070, 0.08], [Infinity, 0.10]];
function purchaseTax(price, brackets) {
  let tax = 0, prev = 0;
  for (const [cap, rate] of brackets) {
    if (price > prev) tax += (Math.min(price, cap) - prev) * rate;
    prev = cap;
  }
  return tax;
}

/* ===== קבועים: סוגי בתים ודמויות (מספרים להמחשה בלבד) ===== */
const HOME_PRESETS = [
  { k: 'center', label: '🏙️ עיר מרכזית', price: 2600000, rent: 6500, hint: 'דירת 4 חדרים בעיר במרכז, כמו ראשון לציון או פתח תקווה' },
  { k: 'periphery', label: '🌄 עיר בפריפריה', price: 1400000, rent: 3800, hint: 'דירת 4 חדרים בעיר כמו באר שבע או עפולה' },
  { k: 'remote', label: '🏜️ מקום מרוחק', price: 850000, rent: 3000, hint: 'דירה או בית ביישוב קטן ורחוק בנגב או בגליל' },
  { k: 'tlv', label: '🤑 תל אביב', price: 4200000, rent: 9000, hint: 'דירת 4 חדרים בתל אביב. כי מותר לחלום' },
];
const PERSONAS = [
  { k: 'engineer', e: '👷', label: 'מהנדס/ת ממעמד הביניים', income: 17000, saved: 150000, monthly: 4000, home: 'center',
    line: 'משכורת יציבה, אקסל של הוצאות, ויכוח על ריביות בארוחת שישי.' },
  { k: 'tzfonbon', e: '🧥', label: 'צפונבוני/ת עם עבודה רגילה', income: 12000, saved: 450000, monthly: 2000, home: 'tlv',
    line: 'המשכורת רגילה לגמרי. ההון העצמי... פחות. תודה, אבא ואמא 😉' },
  { k: 'barber', e: '💈', label: 'ספר/ית מהפריפריה', income: 8000, saved: 40000, monthly: 1200, home: 'periphery',
    line: 'ידיים של זהב, לקוחות קבועים, ותור מלא עד יום חמישי.' },
  { k: 'hitech', e: '💻', label: 'הייטקיסט/ית צעיר/ה', income: 22000, saved: 120000, monthly: 7000, home: 'center',
    line: 'ארוחות צהריים במשרד, אופציות, ולחץ חברתי לקנות "לפני שהמחירים עולים".' },
  { k: 'teacher', e: '🍎', label: 'מורה', income: 9500, saved: 30000, monthly: 1500, home: 'periphery',
    line: 'חופש גדול, משכורת קטנה, וסבלנות אינסופית.' },
  { k: 'couple', e: '💑', label: 'זוג צעיר, שתי משכורות ממוצעות', income: 21000, saved: 100000, monthly: 4500, home: 'center',
    line: 'משכורת אחת לשכירות, משכורת אחת לחלום.' },
  { k: 'student', e: '🎓', label: 'סטודנט/ית', income: 5000, saved: 15000, monthly: 500, home: 'remote',
    line: 'נודלס, משמרות בערב, וחלומות גדולים.' },
];

function applyValues(form, values) {
  Object.entries(values).forEach(([key, v]) => {
    if (v == null) return;
    form.querySelectorAll(`[data-p="${key}"]`).forEach((el) => {
      if (el.tagName === 'SELECT') el.value = String(v); else setField(el, v);
    });
  });
  if (form._run) form._run();
}
function pressOnly(group, btn) {
  group.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === btn)));
}
function addPresets(form) {
  const priceInput = form.querySelector('input[data-p="price"]');
  if (priceInput) {
    const box = document.createElement('div');
    box.className = 'presets';
    box.innerHTML = `<div class="chips small-chips" role="group" aria-label="סוג הבית">${HOME_PRESETS.map((h) =>
      `<button type="button" class="chip" data-home="${h.k}" aria-pressed="false" title="${h.hint}">${h.label}</button>`).join('')}</div>
      <p class="preset-hint" data-hint></p>`;
    priceInput.closest('.field').querySelector('label').after(box);
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-home]');
      if (!b) return;
      const h = HOME_PRESETS.find((x) => x.k === b.dataset.home);
      pressOnly(box, b);
      box.querySelector('[data-hint]').textContent = `${h.hint}. מחיר משוער, להמחשה.`;
      form.querySelectorAll('[data-persona]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
      const line = form.querySelector('[data-line]');
      if (line) line.hidden = true;
      applyValues(form, { price: h.price, rent: h.rent });
    });
  }
  if (form.hasAttribute('data-personas')) {
    const box = document.createElement('div');
    box.className = 'personas';
    box.innerHTML = `<p class="personas-title">🎭 לא בא לכם למלא? בחרו דמות:</p>
      <div class="chips small-chips" role="group" aria-label="דמויות">${PERSONAS.map((p) =>
        `<button type="button" class="chip" data-persona="${p.k}" aria-pressed="false">${p.e} ${p.label}</button>`).join('')}</div>
      <p class="persona-line" data-line hidden></p>`;
    form.querySelector('.calc-head').after(box);
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-persona]');
      if (!b) return;
      const p = PERSONAS.find((x) => x.k === b.dataset.persona);
      const h = HOME_PRESETS.find((x) => x.k === p.home);
      pressOnly(box, b);
      const line = box.querySelector('[data-line]');
      line.hidden = false;
      line.innerHTML = `${p.e} <b>${p.label}:</b> ${p.line}
        <span class="muted">(נטו ${ils(p.income)} · חסכו ${ils(p.saved)} · חוסכים ${ils(p.monthly)} בחודש · ${h.label})</span>`;
      const homeBtn = form.querySelector(`[data-home="${h.k}"]`);
      if (homeBtn) { pressOnly(homeBtn.parentNode, homeBtn); form.querySelector('[data-hint]').textContent = `${h.hint}. מחיר משוער, להמחשה.`; }
      applyValues(form, { income: p.income, saved: p.saved, equity: p.saved, monthly: p.monthly, price: h.price, rent: h.rent });
    });
  }
  // עריכה ידנית מבטלת את הבחירה המסומנת
  form.addEventListener('input', (e) => {
    if (!e.isTrusted || !e.target.dataset || !e.target.dataset.p) return;
    const k = e.target.dataset.p;
    if (k === 'price' || k === 'rent') form.querySelectorAll('[data-home]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    if (['income', 'saved', 'equity', 'monthly', 'price'].includes(k)) {
      form.querySelectorAll('[data-persona]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    }
  });
}

/* ===== שקיפות: "איך חישבנו?" ===== */
// שורה: [תיאור, ערך, סוג] — סוג: 'total' (סיכום), 'hl' (התוצאה), 'note' (הערה)
function steps(form, rows) {
  const ol = form.querySelector('[data-out="steps"]');
  if (!ol) return;
  ol.innerHTML = rows.filter(Boolean).map(([label, value, kind]) =>
    `<li class="${kind || ''}"><span>${label}</span>${value != null ? `<b>${value}</b>` : ''}</li>`).join('');
}
const pctText = (v) => `${Number(v.toFixed(2))}%`;

/* ===== מחשבונים ===== */
const CALCS = {
  savings(form) {
    const price = num(form, 'price');
    const pctRaw = num(form, 'pct');
    const pct = pctRaw / 100;
    const saved = num(form, 'saved');
    const monthly = num(form, 'monthly');
    const retPct = num(form, 'ret');
    const ret = retPct / 100;
    const costs = pct >= 1 ? 0 : price * 0.03;
    const target = price * pct + costs;
    const missing = Math.max(0, target - saved);
    const sim = simulateSavings({ target, saved, monthly, ret });
    const m = sim.months;
    out(form, 'target', `יעד: <b>${ils(target)}</b> · חסר: <b>${ils(missing)}</b>`);
    let big, quip, boost = '';
    if (target <= 0) {
      big = '—'; quip = 'תכניסו מחיר דירה ונתחיל לחלום 🙂';
    } else if (m === 0) {
      big = 'יש לכם כבר! 🎉'; quip = 'מה אתם עושים פה? רוצו לבנק לבקש אישור עקרוני 🏃‍♀️';
    } else if (!Number.isFinite(m)) {
      big = 'בקצב הזה… לעולם לא 💀'; quip = 'רק ירושה תציל את המצב. נסו להעלות את החיסכון החודשי, או הציצו ב"דרכים אחרות".';
    } else {
      big = yearsMonths(m);
      const y = m / 12;
      quip = y < 2 ? 'כמעט שם! מותר להתחיל לגלול מודעות דירות (בזהירות).'
        : y < 5 ? 'ריאלי לגמרי. הוראת קבע, נשימה עמוקה, וקדימה.'
        : y < 10 ? 'מרתון, לא ספרינט. הטריקים יכולים לקצר את הדרך 👀'
        : 'אוקיי, זה ארוך. זה בדיוק הזמן להכיר את "דרכים אחרות לחיות" 🛥️';
      const m2 = simulateSavings({ target, saved, monthly: monthly + 500, ret }).months;
      if (m2 < m) boost = `💡 חוסכים עוד 500 ₪ בחודש? מגיעים <b>${yearsMonths(m - m2)}</b> מוקדם יותר.`;
    }
    out(form, 'big', big);
    out(form, 'quip', quip);
    out(form, 'boost', boost);
    const noRet = missing === 0 ? 'עכשיו' : monthly > 0 ? yearsMonths(Math.ceil(missing / monthly)) : 'לעולם לא';
    steps(form, [
      ['מחיר הדירה', ils(price)],
      [`× ${pctRaw}% הון עצמי שהבנק דורש`, ils(price * pct)],
      costs ? ['+ 3% עלויות נלוות (עו״ד, שמאי, תיווך, הובלה)', ils(costs)] : null,
      ['= היעד שלכם', ils(target), 'total'],
      ['− מה שכבר חסכתם', ils(saved)],
      ['= חסר לכם', ils(missing), 'total'],
      [`÷ ${ils(monthly)} בחודש, בלי תשואה`, noRet],
      [`עם תשואה של ${pctText(retPct)} בשנה (הכסף גם גדל)`, big, 'hl'],
    ]);
    const pctDone = target > 0 ? Math.min(1, saved / target) : 0;
    const fill = form.querySelector('.house-fill-rect');
    if (fill) { fill.setAttribute('y', String(100 - pctDone * 94)); fill.setAttribute('height', String(pctDone * 94)); }
    out(form, 'done', `${Math.round(pctDone * 100)}%`);
    const years = Math.min(30, Math.max(3, Math.ceil((Number.isFinite(m) ? m : 360) / 12)));
    const yearly = [];
    const rm = Math.pow(1 + ret, 1 / 12) - 1;
    let bal = saved;
    for (let i = 0; i <= years; i++) { yearly.push(bal); for (let k = 0; k < 12; k++) bal = bal * (1 + rm) + monthly; }
    lineChart(form.querySelector('[data-chart]'), [
      { data: yearly, color: 'var(--primary)', label: 'החיסכון שלכם' },
      { data: yearly.map(() => target), color: 'var(--accent)', dash: true, label: 'היעד' },
    ], { xLabel: (i) => (i === 0 ? 'היום' : `שנה ${i}`), points: [0, Math.round(years / 2), years] });
  },

  habits(form) {
    const checked = [...form.querySelectorAll('input[name="h"]:checked')];
    const monthly = checked.reduce((s, el) => s + Number(el.value), 0);
    const r = 0.05 / 12, n = 120;
    const fv10 = monthly * ((Math.pow(1 + r, n) - 1) / r);
    const p = Profile.get() || { price: 1800000, pct: 25, saved: 50000, monthly: 3000 };
    const target = p.price * (p.pct / 100) + (p.pct >= 100 ? 0 : p.price * 0.03);
    const base = simulateSavings({ target, saved: p.saved, monthly: p.monthly, ret: 0.04 }).months;
    const faster = simulateSavings({ target, saved: p.saved, monthly: p.monthly + monthly, ret: 0.04 }).months;
    out(form, 'big', monthly ? `${ils(monthly)} בחודש` : '0 ₪ 😇');
    out(form, 'row', monthly ? `
      <span>בשנה: <b>${ils(monthly * 12)}</b></span>
      <span>מושקע 10 שנים: <b>${ils(fv10)}</b></span>` : '');
    let quip = '';
    if (!monthly) quip = 'סמנו הרגלים ונראה כמה הם באמת עולים.';
    else if (Number.isFinite(base) && Number.isFinite(faster) && base > faster) {
      quip = `אם תחסכו אותם, תגיעו להון העצמי <b>${yearsMonths(base - faster)}</b> מוקדם יותר. לא אומרים לוותר על הכל, רק לבחור. ☕`;
    } else if (!Number.isFinite(base) && Number.isFinite(faster)) {
      quip = `בלי ההרגלים האלה, היעד פתאום אפשרי: <b>${yearsMonths(faster)}</b> במקום "לעולם לא". 🤯`;
    } else quip = 'כל שקל שחוזר אליכם הוא לבנה בבית העתידי. 🧱';
    out(form, 'quip', quip);
    const label = (el) => el.nextElementSibling.firstChild.textContent.trim();
    steps(form, monthly ? [
      ...checked.map((el) => [label(el), ils(Number(el.value))]),
      ['= בחודש', ils(monthly), 'total'],
      ['× 12 חודשים', ils(monthly * 12)],
      ['אם משקיעים במקום לבזבז: 10 שנים, 5% בשנה', ils(fv10), 'hl'],
      [`החישוב "מוקדם יותר" מבוסס על ${Profile.get() ? 'המפה האישית שלכם' : 'דירה ב־1.8 מיליון, 50 אלף בחיסכון ו־3,000 ₪ בחודש'}`, null, 'note'],
    ] : [['סמנו הרגלים, והחישוב יופיע כאן', null, 'note']]);
  },

  afford(form) {
    const income = num(form, 'income');
    const equity = num(form, 'equity');
    const share = num(form, 'share');
    const rate = num(form, 'rate');
    const years = num(form, 'years');
    const ltvPct = num(form, 'buyer');
    const payment = income * share / 100;
    const loanByIncome = pv(payment, rate, years);
    const priceByIncome = equity + loanByIncome;
    const priceByEquity = ltvPct > 0 ? equity / (ltvPct / 100) : 0;
    const price = Math.min(priceByIncome, priceByEquity);
    const loan = Math.max(0, price - equity);
    const limiter = priceByIncome < priceByEquity ? 'income' : 'equity';
    out(form, 'big', price > 0 ? ils(price) : '—');
    out(form, 'row', `
      <span>משכנתא: <b>${ils(loan)}</b></span>
      <span>החזר חודשי: <b>${ils(pmt(loan, rate, years))}</b></span>`);
    const bar = form.querySelector('[data-bar]');
    if (bar && price > 0) {
      bar.innerHTML = `<span style="width:${(equity / price) * 100}%" class="b-eq">הון עצמי</span><span style="width:${(loan / price) * 100}%" class="b-loan">משכנתא</span>`;
    }
    out(form, 'quip', price <= 0 ? 'תכניסו הכנסה והון עצמי 🙂'
      : limiter === 'income'
        ? '🧱 מה שעוצר אתכם הוא <b>ההכנסה</b>: הבנק לא ייתן החזר גבוה יותר. העלאה בשכר או בן/בת זוג עם משכורת עוזרים (רומנטי, אנחנו יודעים).'
        : '🧱 מה שעוצר אתכם הוא <b>ההון העצמי</b>: הבנק מממן רק חלק מהמחיר. כל שקל שתחסכו מגדיל את הדירה פי כמה.');
    steps(form, [
      ['שלב 1: כמה תוכלו להחזיר בחודש?', null, 'note'],
      ['הכנסה נטו', ils(income)],
      [`× ${share}% שהולכים להחזר`, `${ils(payment)} בחודש`, 'total'],
      [`שלב 2: איזו משכנתא ההחזר הזה מממן? (${pctText(rate)} ל־${years} שנה)`, ils(loanByIncome)],
      ['+ ההון העצמי שלכם', ils(equity)],
      ['= התקרה לפי ההכנסה', ils(priceByIncome), 'total'],
      [`שלב 3: הבנק מממן עד ${100 - ltvPct}%, אז ${ils(equity)} ÷ ${ltvPct}%`, null, 'note'],
      ['= התקרה לפי ההון העצמי', ils(priceByEquity), 'total'],
      ['הבנק ייתן את הנמוך מבין שתי התקרות', ils(price), 'hl'],
    ]);
  },

  mortgage(form) {
    const loan = num(form, 'loan');
    const rate = num(form, 'rate');
    const years = num(form, 'years');
    const stress = num(form, 'stress');
    const n = Math.round(years * 12);
    const r = rate / 100 / 12;
    const p = pmt(loan, rate, years);
    const total = p * n;
    const interest = Math.max(0, total - loan);
    out(form, 'big', loan > 0 ? ils(p) : '—');
    out(form, 'row', `
      <span>סה״כ תחזירו: <b>${ils(total)}</b></span>
      <span>מתוכם ריבית: <b>${ils(interest)}</b></span>`);
    const bar = form.querySelector('[data-bar]');
    if (bar && total > 0) {
      bar.innerHTML = `<span style="width:${(loan / total) * 100}%" class="b-eq">קרן</span><span style="width:${(interest / total) * 100}%" class="b-loan">ריבית</span>`;
    }
    const ratio = loan > 0 ? interest / loan : 0;
    out(form, 'quip', loan <= 0 ? '' : ratio > 0.8
      ? `הבנק מודה לכם על ${ils(interest)} 😘 נסו לקצר את התקופה ותראו מה קורה.`
      : ratio > 0.4 ? 'הריבית היא חלק רציני מהסיפור. כל עשירית אחוז שווה מיקוח.'
      : 'יפה! ריבית סבירה יחסית. הבנק פחות מחייך היום.');
    steps(form, [
      ['גובה המשכנתא (הקרן)', ils(loan)],
      [`ריבית שנתית ${pctText(rate)} ÷ 12 חודשים`, `${(rate / 12).toFixed(3)}% בחודש`],
      [`${years} שנים × 12`, `${n} תשלומים`],
      ['החזר חודשי קבוע (לוח שפיצר)', ils(p), 'hl'],
      [`× ${n} תשלומים`, ils(total)],
      ['− הקרן שקיבלתם', ils(loan)],
      ['= הריבית ששילמתם לבנק', ils(interest), 'total'],
      [`בתשלום הראשון: ${ils(loan * r)} ריבית ורק ${ils(p - loan * r)} קרן. עם השנים היחס מתהפך.`, null, 'note'],
    ]);
    const p2 = pmt(loan, rate + stress, years);
    const d = p > 0 ? (p2 - p) / p : 0;
    const face = stress === 0 ? '😎' : d < 0.05 ? '🙂' : d < 0.12 ? '😐' : d < 0.2 ? '😬' : d < 0.3 ? '😰' : '😱';
    out(form, 'face', face);
    out(form, 'stressText', stress === 0
      ? 'גררו את הסליידר וראו מה קורה אם הריבית עולה.'
      : `אם הריבית תעלה ב־${stress}%, ההחזר יקפוץ ל־<b>${ils(p2)}</b> (+${ils(p2 - p)} בחודש, +${Math.round(d * 100)}%).`);
  },

  tax(form) {
    const price = num(form, 'price');
    const kind = form.elements.kind.value;
    const brackets = kind === 'extra' ? TAX_EXTRA : TAX_SOLE;
    const tax = purchaseTax(price, brackets);
    out(form, 'big', price > 0 ? ils(tax) : '—');
    out(form, 'row', price > 0 ? `<span>שיעור אפקטיבי: <b>${(tax / price * 100).toFixed(2)}%</b></span>` : '');
    out(form, 'quip', price <= 0 ? '' : tax === 0
      ? 'אפס! 🥳 דירה יחידה מתחת לסף פטורה ממס רכישה. תכניסו את החיסכון לטיול.'
      : kind === 'extra'
        ? 'דירה נוספת = המדינה רוצה חלק מהחגיגה. משקיעים, תכניסו את זה לחישוב מההתחלה.'
        : 'משלמים רק על החלק שמעל הסף, לא על כל המחיר. נשמע הוגן, לא?');
    const rows = [['המס מחושב במדרגות: כל חלק מהמחיר במדרגה שלו', null, 'note']];
    let prev = 0;
    for (const [cap, rate] of brackets) {
      if (price <= prev) break;
      const part = Math.min(price, cap) - prev;
      rows.push([`${ils(prev)} עד ${ils(Math.min(price, cap))}: ${ils(part)} × ${Number((rate * 100).toFixed(1))}%`, rate === 0 ? 'פטור' : ils(part * rate)]);
      prev = cap;
    }
    rows.push(['= סך מס הרכישה', ils(tax), 'hl']);
    steps(form, rows);
  },

  rentbuy(form) {
    const price = num(form, 'price');
    const equity = num(form, 'equity');
    const rate = num(form, 'rate');
    const rent0 = num(form, 'rent');
    let rent = rent0;
    const horizon = Math.max(1, Math.round(num(form, 'horizon')));
    const apprPct = num(form, 'appr'), invPct = num(form, 'inv');
    const appr = apprPct / 100;
    const inv = invPct / 100;
    const term = 25;
    const upfront = price * 0.03;
    const down = Math.max(0, equity - upfront);
    const loan = Math.max(0, price - down);
    const pay = pmt(loan, rate, term);
    const r = rate / 100 / 12;
    const ri = Math.pow(1 + inv, 1 / 12) - 1;
    const ra = Math.pow(1 + appr, 1 / 12) - 1;
    let home = price, bal = loan, buyerPort = 0, renterPort = equity;
    const bSeries = [price - loan], rSeries = [equity];
    for (let m = 1; m <= horizon * 12; m++) {
      const mortgage = m <= term * 12 ? pay : 0;
      const maintenance = home * 0.005 / 12;
      if (m <= term * 12) bal = bal * (1 + r) - pay;
      home *= 1 + ra;
      buyerPort *= 1 + ri;
      renterPort *= 1 + ri;
      const diff = (mortgage + maintenance) - rent;
      if (diff > 0) renterPort += diff; else buyerPort += -diff;
      if (m % 12 === 0) {
        rent *= 1 + appr;
        bSeries.push(home - Math.max(0, bal) + buyerPort);
        rSeries.push(renterPort);
      }
    }
    const buyerNW = bSeries[bSeries.length - 1];
    const renterNW = rSeries[rSeries.length - 1];
    const buyWins = buyerNW >= renterNW;
    out(form, 'duo', `
      <div class="${buyWins ? 'win' : ''}"><span class="label">🔑 קונים</span><span class="big">${ils(buyerNW)}</span></div>
      <div class="${!buyWins ? 'win' : ''}"><span class="label">🧳 שוכרים ומשקיעים</span><span class="big">${ils(renterNW)}</span></div>`);
    const gap = Math.abs(buyerNW - renterNW);
    const close = gap < Math.max(buyerNW, renterNW) * 0.05;
    out(form, 'quip', close
      ? `🤝 כמעט תיקו (הפרש של ${ils(gap)}). אז תבחרו לפי הלב: יציבות או גמישות.`
      : buyWins
        ? `🔑 בתרחיש הזה הקנייה מנצחת ב־${ils(gap)}. הדוד שאמר "שכירות זה כסף לפח" מחייך עכשיו.`
        : `🧳 בתרחיש הזה השכירות + השקעה מנצחת ב־${ils(gap)}. בתנאי שבאמת משקיעים את ההפרש ולא קונים בו נעליים.`);
    out(form, 'mpay', '');
    const maint0 = price * 0.005 / 12;
    const diff0 = pay + maint0 - rent0;
    steps(form, [
      ['🔑 הקונים', null, 'note'],
      ['מההון העצמי יורדות עלויות קנייה (3%)', ils(upfront)],
      ['השאר הולך למקדמה', ils(down)],
      ['משכנתא על היתרה', ils(loan)],
      [`החזר חודשי (${pctText(rate)}, 25 שנה)`, ils(pay)],
      ['+ תחזוקה ותיקונים (0.5% מערך הדירה בשנה)', ils(maint0)],
      ['= עלות חודשית לקונים', ils(pay + maint0), 'total'],
      ['🧳 השוכרים', null, 'note'],
      ['משקיעים את כל ההון העצמי מהיום הראשון', ils(equity)],
      ['שכירות בחודש הראשון', ils(rent0)],
      [diff0 > 0 ? 'הקונים משלמים יותר, אז השוכרים משקיעים את ההפרש' : 'השוכרים משלמים יותר, אז הקונים משקיעים את ההפרש', `${ils(Math.abs(diff0))} בחודש`, 'total'],
      [`📈 כל שנה: דירות ושכירות עולות ${pctText(apprPct)}, השקעות מניבות ${pctText(invPct)}`, null, 'note'],
      [`בעוד ${horizon} שנה: שווי הדירה ${ils(home)} − יתרת משכנתא ${ils(Math.max(0, bal))} + השקעות ${ils(buyerPort)}`, ils(buyerNW), 'hl'],
      [`מול תיק ההשקעות של השוכרים`, ils(renterNW), 'hl'],
    ]);
    lineChart(form.querySelector('[data-chart]'), [
      { data: bSeries, color: 'var(--primary)', label: 'קונים' },
      { data: rSeries, color: 'var(--mint)', label: 'שוכרים ומשקיעים' },
    ], { xLabel: (i) => (i === 0 ? 'היום' : `שנה ${i}`), points: [0, Math.round(horizon / 2), horizon] });
  },
};

/* מילוי אוטומטי מהפרופיל: <input data-p="price|saved|monthly|income|equity|loan|pct"> */
function prefill(form) {
  const p = Profile.get();
  if (!p) return;
  form.querySelectorAll('[data-p]').forEach((el) => {
    const k = el.dataset.p;
    const v = k === 'equity' ? p.saved
      : k === 'loan' ? Math.max(0, Math.round(p.price * (1 - p.pct / 100) / 10000) * 10000)
      : p[k];
    if (v == null) return;
    if (el.tagName === 'SELECT') {
      if ([...el.options].some((o) => o.value === String(v))) el.value = String(v);
    } else if (el.dataset.enhanced) setField(el, v);
    else el.value = v;
  });
}

function initCalcs(root = document) {
  root.querySelectorAll('form[data-calc]').forEach((form) => {
    if (form.dataset.ready) return;
    form.dataset.ready = '1';
    const name = form.dataset.calc;
    const fn = CALCS[name];
    if (!fn) return;
    prefill(form);
    enhanceSliders(form);
    addPresets(form);
    const result = form.querySelector('.result');
    if (result && !form.querySelector('.steps')) {
      const d = document.createElement('details');
      d.className = 'steps';
      d.open = true;
      d.innerHTML = '<summary>🔍 איך חישבנו? (פתוח לגמרי, בלי קסמים)</summary><ol data-out="steps"></ol>';
      result.after(d);
    }
    const run = () => { try { fn(form); } catch (e) { console.error(e); } };
    form.addEventListener('input', (e) => {
      run();
      if (e.isTrusted || e.target.type === 'text') {
        XP.award(`calc_${name}`);
        if (name === 'mortgage' && e.target.name === 'stress' && num(form, 'stress') > 0) XP.award('stress');
      }
    });
    form.addEventListener('change', run);
    form.addEventListener('submit', (e) => e.preventDefault());
    form._run = run;
    run();
  });
}
initCalcs();
