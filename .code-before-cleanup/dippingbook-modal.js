
(() => {
  const modal = document.getElementById('dippingbookModal');
  const opener = document.querySelector('[data-dippingbook-open]');
  if (!modal || !opener) return;
  const tabs = [...modal.querySelectorAll('[data-db-tab]')];
  const panels = [...modal.querySelectorAll('[role="tabpanel"]')];
  const count = modal.querySelector('.db-count');
  const mobile = window.matchMedia('(max-width: 767px)');
  const strip = modal.querySelector('.db-tabs');
  const guide = document.createElement('div');
  guide.className = 'db-scroll-guide';
  guide.innerHTML = '<span aria-hidden="true">↓</span><span>Scroll Down</span>';
  modal.querySelector('.db-hero').after(guide);
  const tabRail = document.createElement('div');
  tabRail.className = 'db-tab-rail';
  strip.before(tabRail);
  const railPrevious = document.createElement('button');
  railPrevious.type = 'button';
  railPrevious.className = 'db-rail-arrow';
  railPrevious.setAttribute('aria-label', '이전 소개 탭');
  railPrevious.textContent = '◀';
  const railNext = document.createElement('button');
  railNext.type = 'button';
  railNext.className = 'db-rail-arrow';
  railNext.setAttribute('aria-label', '다음 소개 탭');
  railNext.textContent = '▶';
  tabRail.append(railPrevious, strip, railNext);
  function syncScrollGuide() {
    const dismissed = modal.scrollTop > 8;
    guide.classList.toggle('is-dismissed', dismissed);
    guide.setAttribute('aria-hidden', String(dismissed || !mobile.matches));
  }
  modal.addEventListener('scroll', syncScrollGuide, { passive: true });
  mobile.addEventListener('change', syncScrollGuide);
  let index = 0;
  let previousOverflow = '';
  let cursorLayers = [];
  // Native dialogs occupy the top layer, above body-level cursor elements.
  function liftCursorLayers() {
    cursorLayers = ['cursorTrailCanvas', 'customCursor'].map(id => {
      const element = document.getElementById(id);
      if (!element) return null;
      const marker = document.createComment(id + ' return position');
      element.before(marker);
      modal.appendChild(element);
      return { element, marker };
    }).filter(Boolean);
  }
  function restoreCursorLayers() {
    cursorLayers.forEach(({ element, marker }) => {
      marker.replaceWith(element);
    });
    cursorLayers = [];
  }
  function select(next, focus = false) {
    index = (next + tabs.length) % tabs.length;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    count.textContent = (index + 1) + ' / ' + tabs.length;
    if (focus) tabs[index].focus();
    if (modal.open && window.matchMedia('(max-width: 767px)').matches) {
      strip.scrollLeft += tabs[index].getBoundingClientRect().left - strip.getBoundingClientRect().left - 4;
      const nav = modal.querySelector('.db-nav');
      modal.scrollTop = nav.offsetTop;
    }
  }
  opener.addEventListener('click', event => {
    event.preventDefault();
    if (modal.open) return;
    opener.querySelectorAll('video').forEach(video => video.pause());
    select(0);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modal.showModal();
    liftCursorLayers();
    modal.scrollTop = 0;
    syncScrollGuide();
    strip.scrollLeft = 0;
  });
  modal.querySelector('.db-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const r = modal.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
  });
  modal.addEventListener('close', () => {
    restoreCursorLayers();
    document.body.style.overflow = previousOverflow;
    opener.focus({preventScroll:true});
  });
  tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)));
  // At a section boundary, a fresh scroll gesture advances the presentation.
  let lastAdvance = 0;
  let touchStart = null;
  function advanceOnScroll(delta) {
    if (performance.now() - lastAdvance < 900) return;
    const atBottom = modal.scrollTop + modal.clientHeight >= modal.scrollHeight - 3;
    const atSectionTop = modal.scrollTop <= modal.querySelector('.db-nav').offsetTop + 3;
    if (delta > 0 && atBottom && index < tabs.length - 1) { lastAdvance=performance.now(); select(index+1); }
    else if (delta < 0 && atSectionTop && index > 0) { lastAdvance=performance.now(); select(index-1); }
  }
  modal.addEventListener('wheel', event => {
    if (Math.abs(event.deltaY)>Math.abs(event.deltaX) && Math.abs(event.deltaY)>15 && !event.target.closest('.db-tabs')) advanceOnScroll(event.deltaY);
  }, {passive:true});
  modal.addEventListener('touchstart', event => { touchStart={y:event.touches[0].clientY, bottom:modal.scrollTop+modal.clientHeight>=modal.scrollHeight-3}; }, {passive:true});
  modal.addEventListener('touchend', event => {
    if (touchStart?.bottom && touchStart.y-event.changedTouches[0].clientY>45) advanceOnScroll(1);
    touchStart=null;
  }, {passive:true});
  modal.addEventListener('scroll', () => {
    const total = modal.scrollHeight-modal.clientHeight;
    modal.querySelector('.db-nav').style.setProperty('--db-reading-progress', `${100*(index+(total>0?modal.scrollTop/total:1))/tabs.length}%`);
  }, {passive:true});
  railPrevious.addEventListener('click', () => select(index - 1));
  railNext.addEventListener('click', () => select(index + 1));
  modal.querySelector('.db-prev').addEventListener('click', () => select(index - 1));
  modal.querySelector('.db-next').addEventListener('click', () => select(index + 1));
  modal.querySelector('.db-tabs').addEventListener('keydown', event => {
    const directions = {ArrowRight:index+1, ArrowLeft:index-1, Home:0, End:tabs.length-1};
    if (!(event.key in directions)) return;
    event.preventDefault();
    select(directions[event.key], true);
  });
})();
