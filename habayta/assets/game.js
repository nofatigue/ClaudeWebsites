/* ===== משחק החיים: מגיל 23 עד 35 ===== */
const END_AGE = 35;
const H = {
  parents: { key: 'parents', label: 'אצל ההורים 🛋️', cost: 0, happy: -3, free: -3 },
  roommates: { key: 'roommates', label: 'שותפים 🏙️', cost: 2800, happy: 1, free: 2 },
  alone: { key: 'alone', label: 'דירה לבד 🏠', cost: 5200, happy: 3, free: 3 },
  together: { key: 'together', label: 'דירה עם בן/בת זוג 💑', cost: 5600, happy: 3, free: 1 },
  owner: { key: 'owner', label: 'הדירה שלכם 🔑', cost: 0, happy: 4, free: -1 },
  yacht: { key: 'yacht', label: 'יאכטה ⛵', cost: 2500, happy: 5, free: 5 },
  kibbutz: { key: 'kibbutz', label: 'קיבוץ 🌾', cost: 2400, happy: 5, free: 0 },
};
const RENTAL = ['roommates', 'alone', 'together', 'yacht', 'kibbutz'];
const buyPrice = (s) => Math.round(1800000 * Math.pow(1.03, s.age - 23) / 10000) * 10000;
const invPrice = (s) => Math.round(1100000 * Math.pow(1.03, s.age - 23) / 10000) * 10000;
const clamp = (v) => Math.max(0, Math.min(100, v));

function newState() {
  return {
    age: 23, salary: 8500, living: 4500, housing: { ...H.parents }, cash: 15000, invested: false,
    home: null, invest: null, yacht: 0, partner: false, car: 0, extra: 0,
    happy: 60, free: 45, used: {}, last: {}, log: [], flags: {},
  };
}
const netWorth = (s) => s.cash + (s.home ? s.home.value - s.home.loan : 0)
  + (s.invest ? s.invest.value - s.invest.loan : 0) + s.yacht;
function monthly(s) {
  const income = s.salary + s.extra + (s.partner ? 7000 : 0) + (s.invest ? s.invest.rent : 0);
  const out = s.living + s.housing.cost + s.car + (s.home ? s.home.payment + 400 : 0) + (s.invest ? s.invest.payment + 300 : 0);
  return income - out;
}
function buyProperty(price, rent) {
  const loan = price * 0.75;
  return { value: price, loan, payment: pmt(loan, 4.5, 25), rent: rent || 0 };
}
function amortize(p) {
  const r = 0.045 / 12;
  for (let i = 0; i < 12; i++) p.loan = Math.max(0, p.loan * (1 + r) - p.payment);
  p.value *= 1.03;
}
function yearTick(s) {
  const before = netWorth(s);
  const flow = monthly(s) * 12;
  s.cash += flow;
  if (s.cash > 0) { if (s.invested) s.cash *= 1.055; } else { s.cash *= 1.1; s.happy -= 6; }
  if (s.home) amortize(s.home);
  if (s.invest) { amortize(s.invest); s.invest.rent *= 1.03; }
  if (s.yacht) s.yacht *= 0.93;
  if (RENTAL.includes(s.housing.key)) s.housing.cost *= 1.03;
  s.living *= 1.02; s.salary *= 1.03;
  s.happy = clamp(s.happy + s.housing.happy + (s.partner ? 1 : 0));
  s.free = clamp(s.free + s.housing.free);
  s.age++;
  return { flow, delta: netWorth(s) - before };
}

