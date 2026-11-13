/* ===== עמוד הבית: מסע אישי + מפה ===== */
const DREAMS = [
  { key: 'big', label: 'דירה בעיר גדולה 🏙️', price: 2400000, pct: 25, react: 'קפה טוב מתחת לבית. מחיר בהתאם. ☕' },
  { key: 'center', label: 'דירה במרכז, אבל לא מטורפת 🏘️', price: 1800000, pct: 25, react: 'הבחירה הקלאסית. אמא מאשרת. 👍' },
  { key: 'periphery', label: 'דירה בפריפריה עם מרפסת ענקית 🌄', price: 1100000, pct: 25, react: 'שקט, אוויר, וחנייה! חנייה!! 🚗' },
  { key: 'yacht', label: 'יאכטה 🛥️', price: 300000, pct: 100, react: 'קפטן! על יאכטה אין משכנתא, אז חוסכים את כל הסכום. ⚓' },
  { key: 'unsure', label: 'עוד לא יודעים 🤷', price: 1800000, pct: 25, react: 'מעולה, נשים מחיר ממוצע ונגלה בדרך. 🧭' },
];

const STEPS = [
  { key: 'age', q: 'בני כמה אתם?', min: 18, max: 50, step: 1, def: 26, show: (v) => `${v}`,
    react: (v) => v < 22 ? 'צעירים! הזמן הוא הנכס הכי גדול שלכם ⏳' : v < 30 ? 'גיל מושלם להתחיל לתכנן 💪' : v < 40 ? 'מעולה, עכשיו זה רציני 😎' : 'אף פעם לא מאוחר מדי 🙌' },
  { key: 'income', q: 'כמה נכנס נטו בחודש? (לכם, או לכם ולבן/בת הזוג)', min: 0, max: 50000, step: 500, def: 12000, show: ils,
    react: (v) => v < 6000 ? 'כל שקל נחשב. יש לנו עמוד מענקים בשבילכם 🎁' : v < 15000 ? 'בסיס טוב. עכשיו רק לא לבזבז הכל על וולט 🛵' : v < 30000 ? 'יפה! הבנקים כבר מחייכים אליכם 🏦' : 'וואו. הבנק רוצה להיות החבר הכי טוב שלכם 🤝' },
  { key: 'saved', q: 'כמה כבר חסכתם?', min: 0, max: 1500000, step: 5000, def: 40000, show: ils,
    react: (v) => v === 0 ? 'מתחילים מאפס, כמו כל הגיבורים 🦸' : v < 100000 ? 'התחלה! כל מסע מתחיל בשקל הראשון 🐷' : v < 400000 ? 'רציני! אתם כבר בדרך 🧱' : 'רגע, מה אתם עושים פה? 😅' },
  { key: 'monthly', q: 'כמה אתם מצליחים לחסוך בחודש?', min: 0, max: 20000, step: 100, def: 2500, show: ils,
    react: (v) => v === 0 ? 'נטפל בזה, יש לנו מחשבון הרגלים 😉' : v < 2000 ? 'כל חודש זה עוד לבנה 🧱' : v < 6000 ? 'קצב יפה מאוד 🚀' : 'מכונת חיסכון! 🤖' },
  { key: 'dream', q: 'ומה החלום?', choice: true },
];

