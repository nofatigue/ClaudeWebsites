/* ===== טריקים במשפט — להוסיף טריק = להוסיף שורה ===== */
const TRICKS = [
  // חיסכון
  { c: 'חיסכון', t: 'הוראת קבע לחיסכון ביום שהמשכורת נכנסת. מה שלא רואים בעו״ש, לא מבזבזים.' },
  { c: 'חיסכון', t: 'קרן השתלמות אחרי 6 שנים פטורה ממס על הרווחים. לפעמים זה המקור הכי זול להון עצמי.' },
  { c: 'חיסכון', t: 'הפיקדון מהצבא לא חייב ללכת לטיול בדרום אמריקה. אפשר למשוך אותו גם לרכישת דירה.' },
  { c: 'חיסכון', t: 'נולדתם אחרי 1999? בדקו ב״חיסכון לכל ילד״. יש מצב שמחכה לכם שם כסף.' },
  { c: 'חיסכון', t: 'כסף בעו״ש מפסיד לאינפלציה כל חודש. קרן כספית היא המינימום לכסף של ״עוד שנה קונים״.' },
  { c: 'חיסכון', t: 'חצי מכל העלאה בשכר לחיסכון. את רמת החיים אתם לא תרגישו, את ההון העצמי כן.' },
  { c: 'חיסכון', t: 'מתנה מההורים? תתעדו אותה בכתב. הבנק ישאל מאיפה הגיע הכסף, ו״מסבתא״ זו לא אסמכתא.' },
  { c: 'חיסכון', t: 'שנתיים אצל ההורים יכולות לחסוך יותר מחמש שנים של קיצוצים בקפה.' },

  // משכנתא
  { c: 'משכנתא', t: 'כל אחוז ריבית על משכנתא של מיליון ₪ ל־25 שנה שווה בערך 170 אלף ₪.' },
  { c: 'משכנתא', t: 'אישור עקרוני מהבנק הוא לא רק בשבילכם. הוא קלף חזק במשא ומתן מול המוכר.' },
  { c: 'משכנתא', t: 'תביאו הצעות מלפחות שלושה בנקים. הבנקים יודעים שאתם משווים, וזה עובד.' },
  { c: 'משכנתא', t: 'מסלול צמוד מדד נראה זול, אבל החוב עצמו גדל עם האינפלציה.' },
  { c: 'משכנתא', t: 'פריים זז עם הריבית של בנק ישראל. כשהיא עולה, גם ההחזר החודשי שלכם עולה.' },
  { c: 'משכנתא', t: 'את ביטוח החיים למשכנתא אפשר לעשות בחברת ביטוח ולא דרך הבנק. לרוב זה יוצא זול יותר.' },
  { c: 'משכנתא', t: 'מחזור משכנתא אחרי כמה שנים יכול לחסוך עשרות אלפים. רק קודם בודקים את עמלת הפירעון המוקדם.' },
  { c: 'משכנתא', t: '30 שנה במקום 20 מורידות את ההחזר החודשי, ומעלות מאוד את סך הריבית. תעשו את החשבון.' },
  { c: 'משכנתא', t: 'הבנק לא יאשר החזר מעל 50% מההכנסה. אתם לא רוצים להתקרב אפילו ל־40%.' },

  // בדיקות
  { c: 'בדיקות', t: 'נסח טאבו עולה כמה שקלים, ויכול לחסוך לכם מאות אלפים.' },
  { c: 'בדיקות', t: 'השכנים יספרו לכם על הרטיבות לפני שהמתווך יספר.' },
  { c: 'בדיקות', t: 'תבקרו בדירה אחרי גשם. רטיבות לא מתחבאת טוב בדצמבר.' },
  { c: 'בדיקות', t: 'רחוב שקט בעשר בבוקר יכול להיות מוקד בילויים בשתיים בלילה. בקרו בשעות שונות.' },
  { c: 'בדיקות', t: 'המרפסת הסגורה חוקית? תיק הבניין בעירייה יודע. אחרי הקנייה זו כבר הבעיה שלכם.' },
  { c: 'בדיקות', t: 'הנוף לים יכול להפוך לנוף למגדל. בדקו מה מתוכנן לבנות לידכם.' },
  { c: 'בדיקות', t: 'בדק בית עולה כמה אלפים, וממצא אחד בו יכול להוריד מהמחיר עשרות אלפים.' },
  { c: 'בדיקות', t: '״מטר מרובע״ זה לא תמיד אותו מטר. יש נטו, יש ברוטו, ויש ״לפי תקנות המכר״. שאלו איזה.' },
  { c: 'בדיקות', t: 'דירה זולה בעיר רחוקה עלולה לעלות יותר אחרי שמוסיפים רכב שני ושעתיים בפקקים.' },

  // חוזה ומסים
  { c: 'חוזה ומסים', t: 'מקבלן, אל תעבירו אף שקל בלי ערבות חוק מכר על אותו תשלום.' },
  { c: 'חוזה ומסים', t: 'הצמדה למדד תשומות הבנייה יכולה להוסיף עשרות אלפים עד המפתח. נסו לסגור חלק מהמחיר בלי הצמדה.' },
  { c: 'חוזה ומסים', t: 'את מס הרכישה על דירה יחידה משלמים רק על החלק של המחיר שמעל סף של כ־2 מיליון ₪.' },
  { c: 'חוזה ומסים', t: 'רישום הורה שיש לו דירה כשותף בטאבו עלול להפוך את החלק שלו ל״דירה נוספת״ במס רכישה.' },
  { c: 'חוזה ומסים', t: 'הערת אזהרה נרשמת מיד אחרי החתימה. היא מה שמונע מהמוכר למכור את הדירה פעמיים.' },
  { c: 'חוזה ומסים', t: 'עורך הדין של הקבלן עובד בשביל הקבלן, גם כשאתם משלמים לו את שכר הטרחה.' },
  { c: 'חוזה ומסים', t: 'מתווך יכול לדרוש דמי תיווך רק אם חתמתם לו על הזמנת שירותי תיווך.' },
  { c: 'חוזה ומסים', t: 'איחור של יותר מחודשיים במסירה מקבלן מזכה אתכם בפיצוי לפי חוק המכר.' },
  { c: 'חוזה ומסים', t: 'עלויות נלוות יכולות להגיע לכמה אחוזים מהמחיר. מכניסים אותן לתקציב לפני, לא אחרי.' },
  { c: 'חוזה ומסים', t: 'קונים בבניין ישן לפני תמ״א 38 או פינוי־בינוי? אולי תקבלו דירה חדשה בעתיד. ואולי זה ייקח עשור.' },

  // שכירות
  { c: 'שכירות', t: 'שכירות היא לא ״כסף לפח״. גם ריבית על משכנתא זה כסף שלא חוזר.' },
  { c: 'שכירות', t: 'חוק שכירות הוגנת מגביל את הביטחונות שמשכיר יכול לדרוש מכם. תכירו אותו לפני שחותמים.' },
  { c: 'שכירות', t: 'חוזה לשנתיים עם אופציה להארכה שומר לכם על המחיר.' },
  { c: 'שכירות', t: 'שכירות + השקעה של ההפרש עובדת רק אם באמת משקיעים, ולא קונים בהפרש נעליים.' },
];

