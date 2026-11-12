/* ===== הגדרות כלליות — כאן משנים את שם האתר ===== */
const SITE_NAME = 'שם זמני';
const UPDATED = 'נובמבר 2026';

const NAV = [
  ['index.html', 'בית', 'home'],
  ['basics.html', 'עקרונות יסוד', 'basics'],
  ['alt.html', 'דרכים אחרות', 'alt'],
  ['tricks.html', 'טריקים במשפט', 'tricks'],
];

/* ===== Header & Footer ===== */
(function layout() {
  const section = document.body.dataset.section || '';
  const header = document.getElementById('site-header');
  if (header) {
    header.className = 'site-header';
    header.innerHTML = `
      <div class="wrap">
        <a class="logo" href="index.html">🏠 <span>${SITE_NAME}</span> <span class="tag">בטא</span></a>
        <nav class="nav" aria-label="ניווט ראשי">
          ${NAV.map(([href, label, key]) =>
            `<a href="${href}"${key === section ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
        </nav>
      </div>`;
  }
  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="wrap">
        <p><strong>חשוב:</strong> המידע כאן כללי ונועד לעשות סדר בראש. הוא לא ייעוץ משפטי, פיננסי או מיסויי.
        מספרים, מדרגות מס ומענקים משתנים, אז לפני החלטה גדולה בודקים במקור (רשות המסים, בנק ישראל, משרד הבינוי והשיכון)
        ומתייעצים עם בעלי מקצוע.</p>
        <p>עודכן לאחרונה: ${UPDATED} · ${SITE_NAME} · נבנה באהבה ובקצת חרדה מהמשכנתא 🫠</p>
      </div>`;
  }
})();

/* ===== עזרים ===== */
const fmt = (n) => Math.round(n).toLocaleString('he-IL');
const ils = (n) => `${fmt(n)} ₪`;
const num = (form, name) => {
  const el = form.elements[name];
  if (!el) return 0;
  const v = parseFloat(String(el.value).replace(/,/g, ''));
  return Number.isFinite(v) ? v : 0;
};
const out = (form, key, html) => {
  const el = form.querySelector(`[data-out="${key}"]`);
  if (el) el.innerHTML = html;
};
// תשלום חודשי (שפיצר)
function pmt(principal, annualRatePct, years) {
  const n = Math.round(years * 12);
  if (n <= 0 || principal <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}
// כמה הלוואה אפשר לקחת בהחזר נתון
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

/* ===== מחשבונים ===== */
const CALCS = {
  // כמה זמן ייקח לחסוך
  savings(form) {
    const price = num(form, 'price');
    const pct = num(form, 'pct') / 100;
    const saved = num(form, 'saved');
    const monthly = num(form, 'monthly');
    const ret = num(form, 'ret') / 100;
    const costs = price * 0.03;
    const target = price * pct + costs;
    const rm = Math.pow(1 + ret, 1 / 12) - 1;
    const months = (extra) => {
      let bal = saved, m = 0;
      while (bal < target && m < 1200) { bal = bal * (1 + rm) + monthly + extra; m++; }
      return m;
    };
    const m = months(0);
    out(form, 'target', `יעד: ${ils(price * pct)} הון עצמי + כ־${ils(costs)} עלויות נלוות = <b>${ils(target)}</b>`);
    let big, quip, boost = '';
    if (target <= 0) {
      big = '—'; quip = 'תכניסו מחיר דירה ונתחיל לחלום 🙂';
    } else if (m === 0) {
      big = 'יש לכם כבר! 🎉';
      quip = 'מה אתם עושים פה? רוצו לבנק לבקש אישור עקרוני 🏃‍♀️';
    } else if (m >= 1200) {
      big = 'בקצב הזה… לעולם לא 💀';
      quip = 'רק ירושה תציל את המצב. בואו נעלה קצת את החיסכון החודשי, או נציץ בציר 2.';
    } else {
      big = yearsMonths(m);
      const y = m / 12;
      quip = y < 2 ? 'כמעט שם! מותר להתחיל לגלול מודעות דירות (בזהירות).'
        : y < 5 ? 'ריאלי לגמרי. הוראת קבע, נשימה עמוקה, וקדימה.'
        : y < 10 ? 'מרתון, לא ספרינט. הטריקים במשפט יכולים לקצר את הדרך 👀'
        : 'אוקיי, זה ארוך. זה בדיוק הזמן להכיר את "דרכים אחרות לחיות" 🛥️';
      const m2 = months(500);
      if (m2 < m) boost = `חוסכים עוד 500 ₪ בחודש? מגיעים <b>${yearsMonths(m - m2)}</b> מוקדם יותר.`;
    }
    out(form, 'big', big);
    out(form, 'quip', quip);
    out(form, 'boost', boost);
  },

  // כמה דירה אפשר להרשות לעצמכם
  afford(form) {
    const income = num(form, 'income');
    const equity = num(form, 'equity');
    const share = num(form, 'share');
    const rate = num(form, 'rate');
    const years = num(form, 'years');
    const ltvPct = num(form, 'buyer'); // אחוז הון עצמי מינימלי
    const shareOut = form.querySelector('output[name="shareOut"]');
    if (shareOut) shareOut.value = `${share}%`;
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
    out(form, 'quip', price <= 0 ? 'תכניסו הכנסה והון עצמי 🙂'
      : limiter === 'income'
        ? '🧱 מה שעוצר אתכם הוא <b>ההכנסה</b>: הבנק לא ייתן החזר גבוה יותר. העלאה בשכר או בן/בת זוג עם משכורת עוזרים (רומנטי, אנחנו יודעים).'
        : '🧱 מה שעוצר אתכם הוא <b>ההון העצמי</b>: הבנק מממן רק חלק מהמחיר. כל שקל שתחסכו מגדיל את הדירה פי כמה.');
  },

  // החזר חודשי
  mortgage(form) {
    const loan = num(form, 'loan');
    const rate = num(form, 'rate');
    const years = num(form, 'years');
    const p = pmt(loan, rate, years);
    const total = p * years * 12;
    const interest = Math.max(0, total - loan);
    out(form, 'big', loan > 0 ? ils(p) : '—');
    out(form, 'row', `
      <span>סה״כ תחזירו: <b>${ils(total)}</b></span>
      <span>מתוכם ריבית: <b>${ils(interest)}</b></span>`);
    const ratio = loan > 0 ? interest / loan : 0;
    out(form, 'quip', loan <= 0 ? '' : ratio > 0.8
      ? `הבנק מודה לכם על ${ils(interest)} 😘 נסו לקצר את התקופה ותראו מה קורה.`
      : ratio > 0.4 ? 'הריבית היא חלק רציני מהסיפור. כל עשירית אחוז שווה מיקוח.'
      : 'יפה! ריבית סבירה יחסית. הבנק פחות מחייך היום.');
  },

  // מס רכישה
  tax(form) {
    const price = num(form, 'price');
    const kind = form.elements.kind.value;
    const tax = purchaseTax(price, kind === 'extra' ? TAX_EXTRA : TAX_SOLE);
    out(form, 'big', price > 0 ? ils(tax) : '—');
    out(form, 'row', price > 0 ? `<span>שיעור אפקטיבי: <b>${(tax / price * 100).toFixed(2)}%</b></span>` : '');
    out(form, 'quip', price <= 0 ? '' : tax === 0
      ? 'אפס! 🥳 דירה יחידה מתחת לסף פטורה ממס רכישה. תכניסו את החיסכון לטיול.'
      : kind === 'extra'
        ? 'דירה נוספת = המדינה רוצה חלק מהחגיגה. משקיעים, תכניסו את זה לחישוב מההתחלה.'
        : 'משלמים רק על החלק שמעל הסף, לא על כל המחיר. נשמע הוגן, לא?');
  },

  // לקנות או לשכור ולהשקיע
  rentbuy(form) {
    const price = num(form, 'price');
    const equity = num(form, 'equity');
    const rate = num(form, 'rate');
    let rent = num(form, 'rent');
    const horizon = Math.max(1, Math.round(num(form, 'horizon')));
    const appr = num(form, 'appr') / 100;
    const inv = num(form, 'inv') / 100;
    const term = 25;
    const upfront = price * 0.03;                // עו"ד, שמאי, תיווך וכו'
    const down = Math.max(0, equity - upfront);
    const loan = Math.max(0, price - down);
    const pay = pmt(loan, rate, term);
    const r = rate / 100 / 12;
    const ri = Math.pow(1 + inv, 1 / 12) - 1;
    const ra = Math.pow(1 + appr, 1 / 12) - 1;
    let home = price, bal = loan, buyerPort = 0, renterPort = equity;
    for (let m = 1; m <= horizon * 12; m++) {
      const mortgage = m <= term * 12 ? pay : 0;
      const maintenance = home * 0.005 / 12;
      if (m <= term * 12) bal = bal * (1 + r) - pay;
      home *= 1 + ra;
      buyerPort *= 1 + ri;
      renterPort *= 1 + ri;
      const diff = (mortgage + maintenance) - rent;
      if (diff > 0) renterPort += diff; else buyerPort += -diff;
      if (m % 12 === 0) rent *= 1 + appr;
    }
    const buyerNW = home - Math.max(0, bal) + buyerPort;
    const renterNW = renterPort;
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
    out(form, 'mpay', `החזר משכנתא חודשי בתרחיש: <b>${ils(pay)}</b> · שכירות בהתחלה: <b>${ils(num(form, 'rent'))}</b>`);
  },
};

document.querySelectorAll('form[data-calc]').forEach((form) => {
  const fn = CALCS[form.dataset.calc];
  if (!fn) return;
  const run = () => { try { fn(form); } catch (e) { console.error(e); } };
  form.addEventListener('input', run);
  form.addEventListener('change', run);
  form.addEventListener('submit', (e) => e.preventDefault());
  run();
});
