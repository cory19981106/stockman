'use strict';

(() => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.main-nav');
  const shade = document.querySelector('.menu-shade');
  const mobile = window.matchMedia('(max-width: 960px)');
  function setMenu(open, restore = false) {
    if (!toggle || !menu) return;
    open = open && mobile.matches;
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    shade.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    menu.inert = mobile.matches && !open;
    if (open) menu.querySelector('a')?.focus();
    else if (restore) toggle.focus();
  }
  if (toggle && menu && shade) {
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    shade.addEventListener('click', () => setMenu(false, true));
    menu.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
    mobile.addEventListener('change', () => setMenu(false));
    document.addEventListener('keydown', (event) => {
      if (!menu.classList.contains('open')) return;
      if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
      if (event.key === 'Tab') {
        const links = [...menu.querySelectorAll('a[href]')];
        const first = toggle, last = links.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    setMenu(false);
  }

  document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
    const controls = [...scope.querySelectorAll('[data-filter]')];
    const items = [...scope.querySelectorAll('[data-category]')];
    const count = scope.querySelector('[data-filter-count]');
    controls.forEach((control) => control.addEventListener('click', () => {
      const value = control.dataset.filter;
      controls.forEach((button) => button.setAttribute('aria-pressed', String(button === control)));
      let shown = 0;
      items.forEach((item) => {
        item.hidden = value !== 'all' && item.dataset.category !== value;
        if (!item.hidden) shown += Number(item.dataset.count || 1);
      });
      if (count) count.textContent = `${String(shown).padStart(2, '0')} ${count.dataset.unit}`;
    }));
  });

  document.querySelectorAll('.video-play').forEach((button) => {
    button.querySelector('img')?.addEventListener('error', (event) => event.target.remove());
    button.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      const url = new URL(button.dataset.embed);
      if (url.hostname === 'www.youtube-nocookie.com') url.searchParams.set('autoplay', '1');
      iframe.src = url.href;
      iframe.title = button.dataset.title;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      button.replaceWith(iframe);
      iframe.focus();
    });
  });

  const form = document.querySelector('.contact-form');
  if (form) {
    const date = form.querySelector('[name="shoot_date"]');
    const month = form.querySelector('[name="shoot_month"]');
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    date.min = localDate;
    month.min = localDate.slice(0, 7);
    function dateMode() {
      const value = form.querySelector('[name="booking_option"]:checked')?.value;
      [[date, '確定日期'], [month, '預計月份']].forEach(([input, mode]) => {
        const active = value === mode;
        input.closest('.form-group').hidden = !active;
        input.disabled = !active;
        input.required = active;
      });
    }
    form.querySelectorAll('[name="booking_option"]').forEach((radio) => radio.addEventListener('change', dateMode));
    dateMode();
    form.addEventListener('submit', () => {
      // The original endpoint owns delivery and confirmation; no simulated success.
      const status = form.querySelector('.form-status');
      status.textContent = '預約服務將在新分頁開啟，請查看該頁的送出結果。';
    });
  }
})();