/* ===== קלפי החלטה (לפי סדר עדיפות) ===== */
const CARDS = [
  { id: 'start', when: (s) => s.age === 23,
    title: 'השתחררתם, יש עבודה ראשונה. איפה גרים?',
    text: (s) => `משכורת נטו: ${ils(s.salary)}. הפיקדון מהצבא נכנס: ${ils(s.cash)} בחשבון.`,
    choices: [
      { label: 'נשארים אצל ההורים 🛋️', hint: '0 ₪ בחודש. פרטיות: גם 0.', do: (s) => { s.housing = { ...H.parents }; return 'אמא שמחה. החשבון שלכם שמח יותר. הפרטיות שלכם פחות.'; } },
      { label: 'שותפים בדירה בעיר 🏙️', hint: '~2,800 ₪ בחודש', do: (s) => { s.housing = { ...H.roommates }; return 'שלושה שותפים, מקרר אחד, אפס מדפים פנויים. אבל איזה מסיבות. 🎉'; } },
      { label: 'דירה לבד 🏠', hint: '~5,200 ₪ בחודש', do: (s) => { s.housing = { ...H.alone }; return 'שקט, פרטיות, ושכירות שאוכלת חצי משכורת.'; } },
    ] },
  { id: 'money', when: (s) => s.age >= 24,
    title: 'יש לכם כסף בעו״ש. מה עושים איתו?',
    text: (s) => `בחשבון: ${ils(Math.max(0, s.cash))}.`,
    choices: [
      { label: 'קרן מחקה מדד 📈', hint: 'הכסף מתחיל לעבוד בשבילכם', do: (s) => { s.invested = true; return 'מעכשיו הכסף עובד גם כשאתם ישנים. אל תסתכלו עליו כל יום (תסתכלו).'; } },
      { label: 'טיסה לתאילנד 🏝️', hint: '-12,000 ₪, הרבה אושר', do: (s) => { s.cash -= 12000; s.happy += 12; return 'שבועיים של פאד תאי ושקיעות. שווה כל באט. 🥭'; } },
      { label: 'משאירים בעו״ש 😴', hint: 'בטוח. וגם משעמם', do: () => 'האינפלציה מודה לכם על התרומה.' },
    ] },
  { id: 'career', when: (s) => s.age >= 24,
    title: 'הצעה: קורס הסבה של חצי שנה, בלי משכורת בזמן הקורס.',
    text: () => 'אחרי הקורס המשכורת אמורה לקפוץ. אמורה.',
    choices: [
      { label: 'הולכים על זה 💻', hint: 'עולה חצי שנה של משכורת', do: (s) => { s.cash -= s.salary * 6; s.salary += 5000; s.happy -= 3; return 'חצי שנה של בכי מול המחשב. אבל המשכורת קפצה ב־5,000 ₪! 🚀'; } },
      { label: 'נשארים בעבודה 🧘', hint: 'יציבות', do: (s) => { s.salary += 700; return 'יציבות. וגם העלאה קטנה, כי הבוס אוהב אתכם.'; } },
      { label: 'פותחים סטארטאפ 🦄', hint: 'הימור. סיכוי של בערך 1 ל־3', do: (s) => {
        if (Math.random() < 0.35) { s.salary += 9000; s.happy += 6; return 'זה עבד! המשכורת זינקה ב־9,000 ₪. 🦄'; }
        s.cash -= 40000; s.happy -= 4; return 'הסטארטאפ נסגר אחרי שנה (-40,000 ₪). נשאר לוגו יפה וסיפורים לדייטים.';
      } },
    ] },
  { id: 'car', when: (s) => s.age >= 25,
    title: 'נמאס מהאוטובוס. רכב?',
    text: () => 'תחבורה ציבורית זה נחמד, עד שמחכים 40 דקות בגשם.',
    choices: [
      { label: 'ליסינג חדש ונוצץ 🚗', hint: '~2,200 ₪ בחודש', do: (s) => { s.car = 2200; s.happy += 4; s.free += 3; return 'ריח של רכב חדש. ריח של 2,200 ₪ בחודש.'; } },
      { label: 'רכב יד שנייה 🚙', hint: '-30,000 ₪, ואז ~900 ₪ בחודש', do: (s) => { s.cash -= 30000; s.car = 900; s.free += 3; return 'מאזדה 2014. נוסעת, לא שואלת שאלות.'; } },
      { label: 'אופניים חשמליים 🛴', hint: '-5,000 ₪, כמעט בחינם אחר כך', do: (s) => { s.cash -= 5000; s.car = 150; s.happy += 1; return 'חוסכים, והפקקים? לא אתם. 😎'; } },
    ] },
  { id: 'taxback', when: (s) => s.age >= 26,
    title: 'שמעתם שאפשר לבדוק החזר מס 🧾',
    text: () => 'החלפתם עבודה באמצע שנה? יש מצב שמגיע לכם כסף.',
    choices: [
      { label: 'בודקים באתר רשות המסים 🔍', hint: '20 דקות של בירוקרטיה', do: (s) => { s.cash += 5500; return 'מצאתם 5,500 ₪ שהמדינה חייבת לכם! 🎁'; } },
      { label: 'בירוקרטיה? לא תודה 🙅', do: () => 'המדינה מודה לכם על התרומה הנדיבה.' },
    ] },
  { id: 'partner', when: (s) => s.age >= 26,
    title: 'פגשתם מישהו/י מיוחד/ת 💘',
    text: () => 'עברו כמה חודשים. לעבור לגור יחד?',
    choices: [
      { label: 'כן! 💑', hint: 'שתי משכורות', do: (s) => {
        s.partner = true; s.happy += 6;
        if (['parents', 'roommates', 'alone'].includes(s.housing.key)) s.housing = { ...H.together };
        return 'שתי משכורות, מטבח אחד, וויכוח נצחי על המזגן.';
      } },
      { label: 'עוד מוקדם 🙃', do: (s) => { s.free += 3; return 'לאט לאט. גם דירה לא קונים בדייט הראשון.'; } },
    ] },
  { id: 'yacht', when: (s) => s.age >= 27 && !s.home && s.housing.key !== 'kibbutz',
    title: 'חבר מוכר יאכטה ישנה ⛵',
    text: () => '180,000 ₪. עגינה, ביטוח ותחזוקה: כ־2,500 ₪ בחודש.',
    choices: [
      { label: 'גרים על המים! 🌊', can: (s) => s.cash >= 180000 || `חסרים לכם ${ils(180000 - s.cash)}`,
        do: (s) => { s.cash -= 180000; s.yacht = 180000; s.housing = { ...H.yacht }; s.flags.yacht = true; XP.award('game_yacht'); return 'שקיעה כל ערב, השכנים הם שחפים. המקלחת... נדבר על זה. 🧜'; } },
      { label: 'לא, יש לי מחלת ים 🤢', do: () => 'בחירה סבירה ויבשה.' },
    ] },
  { id: 'buy', repeat: true, cool: 2, when: (s) => s.age >= 28 && !s.home && !s.invest,
    title: (s) => `מצאתם דירת 3 חדרים ב־${ils(buyPrice(s))}`,
    text: (s) => `צריך 25% הון עצמי + עלויות: ${ils(buyPrice(s) * 0.28)}. יש לכם: ${ils(Math.max(0, s.cash))}.`,
    choices: [
      { label: 'קונים! 🔑', hint: 'משכנתא ל־25 שנה',
        can: (s) => s.cash >= buyPrice(s) * 0.28 || `חסרים לכם ${ils(buyPrice(s) * 0.28 - s.cash)}`,
        do: (s) => {
          const price = buyPrice(s);
          if (s.yacht) { s.cash += s.yacht; s.yacht = 0; }
          s.cash -= price * 0.28; s.home = buyProperty(price); s.housing = { ...H.owner }; s.flags.owner = true;
          XP.award('game_owner');
          return 'מזל טוב! יש לכם דירה. וגם משכנתא ל־25 שנה. בעיקר משכנתא. 🎉';
        } },
      { label: 'קונים בפריפריה ומשכירים 🗺️', hint: (s) => `${ils(invPrice(s))}, ממשיכים לגור איפה שאתם`,
        can: (s) => s.cash >= invPrice(s) * 0.28 || `חסרים לכם ${ils(invPrice(s) * 0.28 - s.cash)}`,
        do: (s) => {
          const price = invPrice(s);
          s.cash -= price * 0.28; s.invest = buyProperty(price, 3800); s.flags.rentvest = true;
          return 'אתם בעלי דירה ושוכרים באותו זמן. Rentvesting! 🧠 טיפ: אם זו הדירה היחידה שלכם, היא נחשבת "דירה יחידה" גם כשהיא מושכרת.';
        } },
      { label: 'מוותרים, ממשיכים לחסוך 🐷', do: () => 'אולי בפעם הבאה. בינתיים המחירים עלו 3% 😅' },
    ] },
  { id: 'side', when: (s) => s.age >= 28,
    title: 'חבר מציע פרויקט צד בערבים 🌙',
    text: () => 'בערך 2,000 ₪ בחודש. על חשבון השינה, כמובן.',
    choices: [
      { label: 'כן, כסף זה כסף 💪', do: (s) => { s.extra += 2000; s.happy -= 4; return 'השינה זה לחלשים. ☕☕☕'; } },
      { label: 'הערבים שלי קדושים 🛋️', do: (s) => { s.happy += 2; return 'נטפליקס מודה לכם.'; } },
    ] },
  { id: 'wedding', when: (s) => s.partner && s.age >= 29,
    title: 'מתחתנים! 💍 איזו חתונה?',
    text: () => 'דודה שולה כבר שאלה איפה האולם.',
    choices: [
      { label: 'אולם, 400 איש 🎊', hint: 'הצ׳קים יכסו? כמעט', do: (s) => { s.cash -= 30000; s.happy += 5; return 'דוד אחד רקד על השולחן. הצ׳קים כמעט כיסו (-30,000 ₪).'; } },
      { label: 'חתונה קטנה בטבע 🌿', do: (s) => { s.cash -= 5000; s.happy += 7; return 'כולם בכו. מהיופי, לא מהמחיר. 🌿'; } },
      { label: 'קפריסין וטיול ✈️', do: (s) => { s.cash -= 15000; s.happy += 5; s.free += 3; return 'אפס סידורי הושבה. 100% שמש.'; } },
    ] },
  { id: 'kibbutz', when: (s) => s.age >= 29 && !s.home && !s.flags.yacht,
    title: 'קיבוץ בגליל מחפש משפחות צעירות 🌾',
    text: () => 'בית בהרחבה, קהילה, בריכה. עבודה מרחוק, או נסיעות ארוכות.',
    choices: [
      { label: 'עוברים! 🚜', hint: 'שכירות זולה, המשכורת קצת יורדת', do: (s) => { s.housing = { ...H.kibbutz }; s.salary -= 1000; XP.award('game_kibbutz'); return 'דשא, בריכה, ילדים יחפים. וגם תורנות מטבח פעם בחודש.'; } },
      { label: 'אני ילד/ת עיר 🏙️', do: () => 'הדשא של השכן תמיד ירוק יותר. במיוחד בקיבוץ.' },
    ] },
  { id: 'fire', when: (s) => s.age >= 30,
    title: 'קראתם על FIRE: לחיות על חצי ולפרוש מוקדם 🔥',
    text: () => 'האינטרנט מלא באנשים בני 40 שכבר לא עובדים.',
    choices: [
      { label: 'מנסים! 🥗', hint: '-1,500 ₪ הוצאות בחודש', do: (s) => { s.living -= 1500; s.happy -= 6; s.flags.fire = true; return 'אורז ושעועית. אבל החיסכון טס.'; } },
      { label: 'חיים רק פעם אחת 🍣', do: (s) => { s.living += 800; s.happy += 5; return 'סושי ביום שלישי. כי מגיע לכם.'; } },
    ] },
  { id: 'refi', when: (s) => (s.home || s.invest) && s.age >= 31,
    title: 'הריבית ירדה. למחזר את המשכנתא?',
    text: () => 'יש עמלה, אבל ההחזר החודשי יכול לרדת.',
    choices: [
      { label: 'ממחזרים 🏦', hint: '-5,000 ₪ עמלות', do: (s) => { const p = s.home || s.invest; p.payment *= 0.9; s.cash -= 5000; return 'עמלה קטנה, חיסכון גדול. ההחזר ירד ב־10%.'; } },
      { label: 'עזבו, עצלנים 🦥', do: () => 'עצלנות עולה כסף. אבל גם זמן זה כסף. 🤷' },
    ] },
  { id: 'quiet', repeat: true, when: () => true,
    title: 'שנה שקטה. מה עושים עם הזמן?',
    text: () => 'אין דרמות השנה. נדיר.',
    choices: [
      { label: 'שעות נוספות 💼', hint: '+15,000 ₪', do: (s) => { s.cash += 15000; s.happy -= 3; return 'הבוס מרוצה. הגב פחות.'; } },
      { label: 'לומדים משהו חדש 📚', hint: 'משכורת גבוהה יותר', do: (s) => { s.salary += 600; return 'תעודה חדשה, העלאה קטנה.'; } },
      { label: 'חופשה בצפון 🏕️', hint: '-6,000 ₪', do: (s) => { s.cash -= 6000; s.happy += 6; return 'צימר, ג׳קוזי, ושקט מהטלפון. 🧖'; } },
    ] },
];

