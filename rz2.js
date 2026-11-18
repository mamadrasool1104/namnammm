// =====================================================
// رازک ۲.۰ — چسب رابط کاربری (بعد از app.js لود می‌شود)
// =====================================================
// منطق بازی، ذخیره‌سازی و دیتابیس اینجا دست نمی‌خورد. این فایل فقط:
//   ۱) پس‌زمینه‌ی ایموجی‌های شناور و ایموجی لوگو را می‌سازد،
//   ۲) نوار پایین (خانه / مرحله‌ها / جایزه‌ها / پروفایل) را به توابع app.js وصل می‌کند،
//   ۳) افکت برد (کانفتی) و باخت (چشمک قرمز) را فراهم می‌کند.
(function () {
    'use strict';

    const $ = id => document.getElementById(id);
    const tap = () => { try { AudioEngine.tap(); } catch (e) {} };
    const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- ۱) ایموجی‌های شناور (با همان موتور ایموجی اپل بازی) ---------- */
    // فقط ۵ ایموجی ثابت (بدون انیمیشن، بدون دانلود تصویر): متن ایموجی خود سیستم است
    const FLOATERS = [
        // [ایموجی، x%، y%، اندازه، شفافیت]
        ['🎬', 6, 14, 40, .42], ['🌍', 82, 10, 44, .42], ['🎭', 3, 46, 38, .36],
        ['🚀', 86, 80, 40, .42], ['🧩', 10, 82, 40, .38]
    ];
    function buildFloaters() {
        const wrap = $('rz-floaters');
        if (!wrap || wrap.childElementCount) return;
        const frag = document.createDocumentFragment();
        FLOATERS.forEach(([emoji, x, y, size, o]) => {
            const el = document.createElement('div');
            el.className = 'rz-floater';
            el.style.cssText = `--x:${x}%;--y:${y}%;--s:${size}px;--o:${o}`;
            el.textContent = emoji;
            frag.appendChild(el);
        });
        wrap.appendChild(frag);
    }
    function paintEmojis() {
        const logo = $('rz-logo-emoji');
        if (logo) { try { renderAppleEmojis(logo, '🤔'); } catch (e) {} }
        document.querySelectorAll('.rz-tab-ico[data-emoji]').forEach(el => {
            try { renderAppleEmojis(el, el.dataset.emoji); } catch (e) {}
        });
    }

    /* ---------- ۲) نوار پایین ---------- */
    const TAB_OF_SCREEN = {
        'screen-home': 'home', 'screen-categories': 'levels', 'screen-levels': 'levels',
        'screen-rewards': 'rewards', 'screen-profile': 'profile'
    };
    function markTab(screenId) {
        const tab = TAB_OF_SCREEN[screenId];
        document.querySelectorAll('.rz-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    }
    function openTab(tab) {
        const active = document.querySelector('.rz-tab.active');
        if (active && active.dataset.tab === tab) {            // لمس دوباره‌ی همان تب → برگشت به بالای صفحه
            const scr = document.querySelector('.screen.active');
            if (scr) scr.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (tab === 'home') { goBackToHome(); }
        else if (tab === 'levels') { openCategories(); }
        else if (tab === 'rewards') { openRewardsScreen(); }
        else if (tab === 'profile') { openProfile(); }
    }

    window.RZ = {
        onScreen: markTab,

        // جشن برد: چند ایموجی که از وسط صفحه پخش می‌شوند (سبک و کوتاه‌مدت)
        celebrate() {
            if (reduceMotion()) return;
            const fx = document.createElement('div');
            fx.className = 'rz-fx';
            const set = ['🎉', '⭐', '✨', '🪙', '🎊', '💫'];
            for (let i = 0; i < 12; i++) {
                const p = document.createElement('span');
                p.className = 'rz-confetti';
                p.textContent = set[i % set.length];
                const ang = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
                const dist = 120 + Math.random() * 150;
                p.style.cssText = `--tx:${Math.cos(ang) * dist}px;--ty:${Math.sin(ang) * dist + 60}px;--rot:${(Math.random() - .5) * 540}deg;` +
                    `font-size:${18 + Math.random() * 16}px;animation-delay:${Math.random() * 0.12}s`;
                fx.appendChild(p);
            }
            document.body.appendChild(fx);
            setTimeout(() => fx.remove(), 1700);
        },

        // خطا: حاشیه‌ی قرمز کوتاه دور صفحه
        wrong() {
            if (reduceMotion()) return;
            const fx = document.createElement('div');
            fx.className = 'rz-fx';
            fx.innerHTML = '<div class="rz-wrong-flash"></div>';
            document.body.appendChild(fx);
            setTimeout(() => fx.remove(), 700);
        }
    };

    function wire() {
        document.querySelectorAll('.rz-tab').forEach(b => b.addEventListener('click', () => { tap(); openTab(b.dataset.tab); }));

        const levels = $('btn-mode-levels');
        if (levels) levels.addEventListener('click', () => openCategories());

        // «برترین‌ها» هنوز در بازی وجود ندارد → پیام «به‌زودی» (عملکرد جعلی نمی‌سازیم)
        const board = $('btn-mode-leaderboard');
        if (board) board.addEventListener('click', () => { tap(); try { showToast('🏆', 'جدول برترین‌ها به‌زودی میاد'); } catch (e) {} });

        // سکه رایگان = همان پنجره‌ی «جایزه» (جایزه‌ی روزانه + کانال‌ها)
        const free = $('btn-free-coins');
        if (free) free.addEventListener('click', () => { const o = $('btn-open-rewards'); if (o) o.click(); });

        // نقطه‌ی قرمز «جایزه‌ی روزانه آماده است» روی تب جایزه‌ها و دکمه‌ی سکه رایگان
        const gear = $('btn-open-settings');
        if (gear && window.MutationObserver) {
            const rewardsTab = document.querySelector('.rz-tab[data-tab="rewards"]');
            const sync = () => {
                const on = gear.classList.contains('has-reminder');
                if (free) free.classList.toggle('has-reminder', on);
                if (rewardsTab) rewardsTab.classList.toggle('has-reminder', on);
            };
            new MutationObserver(sync).observe(gear, { attributes: true, attributeFilter: ['class'] });
            sync();
        }
    }

    document.body.dataset.screen = 'screen-home';
    paintEmojis();
    wire();
    // پس‌زمینه‌ی تزئینی بعد از اولین نمایش صفحه (وقتی مرورگر بیکار شد) ساخته می‌شود
    (window.requestIdleCallback ? window.requestIdleCallback(buildFloaters, { timeout: 1500 }) : setTimeout(buildFloaters, 600));
})();