function startOnboarding() {
  const old = Profile.get() || {};
  const ans = {
    age: old.age ?? STEPS[0].def, income: old.income ?? STEPS[1].def,
    saved: old.saved ?? STEPS[2].def, monthly: old.monthly ?? STEPS[3].def, dream: old.dream ?? null,
  };
  let i = 0;
  const dlg = openModal('<div class="ob-step"></div>');
  const box = dlg.querySelector('.ob-step');

  function render() {
    const s = STEPS[i];
    const progress = STEPS.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('');
    let body;
    if (s.choice) {
      const d = DREAMS.find((x) => x.key === ans.dream);
      body = `<div class="ob-choices">${DREAMS.map((x) =>
        `<button type="button" class="ob-choice" data-k="${x.key}" aria-pressed="${ans.dream === x.key}">${x.label}</button>`).join('')}</div>
        <p class="ob-react">${d ? d.react : ''}</p>`;
    } else {
      body = `<div class="ob-val" aria-live="polite">${s.show(ans[s.key])}</div>
        <input type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${ans[s.key]}" aria-label="${s.q}">
        <p class="ob-react">${s.react(ans[s.key])}</p>`;
    }
    const last = i === STEPS.length - 1;
    box.innerHTML = `<div class="ob-progress">${progress}</div>
      <div class="ob-q">${s.q}</div>${body}
      <div class="ob-nav">
        ${i > 0 ? '<button type="button" class="btn alt" data-nav="back">→ חזרה</button>' : '<span></span>'}
        <button type="button" class="btn" data-nav="next" ${last && !ans.dream ? 'disabled' : ''}>${last ? 'בנו לי מפה! 🗺️' : 'הבא ←'}</button>
      </div>`;
    const range = box.querySelector('input[type="range"]');
    if (range) {
      range.focus();
      range.addEventListener('input', () => {
        ans[s.key] = Number(range.value);
        box.querySelector('.ob-val').textContent = s.show(ans[s.key]);
        box.querySelector('.ob-react').textContent = s.react(ans[s.key]);
      });
    }
    box.querySelectorAll('.ob-choice').forEach((b) => b.addEventListener('click', () => {
      ans.dream = b.dataset.k; render();
    }));
    box.querySelector('[data-nav="next"]').addEventListener('click', () => {
      if (last) finish(); else { i++; render(); }
    });
    const back = box.querySelector('[data-nav="back"]');
    if (back) back.addEventListener('click', () => { i--; render(); });
  }

  function finish() {
    const d = DREAMS.find((x) => x.key === ans.dream) || DREAMS[1];
    Profile.set({ ...ans, price: d.price, pct: d.pct, dreamLabel: d.label });
    dlg.close();
    renderHome();
    refreshCalcs();
    XP.award('onboard');
    document.getElementById('hero-map').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  render();
}

function refreshCalcs() {
  document.querySelectorAll('form[data-calc]').forEach((form) => {
    prefill(form);
    if (form._run) form._run();
  });
}

function renderHome() {
  const p = Profile.get();
  document.getElementById('hero-new').hidden = !!p;
  document.getElementById('hero-map').hidden = !p;
  if (!p) return;
  const target = p.price * (p.pct / 100) + (p.pct >= 100 ? 0 : p.price * 0.03);
  const months = simulateSavings({ target, saved: p.saved, monthly: p.monthly, ret: 0.04 }).months;
  const pctNow = target > 0 ? Math.min(1, p.saved / target) : 0;

  let key, sub;
  if (months === 0) { key = 'עכשיו! 🎉'; sub = 'יש לכם מספיק הון עצמי. הבנק מחכה.'; }
  else if (!Number.isFinite(months)) { key = 'עוד לא… 😬'; sub = 'בקצב הנוכחי לא מגיעים. אבל יש מה לעשות, תכף נראה.'; }
  else {
    key = dateIn(months);
    const ageThen = p.age + months / 12;
    const a = Math.floor(ageThen);
    sub = p.dream === 'yacht' ? `תהיו בני ${a}. קפטן ${a}, נשמע טוב. ⚓`
      : ageThen < 30 ? `תהיו בני ${a}. עוד לפני 30! 🔥`
      : ageThen < 36 ? `תהיו בני ${a}. בדיוק בזמן לחנוכת בית עם החברים מהתיכון. 🥂`
      : ageThen < 45 ? `תהיו בני ${a}. לא מהר, אבל בטוח. 🐢`
      : `תהיו בני ${a}. אולי הנכדים יעזרו בהובלה 😅 שווה להציץ בדרכים אחרות.`;
  }

  const MS = [[0.1, '🐷', '10%'], [0.25, '🧱', 'רבע'], [0.5, '🏁', 'חצי'], [1, '🔑', 'מפתח']];
  const msData = MS.map(([f, e, name]) => {
    const done = p.saved >= target * f;
    const m = done ? 0 : simulateSavings({ target: target * f, saved: p.saved, monthly: p.monthly, ret: 0.04 }).months;
    return { f, e, name, done, when: done ? 'כבר שם ✔' : Number.isFinite(m) ? dateIn(m) : 'עוד לא…' };
  });
  const track = `<div class="track" aria-hidden="true">
      <div class="fill" style="width:${pctNow * 100}%"></div>
      <span class="you" style="right:${Math.min(92, Math.max(8, pctNow * 100))}%">אתם כאן</span>
      ${msData.map((m) => `<span class="ms ${m.done ? 'done' : ''}" style="right:${m.f * 100}%">${m.e}<span class="lbl">${m.name}</span></span>`).join('')}
    </div>`;
  const list = `<ul class="milestones">${msData.map((m) =>
    `<li class="${m.done ? 'done' : ''}"><b>${m.e} ${m.name === 'מפתח' ? 'יום המפתח' : `${m.name} מהדרך`}</b>${m.when}</li>`).join('')}</ul>`;

  let next;
  if (months === 0) next = ['יש לכם הון עצמי! עכשיו בודקים כמה דירה אפשר לקנות.', 'finance.html', 'למחשבון ←'];
  else if (!Number.isFinite(months) || months > 120) next = ['הדרך ארוכה. אולי שווה להכיר דרכים אחרות לחיות?', 'alt.html', 'תראו לי ←'];
  else if (p.monthly < p.income * 0.15) next = ['החיסכון החודשי נמוך יחסית להכנסה. בואו נבדוק כמה עולים ההרגלים.', 'save.html#habits-title', 'לבדוק ←'];
  else next = ['אתם בכיוון! עכשיו כמה טריקים שיחסכו לכם אלפים.', 'tricks.html', 'תנו טריק ←'];

  document.getElementById('map').innerHTML = `
    <div class="map-head">
      <div>
        <span class="muted small">החלום: ${p.dreamLabel} · יעד: ${ils(target)}</span>
        <div class="keyday">🔑 ${key}</div>
        <p class="muted">${sub}</p>
      </div>
      <div class="cta-row" style="margin-top:0"><a class="btn sun" href="game.html">🎮 למשחק</a><button type="button" class="btn alt" data-act="onboard">✏️ לעדכן</button></div>
    </div>
    ${track}
    ${list}
    <div class="next-step"><p>👉 הצעד הבא: ${next[0]}</p><a class="btn" href="${next[1]}">${next[2]}</a></div>`;
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-act="onboard"]')) startOnboarding();
});
renderHome();