/* ===== אירועים אקראיים ===== */
const EVENTS = [
  { w: 3, when: () => true, t: 'קיבלתם העלאה! 📈 (+8%)', do: (s) => { s.salary *= 1.08; } },
  { w: 2, when: () => true, t: 'החתול שבר את הטלוויזיה. 🐈📺 (-2,500 ₪)', do: (s) => { s.cash -= 2500; } },
  { w: 2, when: () => true, t: 'המזגן מת באמצע אוגוסט. 🥵 (-4,000 ₪)', do: (s) => { s.cash -= 4000; s.happy -= 2; } },
  { w: 2, when: (s) => s.invested, t: 'השוק נפל 15%. לא מוכרים בפאניקה! 📉', do: (s) => { if (s.cash > 0) s.cash *= 0.85; } },
  { w: 2, when: (s) => s.invested, t: 'השוק טס! +15% 🚀', do: (s) => { if (s.cash > 0) s.cash *= 1.15; } },
  { w: 2, when: (s) => s.home || s.invest, t: 'בנק ישראל העלה ריבית. הפריים עלה, וגם הדופק. 💓', do: (s) => { (s.home || s.invest).payment *= 1.06; s.happy -= 2; } },
  { w: 1, when: (s) => s.home || s.invest, t: 'השכונה התחממה! הדירה שווה 6% יותר. 🏘️', do: (s) => { (s.home || s.invest).value *= 1.06; } },
  { w: 2, when: (s) => ['roommates', 'alone', 'together'].includes(s.housing.key), t: 'המשכיר: "השוק עלה". השכירות עלתה ב־10%. 🙄', do: (s) => { s.housing.cost *= 1.1; } },
  { w: 1, when: () => true, t: 'דודה רחוקה שלחה צ׳ק ליום הולדת. 🎂 (+3,000 ₪)', do: (s) => { s.cash += 3000; } },
  { w: 2, when: () => true, t: 'השכן התחיל ללמוד תופים. 🥁', do: (s) => { s.happy -= 4; } },
  { w: 1, when: () => true, t: 'מצאתם 200 ₪ במעיל של החורף. 🧥', do: (s) => { s.cash += 200; } },
  { w: 3, when: (s) => s.housing.key === 'yacht', t: 'סערה! היאכטה צריכה תיקון. 🌊 (-15,000 ₪)', do: (s) => { s.cash -= 15000; } },
  { w: 3, when: (s) => s.housing.key === 'parents', t: 'אמא נכנסה לחדר בלי לדפוק. שוב. 🚪', do: (s) => { s.happy -= 3; } },
  { w: 2, when: (s) => s.housing.key === 'kibbutz', t: 'ניצחתם בטורניר הפינג־פונג של הקיבוץ! 🏓', do: (s) => { s.happy += 4; } },
  { w: 1, when: (s) => s.car >= 2000, t: 'מישהו שרט לכם את הרכב החדש בחניון. 😤', do: (s) => { s.happy -= 3; } },
];
function randomEvent(s) {
  if (Math.random() > 0.65) return null;
  const pool = EVENTS.filter((e) => e.when(s));
  const total = pool.reduce((a, e) => a + e.w, 0);
  let r = Math.random() * total;
  for (const e of pool) { r -= e.w; if (r <= 0) { e.do(s); s.happy = clamp(s.happy); return e.t; } }
  return null;
}
function pickCard(s) {
  return CARDS.find((c) => {
    if (s.used[c.id] && !c.repeat) return false;
    if (c.repeat && c.cool && s.last[c.id] != null && s.age - s.last[c.id] < c.cool) return false;
    return c.when(s);
  });
}
const val = (x, s) => (typeof x === 'function' ? x(s) : x);

