(() => {
  const grid = document.getElementById('projectGrid');
  if (!grid) return;
  const mobile = matchMedia('(max-width: 767px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const entries = [...grid.querySelectorAll('.folder-card')].map(card => ({
    card, stage: card.querySelector('.folder-card-preview'),
    videos: [...card.querySelectorAll('video')],
    image: card.querySelector('.detail-scroll-preview-image'),
    running: false, frame: 0
  })).filter(entry => entry.stage && (entry.videos.length || entry.image));
  let timer;
  function stop(entry) {
    entry.running = false;
    cancelAnimationFrame(entry.frame);
    entry.videos.forEach(video => video.pause());
    if (entry.image) {
      entry.image.style.transform = '';
      entry.image.style.transition = '';
    }
  }
  function stopAll() { entries.forEach(stop); }
  function start(entry) {
    if (entry.running) return;
    entry.running = true;
    entry.videos.forEach(video => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.loop = true;
      video.setAttribute('playsinline', '');
      if (video.dataset.previewSrc && !video.getAttribute('src')) video.src = video.dataset.previewSrc;
      video.play()?.then(() => {
        if (!entry.running) video.pause();
      }).catch(() => {});
    });
    if (!entry.image) return;
    const image = entry.image;
    image.style.transition = 'none';
    let startTime;
    function step(now) {
      if (!entry.running) return;
      const distance = Math.max(0, image.clientHeight - entry.stage.clientHeight);
      if (distance > 0) {
        startTime ??= now;
        const travel = Math.max(6000, Math.min(30000, distance / 32 * 1000));
        const pause = 1000;
        const time = (now - startTime) % (travel * 2 + pause * 2);
        let progress = 0;
        if (time > pause && time <= pause + travel) progress = (time - pause) / travel;
        else if (time > pause + travel && time <= pause * 2 + travel) progress = 1;
        else if (time > pause * 2 + travel) progress = 1 - (time - pause * 2 - travel) / travel;
        const smooth = progress * progress * (3 - 2 * progress);
        image.style.transform = `translate3d(0, ${-distance * smooth}px, 0)`;
      }
      entry.frame = requestAnimationFrame(step);
    }
    entry.frame = requestAnimationFrame(step);
  }
  function selectVisible() {
    if (!mobile.matches || reducedMotion.matches || document.hidden ||
        document.body.classList.contains('modal-open') || document.querySelector('dialog[open]') ||
        !grid.closest('.mobile-explorer-folder-open')) { stopAll(); return; }
    const height = window.innerHeight;
    const headerBottom = document.querySelector('.browser-bar')?.getBoundingClientRect().bottom || 0;
    const candidates = entries.map(entry => {
      const rect = entry.stage.getBoundingClientRect();
      const visible = Math.max(0, Math.min(rect.bottom, height) - Math.max(rect.top, headerBottom));
      return { entry, rect, visible, distance: Math.abs((rect.top + rect.bottom) / 2 - height / 2) };
    }).filter(item => item.rect.width > 0 && item.rect.height > 0 && item.visible / item.rect.height >= .7)
      .sort((a, b) => a.distance - b.distance);
    const selected = candidates.slice(0, 2).map(item => item.entry);
    entries.forEach(entry => selected.includes(entry) ? start(entry) : stop(entry));
  }
  function settle() {
    clearTimeout(timer);
    if (!mobile.matches) return;
    timer = setTimeout(selectVisible, 350);
  }
  window.addEventListener('scroll', () => { if (mobile.matches) stopAll(); settle(); }, { passive: true });
  window.addEventListener('resize', () => { if (mobile.matches) stopAll(); settle(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAll(); else settle(); });
  grid.addEventListener('click', () => { if (mobile.matches) stopAll(); });
  document.addEventListener('touchend', settle, { passive: true });
  mobile.addEventListener('change', () => { stopAll(); settle(); });
  reducedMotion.addEventListener('change', () => { stopAll(); settle(); });
  const observer = new MutationObserver(settle);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'hidden', 'open'], subtree: true });
  settle();
})();
