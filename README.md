# בית בלי חפירות (שם זמני)

אתר בעברית לצעירים שרוצים לחסוך, לתכנן ולקנות דירה בישראל, או לחיות אחרת.
אתר סטטי (HTML/CSS/JS), בלי שלב build, מוכן ל־GitHub Pages.

## מבנה
- `index.html`: עמוד הבית + מחשבון "כמה זמן ייקח לחסוך"
- ציר 1, עקרונות יסוד: `basics.html` → `save.html`, `finance.html`, `buy.html`
- ציר 2, דרכים אחרות: `alt.html` → `alt-live.html`, `alt-rent.html`, `alt-grants.html`
- ציר 3, טריקים במשפט: `tricks.html` (הטריקים עצמם ב־`assets/tricks.js`)
- `assets/app.js`: כותרת, תחתית וכל המחשבונים. **שם האתר נקבע כאן (`SITE_NAME`)**
- `assets/style.css`: עיצוב (כולל מצב כהה)

## עקרון מנחה
פשטות: עד 3 נקודות ראשיות בכל עמוד, וקישורים לעמודים אחרים.

## הרצה מקומית
```
python3 -m http.server 8080
```

## פרסום
Settings → Pages → Deploy from a branch → בחרו את הענף ואת התיקייה `/ (root)`.