/* ===== תצוגה ===== */
(function game() {
  const root = document.getElementById('game');
  if (!root) return;
  let s;

  const signed = (n) => `<span class="${n >= 0 ? 'pos' : 'neg'}">${n >= 0 ? '+' : '−'}${ils(Math.abs(n))}</span>`;
  function stats() {
    const m = monthly(s);
    return `<div class="g-stats">
      <div class="g-stat"><small>🎂 גיל</small><b>${s.age}</b></div>
      <div class="g-stat"><small>💰 שווי נקי</small><b class="${netWorth(s) < 0 ? 'neg' : ''}">${ils(netWorth(s))}</b></div>
      <div class="g-stat"><small>💵 נשאר בחודש</small><b>${signed(m)}</b></div>
      <div class="g-stat"><small>🏠 גרים</small><b>${s.housing.label}</b></div>
      <div class="g-stat"><small>😊 אושר</small><b>${Math.round(s.happy)}</b><div class="meter"><i style="width:${s.happy}%"></i></div></div>
      <div class="g-stat"><small>🕊️ חופש</small><b>${Math.round(s.free)}</b><div class="meter"><i style="width:${s.free}%;background:var(--sky)"></i></div></div>
    </div>`;
  }

  function intro() {
    root.innerHTML = `<div class="g-card">
      <span class="g-age">🎮 משחק החיים</span>
      <h2 class="g-title">אתם בני 23. יש לכם משכורת ראשונה, פיקדון מהצבא ואפס ניסיון.</h2>
      <p>12 שנים, החלטה אחת בכל שנה, ואירועים אקראיים שאף אחד לא ביקש. בגיל 35 נראה כמה הגעתם רחוק: בכסף, באושר ובחופש.</p>
      <p class="muted small">המספרים במשחק פשוטים בכוונה. המטרה היא להרגיש איך החלטות קטנות מצטברות, לא לחזות את העתיד.</p>
      <div class="g-choices"><button type="button" class="btn" data-act="start">יאללה מתחילים 🎮</button></div>
    </div>`;
    root.querySelector('[data-act="start"]').addEventListener('click', start);
  }

  function start() {
    s = newState();
    XP.award('game_start');
    turn();
  }

  function turn() {
    const c = pickCard(s);
    const yearNo = s.age - 22;
    const choices = c.choices.map((ch, i) => {
      const ok = ch.can ? ch.can(s) : true;
      const reason = ok === true ? val(ch.hint, s) || '' : `🔒 ${ok}`;
      return `<button type="button" class="g-choice" data-i="${i}" ${ok === true ? '' : 'disabled'}>${ch.label}${reason ? `<small>${reason}</small>` : ''}</button>`;
    }).join('');
    root.innerHTML = `${stats()}<div class="g-card">
      <span class="g-age">גיל ${s.age} · שנה ${yearNo} מתוך ${END_AGE - 23}</span>
      <h2 class="g-title">${val(c.title, s)}</h2>
      <p>${val(c.text, s) || ''}</p>
      <div class="g-choices">${choices}</div>
    </div>`;
    root.querySelectorAll('.g-choice').forEach((b) => b.addEventListener('click', () => choose(c, c.choices[Number(b.dataset.i)])));
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function choose(card, ch) {
    s.used[card.id] = true;
    s.last[card.id] = s.age;
    const res = ch.do(s);
    s.happy = clamp(s.happy); s.free = clamp(s.free);
    s.log.push(`גיל ${s.age}: ${ch.label}`);
    const tick = yearTick(s);
    const ev = randomEvent(s);
    const done = s.age >= END_AGE;
    root.innerHTML = `${stats()}<div class="g-card g-out">
      <span class="g-age">${ch.label}</span>
      <p class="g-res">${res}</p>
      ${ev ? `<p class="g-event">🎲 ${ev}</p>` : ''}
      <div class="g-year"><span>תזרים השנה: <b>${signed(tick.flow)}</b></span><span>שינוי בשווי: <b>${signed(tick.delta)}</b></span></div>
      <div class="g-choices"><button type="button" class="btn" data-act="next">${done ? 'לתוצאות 🏁' : `לגיל ${s.age} ←`}</button></div>
    </div>`;
    root.querySelector('.g-stats').querySelectorAll('.g-stat').forEach((el) => el.classList.add('bump'));
    root.querySelector('[data-act="next"]').addEventListener('click', done ? finish : turn);
  }

  function archetype() {
    const nw = netWorth(s);
    if (s.flags.yacht && s.housing.key === 'yacht') return ['זאבי הים 🛥️', 'גרים על המים, אוכלים דגים, ויש לכם סיפורים שלאף אחד אחר אין.'];
    if (s.housing.key === 'kibbutz') return ['הקיבוצניקים המאושרים 🌾', 'קהילה, דשא, ושכירות שלא אוכלת לכם את המשכורת.'];
    if (s.flags.owner && s.happy >= 60) return ['בעלי הבית המרוצים 🔑', 'דירה, משכנתא, ושפיות. הסבתא גאה.'];
    if (s.flags.rentvest) return ['השוכרים־משקיעים הממולחים 🧠', 'בעלי דירה וגם שוכרים. גמישים וחכמים.'];
    if (nw > 1500000 && s.happy < 45) return ['עשירים ועייפים 💰😩', 'יש כסף. אין כוח. אולי תאילנד?'];
    if (nw < 100000 && s.happy >= 65) return ['שבורים ומאושרים 🎉', 'החשבון בוכה, אבל אתם צוחקים.'];
    if (s.flags.fire) return ['מתאמני FIRE 🔥', 'עוד כמה שנים של אורז ושעועית, ואתם חופשיים.'];
    if (s.flags.owner) return ['בעלי בית לחוצים 🔑😬', 'יש דירה. יש גם משכנתא שמזכירה את עצמה כל חודש.'];
    return ['השורדים 🙂', 'לא רע בכלל! עכשיו נסו מסלול אחר ותראו מה משתנה.'];
  }

  function finish() {
    const [title, desc] = archetype();
    const nw = netWorth(s);
    const plays = store.get('game-plays', 0) + 1;
    store.set('game-plays', plays);
    XP.award('game_finish');
    if (nw >= 1000000) XP.award('game_rich');
    if (plays >= 3) XP.award('game_veteran');
    confetti(140);
    root.innerHTML = `<div class="g-card g-final">
      <span class="g-age">🏁 גיל ${END_AGE}. התוצאה:</span>
      <div class="arche">${title}</div>
      <p>${desc}</p>
      ${stats()}
      <div class="g-choices">
        <button type="button" class="btn" data-act="again">לשחק שוב 🔁</button>
        <button type="button" class="btn alt" data-act="share">שתפו את התוצאה 📤</button>
      </div>
      <ul class="g-log">${s.log.map((l) => `<li>${l}</li>`).join('')}</ul>
      <p class="muted small" style="margin-top:14px">רוצים לעשות את זה בחיים האמיתיים? <a href="index.html">בנו מפה אישית</a>.</p>
    </div>`;
    root.querySelector('[data-act="again"]').addEventListener('click', start);
    root.querySelector('[data-act="share"]').addEventListener('click', async () => {
      const text = `סיימתי את משחק החיים בתור "${title}" עם שווי נקי של ${ils(nw)} 🎮 נסו לנצח אותי:`;
      try {
        if (navigator.share) await navigator.share({ text, url: location.href });
        else { await navigator.clipboard.writeText(`${text} ${location.href}`); toast('הועתק! עכשיו תאתגרו חבר 📋'); }
        XP.award('share');
      } catch (e) { /* בוטל */ }
    });
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  intro();
})();
