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
    const FLOATERS = [
        // [ایموجی، x%، y%، اندازه، شفافیت، مدت، تأخیر]
        ['🎬', 6, 14, 46, .5, 9, 0], ['🌍', 82, 10, 52, .5, 11, 1.2],
        ['🍿', 88, 38, 40, .42, 8, .6], ['🎭', 3, 42, 44, .45, 10, 2],
        ['💡', 78, 62, 42, .45, 9.5, 1.8], ['🧩', 10, 68, 48, .45, 12, .3],
        ['🚀', 86, 84, 46, .5, 10, 2.4], ['🎯', 40, 90, 38, .38, 8.5, 1],
        ['✨', 52, 6, 30, .55, 7, .4], ['🪐', 22, 90, 44, .4, 13, 1.5]
    ];
    function buildFloaters() {
        const wrap = $('rz-floaters');
        if (!wrap || wrap.childElementCount) return;
        FLOATERS.forEach(([emoji, x, y, size, o, d, delay], i) => {
            const el = document.createElement('div');
            el.className = 'rz-floater';
            el.style.cssText = `--x:${x}%;--y:${y}%;--s:${size}px;--o:${o};--d:${d}s;--delay:${delay}s;` +
                `--dx:${i % 2 ? -14 : 14}px;--r0:${i % 2 ? 8 : -8}deg;--r1:${i % 2 ? -10 : 10}deg`;
            try { el.appendChild(buildEmojiImg(emoji)); } catch (e) { el.textContent = emoji; }
            wrap.appendChild(el);
        });
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
            for (let i = 0; i < 26; i++) {
                const p = document.createElement('span');
                p.className = 'rz-confetti';
                p.textContent = set[i % set.length];
                const ang = (Math.PI * 2 * i) / 26 + Math.random() * 0.4;
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
    buildFloaters();
    paintEmojis();
    wire();
})();