(function tricksApp() {
  const root = document.getElementById('tricks-app');
  if (!root) return;
  const KEY = 'tricks-seen-v1';
  let seen = new Set();
  try { seen = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) { /* בלי זיכרון, גם בסדר */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...seen])); } catch (e) {} };

  const cats = ['הכל', ...new Set(TRICKS.map((t) => t.c))];
  let filter = 'הכל';
  let current = -1;

  const chips = root.querySelector('.chips');
  const card = root.querySelector('.trick-card');
  const catEl = card.querySelector('.cat');
  const textEl = card.querySelector('.text');
  const metaEl = card.querySelector('.meta');
  const list = root.querySelector('.trick-list');
  const toast = document.querySelector('.toast');

  chips.innerHTML = cats.map((c) =>
    `<button type="button" class="chip" aria-pressed="${c === filter}">${c}</button>`).join('');
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    filter = b.textContent;
    chips.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    next();
    if (!list.hidden) renderList();
  });

  const pool = () => TRICKS.map((t, i) => i).filter((i) => filter === 'הכל' || TRICKS[i].c === filter);

  function show(i) {
    current = i;
    seen.add(i); save();
    const t = TRICKS[i];
    catEl.textContent = t.c;
    textEl.textContent = t.t;
    const p = pool();
    const seenHere = p.filter((x) => seen.has(x)).length;
    metaEl.textContent = seenHere >= p.length
      ? `ראיתם את כל ${p.length} הטריקים כאן 🎉 אתם מסוכנים עכשיו.`
      : `גיליתם ${seenHere} מתוך ${p.length}`;
    card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
  }

  function next() {
    const p = pool();
    let fresh = p.filter((i) => !seen.has(i) && i !== current);
    if (!fresh.length) fresh = p.filter((i) => i !== current);
    if (!fresh.length) fresh = p;
    show(fresh[Math.floor(Math.random() * fresh.length)]);
  }

  function flash(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1600);
  }

  root.querySelector('[data-act="next"]').addEventListener('click', next);
  root.querySelector('[data-act="share"]').addEventListener('click', async () => {
    const text = `${TRICKS[current].t} ⚡`;
    try {
      if (navigator.share) { await navigator.share({ text, url: location.href }); return; }
      await navigator.clipboard.writeText(`${text}\n${location.href}`);
      flash('הועתק! עכשיו תשלחו לחבר שצריך את זה 📋');
    } catch (e) { /* המשתמש ביטל */ }
  });

  function renderList() {
    list.innerHTML = pool().map((i) => `<li><small>${TRICKS[i].c}</small>${TRICKS[i].t}</li>`).join('');
  }
  const toggle = root.querySelector('[data-act="all"]');
  toggle.addEventListener('click', () => {
    list.hidden = !list.hidden;
    toggle.textContent = list.hidden ? 'הציגו את כולם 📜' : 'הסתירו את הרשימה';
    if (!list.hidden) renderList();
  });

  next();
})();
