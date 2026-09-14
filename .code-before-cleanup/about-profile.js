(() => {
  const page = document.querySelector('.about-page');
  const hero = page?.querySelector('.about-hero');
  const deck = page?.querySelector('.about-info-grid');
  if (!hero || !deck) return;
  const contacts = hero.querySelector('.about-contact-list');
  hero.after(contacts);
  const stats = document.createElement('section');
  stats.className = 'about-stats';
  stats.setAttribute('aria-label', 'About me');
  stats.innerHTML = '<p>ABOUT ME</p><div class="about-stat-pair"><div><strong>5+</strong><span>Years<br>Experience</span></div><div><strong>16</strong><span>Projects</span></div></div><div class="about-stat-design"><strong>Design × AI</strong><span>Visual Designer<br>Content Creator</span></div>';
  hero.querySelector('.about-copy').append(stats);
  const subtitles = [
    '디자인을 넘어, 브랜드의 가치를 만드는 경험',
    '다양한 도구로 아이디어를 실현하는 멀티 크리에이터',
    '지식의 경험을 바탕으로 꾸준히 성장해온 시간',
    '주요 작업 분야를 소개합니다.',
    '더 나은 결과를 만드는 나의 작업 도구들',
    '작지만 의미있는 성과들이 만든 오늘'
  ];
  const labels = ['경력사항', '전문 역량', '교육', '작업 분야', '작업 도구', '성과'];
  const paths = [
    '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12c5 3 13 3 18 0M10 13h4v3h-4z"/>',
    '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
    '<path d="m2 9 10-5 10 5-10 5ZM6 11v7c4 3 8 3 12 0v-7M22 9v8"/>',
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    '<path d="m5 20 14-14-3-3L2 17v4h4M12 7l5 5M15 17l4 4 2-2-4-4M3 3l6 6"/>',
    '<path d="M7 3h10v7a5 5 0 0 1-10 0ZM7 5H3v3a4 4 0 0 0 4 4M17 5h4v3a4 4 0 0 1-4 4M12 15v6M7 21h10"/>'
  ];
  const cards = [...deck.querySelectorAll(':scope > .about-info-card')];
  const carousel = document.createElement('section');
  carousel.className = 'about-carousel';
  carousel.setAttribute('aria-roledescription', 'carousel');
  carousel.setAttribute('aria-label', '프로필 상세 정보');
  carousel.tabIndex = 0;
  deck.before(carousel);
  carousel.append(deck);
  cards.forEach((card, i) => {
    card.id = `about-slide-${i + 1}`;
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `${i + 1} / ${cards.length}: ${card.querySelector('h3').textContent}`);
    const top = document.createElement('div');
    top.className = 'about-slide-meta';
    top.innerHTML = `<span><b>${String(i + 1).padStart(2, '0')}</b> / 06</span><span>${labels[i]}</span>`;
    card.prepend(top);
    const icon = document.createElement('span');
    icon.className = 'about-slide-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths[i]}</svg>`;
    top.after(icon);
    const subtitle = document.createElement('p');
    subtitle.className = 'about-slide-subtitle';
    subtitle.textContent = subtitles[i];
    card.querySelector('h3').after(subtitle);
  });
  const controls = document.createElement('div');
  controls.className = 'about-carousel-controls';
  controls.innerHTML = '<button class="about-slide-prev" type="button" aria-label="이전 프로필 항목"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7"/></svg></button><div class="about-slide-dots"></div><button class="about-slide-next" type="button" aria-label="다음 프로필 항목"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5 7 7-7 7"/></svg></button>';
  carousel.append(controls);
  const status = document.createElement('span');
  status.className = 'about-carousel-status';
  status.setAttribute('aria-live', 'polite');
  carousel.append(status);
  let active = 0;
  const dots = cards.map((card, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `${card.querySelector('h3').textContent} 보기`);
    button.setAttribute('aria-controls', card.id);
    button.addEventListener('click', () => show(i));
    controls.querySelector('.about-slide-dots').append(button);
    return button;
  });
  function show(index, announce = true) {
    const direction = index < active ? -1 : 1;
    active = (index + cards.length) % cards.length;
    cards.forEach((card, i) => {
      card.classList.toggle('is-current', i === active);
      card.inert = i !== active;
      card.setAttribute('aria-hidden', String(i !== active));
      dots[i].setAttribute('aria-current', String(i === active));
    });
    if (announce) status.textContent = `${active + 1} / 6, ${cards[active].querySelector('h3').textContent}`;
    if (announce && !matchMedia('(prefers-reduced-motion: reduce)').matches) cards[active].animate([{opacity:0,translate:`${direction*22}px 0`},{opacity:1,translate:'0 0'}],{duration:350,easing:'cubic-bezier(.22,.61,.36,1)'});
  }
  controls.querySelector('.about-slide-prev').addEventListener('click', () => show(active - 1));
  controls.querySelector('.about-slide-next').addEventListener('click', () => show(active + 1));
  carousel.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    show(active + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let touch;
  deck.addEventListener('touchstart', event => { touch = event.touches[0]; }, { passive: true });
  deck.addEventListener('touchend', event => {
    if (!touch) return;
    const dx = event.changedTouches[0].clientX - touch.clientX;
    const dy = event.changedTouches[0].clientY - touch.clientY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) show(active + (dx < 0 ? 1 : -1));
    touch = null;
  }, { passive: true });
  show(0, false);
  const mobileAbout = window.matchMedia('(max-width: 767px)');
  function syncAboutLayout() {
    if (mobileAbout.matches) {
      hero.after(contacts);
      carousel.prepend(deck);
      carousel.hidden = false;
      show(active, false);
    } else {
      hero.querySelector('.about-copy').append(contacts);
      carousel.before(deck);
      carousel.hidden = true;
      cards.forEach(card => {
        card.inert = false;
        card.removeAttribute('aria-hidden');
        card.removeAttribute('aria-roledescription');
      });
    }
    scheduleFit();
  }
  // Measure the shared card track (including all six slides) so navigation
  // never makes the page taller. Shrink only when compact spacing is insufficient.
  let fitFrame;
  function fitMobileAbout() {
    page.style.zoom = '';
    page.style.width = '';
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    const viewportHeight = document.documentElement.clientHeight;
    const top = page.getBoundingClientRect().top + window.scrollY;
    const available = Math.max(120, viewportHeight - top - 16);
    if (page.getBoundingClientRect().height <= available) return;
    let low = 0.1;
    let high = 1;
    for (let i = 0; i < 12; i++) {
      const scale = (low + high) / 2;
      page.style.zoom = scale;
      page.style.width = `${100 / scale}%`;
      if (page.getBoundingClientRect().height > available) high = scale;
      else low = scale;
    }
    page.style.zoom = low;
    page.style.width = `${100 / low}%`;
  }
  function scheduleFit() {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(fitMobileAbout);
  }
  window.addEventListener('resize', scheduleFit);
  window.addEventListener('load', scheduleFit, { once: true });
  document.fonts?.ready.then(scheduleFit);
  mobileAbout.addEventListener('change', syncAboutLayout);
  syncAboutLayout();
  scheduleFit();
})();
