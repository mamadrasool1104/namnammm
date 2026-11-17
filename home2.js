// =====================================================
// RAZAK 2.0 — چسب صفحه‌ی اصلی جدید (بعد از app.js لود می‌شود)
// =====================================================
// منطق بازی را دست نمی‌زند: فقط (۱) renderHome را می‌پیچد تا ستاره‌ها و دکمه‌ی
// «شروع بازی» هم به‌روز شوند، (۲) دکمه‌های جدید را به توابع موجود app.js وصل
// می‌کند، (۳) ایموجی‌های شناور پس‌زمینه را می‌سازد.
(function () {
    'use strict';

    const $ = id => document.getElementById(id);
    const toFa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
    const tap = () => { try { AudioEngine.tap(); } catch (e) {} };
    const soon = (icon, text) => { try { showToast(icon, text); } catch (e) {} };

    /* ---------- ۱) ایموجی‌های شناور (از همان موتور ایموجی اپل بازی) ---------- */
    const FLOATERS = [
        // [ایموجی، x%، y%، اندازه، شفافیت، مدت، تأخیر]
        ['🎬', 6, 14, 46, .55, 9, 0], ['🌍', 82, 10, 52, .55, 11, 1.2],
        ['🍿', 88, 38, 40, .45, 8, .6], ['🎭', 3, 42, 44, .5, 10, 2],
        ['💡', 78, 62, 42, .5, 9.5, 1.8], ['🧩', 10, 68, 48, .5, 12, .3],
        ['🚀', 86, 84, 46, .55, 10, 2.4], ['🎯', 40, 90, 38, .4, 8.5, 1],
        ['✨', 52, 6, 30, .6, 7, .4], ['🪐', 22, 90, 44, .45, 13, 1.5]
    ];
    function buildFloaters() {
        const wrap = $('rz-floaters');
        if (!wrap || wrap.childElementCount) return;
        FLOATERS.forEach(([emoji, x, y, size, o, d, delay], i) => {
            const el = document.createElement('div');
            el.className = 'rz-floater';
            el.style.cssText = `--x:${x}%;--y:${y}%;--s:${size}px;--o:${o};--d:${d}s;--delay:${delay}s;` +
                `--dx:${i % 2 ? -14 : 14}px;--r0:${i % 2 ? 8 : -8}deg;--r1:${i % 2 ? -10 : 10}deg`;
            try { el.appendChild(buildEmojiImg(emoji)); }
            catch (e) { el.textContent = emoji; }
            wrap.appendChild(el);
        });
    }
    function buildLogoEmoji() {
        const el = $('rz-logo-emoji');
        if (!el) return;
        try { renderAppleEmojis(el, '🤔'); } catch (e) { /* همان متن 🤔 می‌ماند */ }
    }

    /* ---------- ۲) آمار: ستاره‌های کل + وضعیت دکمه‌ی شروع ---------- */
    function totalStars() {
        let sum = 0;
        try {
            DB.categories.forEach(cat => {
                for (let i = 0; i < cat.levels.length; i++) sum += getLevelStars(cat.id, i);
            });
        } catch (e) {}
        return sum;
    }

    // اولین دسته‌ی ناتمام (همان منطق renderHeroBanner قدیمی)
    function findNextCategory() {
        let done = 0, total = 0, next = null;
        try {
            DB.categories.forEach(cat => {
                const t = cat.levels.length;
                const d = Math.min(GameState.progress[cat.id]?.length || 0, t);
                total += t; done += d;
                if (!next && t > 0 && d < t) next = cat;
            });
        } catch (e) {}
        return { next, done, total };
    }

    function updateHomeExtras() {
        const starsEl = $('home-total-stars');
        if (starsEl) starsEl.textContent = totalStars();

        const { next, done, total } = findNextCategory();
        const label = $('rz-start-label'), sub = $('rz-start-sub');
        if (!label || !sub) return;
        if (!total) { label.textContent = 'شروع بازی'; sub.textContent = ''; }
        else if (next) {
            label.textContent = done > 0 ? 'ادامه بازی' : 'شروع بازی';
            sub.textContent = `«${next.name}» · ${toFa(done)} از ${toFa(total)} مرحله`;
        } else {
            label.textContent = 'مرحله‌ها';
            sub.textContent = 'همه‌ی مرحله‌ها رو حل کردی 🎉';
        }
    }

    // renderHome را می‌پیچیم؛ رفتار قبلی عیناً اجرا می‌شود و بعدش آمار جدید.
    const origRenderHome = window.renderHome;
    if (typeof origRenderHome === 'function') {
        window.renderHome = function () {
            const r = origRenderHome.apply(this, arguments);
            try { updateHomeExtras(); } catch (e) {}
            return r;
        };
    }
    // امتیاز/ستاره بعد از هر برد هم تازه می‌شود (برگشت به خانه renderHome را صدا می‌زند)

    /* ---------- ۳) اتصال دکمه‌ها ---------- */
    function wire() {
        // شروع بازی = ادامه از اولین دسته‌ی ناتمام (با همان گیت عضویت اجباری)
        const startBtn = $('btn-start-game');
        if (startBtn) startBtn.addEventListener('click', () => {
            tap();
            const { next } = findNextCategory();
            const target = next || (DB.categories.find(c => c.levels.length > 0));
            if (!target) { soon('⏳', 'به‌زودی مرحله‌های جدید میاد'); return; }
            requireChannelJoin(() => next ? startCategory(next) : openLevelSelect(target));
        });

        // چالش ایموجی = لیست دسته‌بندی‌ها
        const goCats = () => { tap(); const el = $('rz-categories'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        const emojiBtn = $('btn-mode-emoji'); if (emojiBtn) emojiBtn.addEventListener('click', goCats);
        const hint = $('rz-scroll-hint'); if (hint) hint.addEventListener('click', goCats);

        // این دو قابلیت هنوز در بازی وجود ندارند → پیام «به‌زودی» (بدون ساختن عملکرد جعلی)
        const board = $('btn-mode-leaderboard');
        if (board) board.addEventListener('click', () => { tap(); soon('🏆', 'جدول برترین‌ها به‌زودی میاد'); });
        const shop = $('btn-shop');
        if (shop) shop.addEventListener('click', () => { tap(); soon('🛍️', 'فروشگاه به‌زودی باز می‌شه'); });

        // سکه رایگان = همان پنجره‌ی «جایزه»
        const free = $('btn-free-coins');
        if (free) free.addEventListener('click', () => {
            const opener = $('btn-open-rewards');
            if (opener) opener.click();
        });

        // نقطه‌ی قرمز «جایزه‌ی روزانه آماده است» روی دکمه‌ی سکه رایگان هم بیاید
        const gear = $('btn-open-settings');
        if (gear && free && window.MutationObserver) {
            const sync = () => free.classList.toggle('has-reminder', gear.classList.contains('has-reminder'));
            new MutationObserver(sync).observe(gear, { attributes: true, attributeFilter: ['class'] });
            sync();
        }
    }

    buildFloaters();
    buildLogoEmoji();
    wire();
    // اگر renderHome قبل از لود این فایل اجرا شده بود، یک‌بار هم اینجا آمار را پر کن
    window.addEventListener('DOMContentLoaded', () => setTimeout(() => { try { updateHomeExtras(); } catch (e) {} }, 0));
})();
