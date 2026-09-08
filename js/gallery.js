'use strict';

(() => {
  const dialog = document.querySelector('#photo-lightbox');
  const data = document.querySelector('#gallery-data');
  if (!dialog || !data || typeof dialog.showModal !== 'function') return;
  const photos = JSON.parse(data.textContent);
  if (!photos.length) return;
  const img = dialog.querySelector('#lightbox-image');
  const count = dialog.querySelector('.lightbox-counter');
  const caption = dialog.querySelector('.lightbox-caption');
  const error = dialog.querySelector('.lightbox-error');
  const thumbs = [...dialog.querySelectorAll('.thumb')];
  let index = 0;
  let opener = null;
  let touch = null;
  let openedWithHistory = false;

  function render(next, updateHash = true) {
    index = ((next % photos.length) + photos.length) % photos.length;
    const photo = photos[index];
    error.hidden = true;
    img.hidden = false;
    img.alt = photo.alt;
    img.src = photo.full;
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
    caption.textContent = photo.alt;
    thumbs.forEach((thumb, position) => thumb.setAttribute('aria-current', String(position === index)));
    thumbs[index]?.scrollIntoView({block:'nearest', inline:'nearest', behavior:'instant'});
    if (updateHash) history.replaceState(history.state, '', `#photo-${index + 1}`);
    if (photos.length > 1) {
      const ahead = new Image();
      ahead.src = photos[(index + 1) % photos.length].full;
    }
  }

  function open(position, origin, push = true) {
    if (!dialog.open) {
      opener = origin || document.activeElement;
      dialog.showModal();
      document.body.classList.add('modal-open');
      if (push) {
        history.pushState({zjGallery:true}, '', `#photo-${position + 1}`);
        openedWithHistory = true;
      }
    }
    render(position, push);
  }

  function close(fromHistory = false) {
    if (!dialog.open) return;
    dialog.close();
    document.body.classList.remove('modal-open');
    if (!fromHistory) {
      if (openedWithHistory && history.state?.zjGallery) history.back();
      else history.replaceState(history.state, '', location.pathname + location.search);
    }
    openedWithHistory = false;
    if (opener?.isConnected) opener.focus({preventScroll:true});
  }

  document.querySelectorAll('[data-photo-index]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open(Number(link.dataset.photoIndex), link);
    });
  });
  dialog.querySelector('[data-close]').addEventListener('click', () => close());
  dialog.querySelector('[data-previous]').addEventListener('click', () => render(index - 1));
  dialog.querySelector('[data-next]').addEventListener('click', () => render(index + 1));
  thumbs.forEach((thumb, position) => thumb.addEventListener('click', () => render(position)));
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); render(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); render(index + 1); }
    if (event.key === 'Home') { event.preventDefault(); render(0); }
    if (event.key === 'End') { event.preventDefault(); render(photos.length - 1); }
  });
  dialog.querySelector('.lightbox-stage').addEventListener('click', (event) => {
    if (event.target === event.currentTarget) close();
  });
  const stage = dialog.querySelector('.lightbox-stage');
  stage.addEventListener('touchstart', (event) => {
    touch = event.touches.length === 1 ? {x:event.touches[0].clientX, y:event.touches[0].clientY} : null;
  }, {passive:true});
  stage.addEventListener('touchend', (event) => {
    if (!touch || event.touches.length || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) render(index + (dx < 0 ? 1 : -1));
  }, {passive:true});
  stage.addEventListener('touchcancel', () => { touch = null; }, {passive:true});
  img.addEventListener('error', () => { img.hidden = true; error.hidden = false; });
  dialog.querySelector('[data-retry]').addEventListener('click', () => render(index));
  function syncLocation() {
    const match = location.hash.match(/^#photo-(\d+)$/);
    if (match && Number(match[1]) >= 1 && Number(match[1]) <= photos.length) open(Number(match[1]) - 1, null, false);
    else close(true);
  }
  window.addEventListener('popstate', syncLocation);
  window.addEventListener('hashchange', syncLocation);
  syncLocation();
})();
