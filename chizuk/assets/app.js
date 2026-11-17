/* ===== הגדרות כלליות ===== */
const SITE_NAME = 'נקודה טובה';
const VERSION = 3; // להעלות בכל עדכון, יחד עם ?v= בקבצי ה-HTML

const NAV = [
  ['index.html', 'היום', 'home'],
  ['etzot.html', 'כל העצות', 'etzot'],
  ['sources.html', 'מקורות', 'sources'],
  ['about.html', 'על האתר', 'about'],
];

/* ===== אחסון מקומי (עובד גם כשהדפדפן חוסם) ===== */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* בלי זיכרון */ } },
};

/* ===== עזרים ===== */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = (s) => s.replace(/[֑-ׇ]/g, ''); // הסרת ניקוד וטעמים
const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const dayNumber = (d = new Date()) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
const byId = (id) => ETZOT.find((e) => e.id === id);

function hebrewDate(d = new Date()) {
  try {
    return new Intl.DateTimeFormat('he-u-ca-hebrew', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  } catch (e) { return ''; }
}

function toast(msg) {
  let t = $('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ===== מאגר המקורות (assets/sources.json) ===== */
let SRC = {}, SRC_META = {};
const STATUS = {
  verified: { label: 'אומת מול ספריא', short: '✓ אומת', cls: 'st-ok' },
  secondary: { label: 'מקור משני: לא אותר המקור הראשוני', short: '◐ מקור משני', cls: 'st-mid' },
  tradition: { label: 'מסורת בעל פה, בלי מקור כתוב ידוע', short: '○ מסורת', cls: 'st-trad' },
};
const sourcesReady = fetch(`assets/sources.json?v=${VERSION}`)
  .then((r) => r.json())
  .then((j) => { SRC = j.sources || {}; SRC_META = j.meta || {}; })
  .catch(() => { console.warn('לא נטען מאגר המקורות (צריך שרת, לא file://)'); });

const srcLabel = (id) => { const s = SRC[id]; return s ? `${s.book}, ${s.loc}` : id; };
// קישור למקור: תמיד לרשומה במאגר (sources.html#id)
function srcLink(id) {
  const s = SRC[id];
  if (!s) return `<span>${esc(id)}</span>`;
  return `<a class="src-link" href="sources.html#${encodeURIComponent(id)}" title="${esc(STATUS[s.status]?.label || '')}">${esc(srcLabel(id))}</a>`;
}
function srcBadge(id, basis = false) {
  const st = STATUS[SRC[id]?.status];
  if (!st) return '';
  const short = basis && SRC[id].status === 'verified' ? '✓ מקור הרעיון אומת' : st.short;
  return `<span class="st ${st.cls}" title="${esc(st.label)}">${short}</span>`;
}
// ממלא כל <a data-src="id"> בעמוד בקישור למאגר
function fillSrcLinks(root = document) {
  root.querySelectorAll('[data-src]').forEach((el) => {
    const id = el.dataset.src;
    el.href = `sources.html#${encodeURIComponent(id)}`;
    el.classList.add('src-link');
    if (!el.textContent.trim()) el.textContent = srcLabel(id);
    el.title = STATUS[SRC[id]?.status]?.label || '';
  });
}
sourcesReady.then(() => fillSrcLinks());

/* ===== מועדפים ===== */
const Favs = {
  list() { return store.get('favs-v1', []); },
  has(id) { return this.list().includes(id); },
  toggle(id) {
    const l = this.list();
    const i = l.indexOf(id);
    if (i >= 0) l.splice(i, 1); else l.push(id);
    store.set('favs-v1', l);
    return i < 0;
  },
};

/* ===== כרטיס עצה ===== */
function etzaHTML(e, { big = false, label = '' } = {}) {
  const s = TRADITIONS[e.who];
  const main = e.refs[0];
  const more = e.refs.slice(1);
  const url = SRC[main]?.url;
  const fav = Favs.has(e.id);
  return `
  <article class="etza ${big ? 'big' : ''} fade-in" data-id="${e.id}">
    <span class="tag">${label ? esc(label) + ' · ' : ''}${esc(s.name)}</span>
    <blockquote>${esc(e.text)}</blockquote>
    <div class="src">
      ${SRC[main]?.author ? `<span class="who">${esc(SRC[main].author)}</span> · ` : ''}${e.basis ? 'על פי ' : ''}${srcLink(main)}${more.length ? `; וראו ${more.map(srcLink).join('; ')}` : ''}
      ${srcBadge(main, e.basis)}${e.free ? '<span class="free" title="הלשון מקוצרת או חופשית, ולא ציטוט מילה במילה">בלשון חופשית</span>' : ''}
      ${url ? `<a class="sefaria" href="${esc(url)}" target="_blank" rel="noopener">בספריא ↗</a>` : ''}
    </div>
    <p class="plain"><b>בשפה פשוטה:</b> ${esc(e.plain)}</p>
    <div class="act"><span class="ico" aria-hidden="true">👣</span><div><b>מה עושים עם זה היום?</b>${esc(e.act)}</div></div>
    <div class="tools">
      <button type="button" class="tool ${fav ? 'on' : ''}" data-act="fav" aria-pressed="${fav}">${fav ? '★ שמור' : '☆ לשמור'}</button>
      <button type="button" class="tool" data-act="share">↗ לשתף</button>
    </div>
  </article>`;
}

function shareText(e) {
  return `״${strip(e.text)}״\n(${e.basis ? 'על פי ' : ''}${e.refs.map(srcLabel).join('; ')})\n\n👣 ${e.act}\n\nמתוך "${SITE_NAME}"`;
}

async function shareEtza(e) {
  const text = shareText(e);
  const url = location.href.split('#')[0].replace(/[^/]*$/, '') + `etzot.html#${e.id}`;
  if (navigator.share) {
    try { await navigator.share({ title: SITE_NAME, text, url }); return; } catch (err) { if (err && err.name === 'AbortError') return; }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    toast('העצה הועתקה. אפשר להדביק לחבר 💛');
  } catch (err) {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank', 'noopener');
  }
}

/* לחיצות על כפתורי הכרטיסים, בכל עמוד */
document.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.etza .tool');
  if (!btn) return;
  const e = byId(btn.closest('.etza').dataset.id);
  if (!e) return;
  if (btn.dataset.act === 'fav') {
    const on = Favs.toggle(e.id);
    document.querySelectorAll(`.etza[data-id="${e.id}"] [data-act="fav"]`).forEach((b) => {
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
      b.textContent = on ? '★ שמור' : '☆ לשמור';
    });
    toast(on ? 'נשמר ב"העצות שלי"' : 'הוסר מהשמורים');
    document.dispatchEvent(new CustomEvent('favs-changed'));
  } else if (btn.dataset.act === 'share') {
    shareEtza(e);
  }
});

/* ===== כותרת ותחתית ===== */
function applyTheme(t) {
  if (t) document.documentElement.setAttribute('data-theme', t);
  else document.documentElement.removeAttribute('data-theme');
}
applyTheme(store.get('theme', null));

function renderChrome() {
  const section = document.body.dataset.section;
  const h = $('#site-header');
  if (h) {
    h.className = 'site-header';
    h.innerHTML = `<div class="wrap">
      <a class="logo" href="index.html"><span class="logo-dot" aria-hidden="true"></span>${SITE_NAME}</a>
      <nav class="nav" aria-label="ניווט ראשי">
        ${NAV.map(([href, label, key]) => `<a href="${href}" ${key === section ? 'aria-current="page"' : ''}>${label}</a>`).join('')}
        <button type="button" class="theme-btn" id="theme-btn" aria-label="החלפת מצב תצוגה">◐</button>
      </nav>
    </div>`;
    $('#theme-btn').addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme')
        || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = cur === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      store.set('theme', next);
    });
  }
  const f = $('#site-footer');
  if (f) {
    f.className = 'site-footer';
    f.innerHTML = `<div class="wrap">
      <p>"${SITE_NAME}": עצות מרבי נחמן, מחב״ד ומצדיקי החסידות, לעבודת ה׳ ולהתחזקות בעשיית טוב.</p>
      <p>הדברים מובאים לחיזוק ולהשראה. לשאלות הלכה ולהדרכה אישית, פנו לרב. גרסה ${VERSION}.</p>
      <p><a href="../index.html">← לכל האתרים</a> · <a href="../habayta/index.html">נוסעים הביתה: מדריך לדירה ראשונה</a></p>
    </div>`;
  }
}
renderChrome();
