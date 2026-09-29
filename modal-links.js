/* Shareable modal URLs. Reuse existing open/close handlers and media cleanup. */
document.addEventListener('DOMContentLoaded', () => {
  const definitions = [
    ['dippingbook', '[data-dippingbook-open]', 'dippingbookModal'],
    ['lego', '[data-lego-open]', 'legoModal'],
    ['hangeul', '[data-award-case="hangeul"]', 'awardCaseModal'],
    ['cosmetics', '[data-award-case="cosmetics"]', 'awardCaseModal'],
    ['hunmin', '[data-video-open][data-project-number="02"]', 'projectVideoModal', '#projectModalClose'],
    ['skinex-ppf', '[data-detail-open][data-project-number="05"]', 'detailPageModal', '#detailPageModalClose'],
    ['wheel-decal', '[data-detail-open][data-project-number="06"]', 'detailPageModal', '#detailPageModalClose'],
    ['ipass-filter', '[data-detail-open][data-project-number="07"]', 'detailPageModal', '#detailPageModalClose'],
    ['forest-filter', '[data-detail-open][data-project-number="08"]', 'detailPageModal', '#detailPageModalClose'],
    ['planner', '[data-planner-open][aria-controls="plannerModal"]', 'plannerModal'],
    ['diary-planner', '[data-planner-open][aria-controls="diaryPlannerModal"]', 'diaryPlannerModal'],
    ['study-notes', '[data-planner-open][aria-controls="studyNotesModal"]', 'studyNotesModal'],
    ['life-planner', '[data-planner-open][aria-controls="lifePlannerModal"]', 'lifePlannerModal'],
  ];
  const routes = new Map();
  for (const [slug, selector, id, closeSelector] of definitions) {
    const buttons = [...document.querySelectorAll(selector)];
    const modal = document.getElementById(id);
    if (buttons.length && modal) routes.set(slug, { slug, buttons, modal, closeSelector });
  }
  let active = null;
  let syncing = false;
  let pending = false;
  const isOpen = ({ modal }) => modal instanceof HTMLDialogElement
    ? modal.open : !modal.hidden && modal.style.display !== 'none';
  const currentRoute = () => routes.get(location.hash.slice(1));
  // Separate controls from each project's own slide/tab arrows.
  const projectRoutes = [...routes.values()].filter(route => route.buttons.some(button => button.closest('#projectGrid')));
  const projectNav = document.createElement('nav');
  projectNav.className = 'project-neighbors';
  projectNav.setAttribute('popover', 'manual');
  projectNav.setAttribute('aria-label', '이전 및 다음 프로젝트');
  projectNav.innerHTML = ['previous', 'next'].map((direction, index) =>
    `<button type="button" class="project-neighbor project-neighbor--${direction}"><span class="project-neighbor-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${index ? 'M4 12h16m-6-6 6 6-6 6' : 'M20 12H4m6-6-6 6 6 6'}"/></svg></span><span class="project-neighbor-label">${index ? '다음' : '이전'} 프로젝트</span><span class="project-neighbor-title"></span></button>`
  ).join('');
  projectNav.insertAdjacentHTML('afterbegin', `<div class="project-mobile-scroll-cue" aria-hidden="true"><span class="project-mobile-scroll-copy"><svg class="project-scroll-mouse" viewBox="0 0 24 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="27" rx="7"/><path d="M12 7v5" stroke-linecap="round"/></svg><svg class="project-scroll-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16m-5-5 5 5 5-5"/></svg><span>아래로 스크롤</span></span></div>`);
  const transitionCover = document.createElement('div');
  transitionCover.className = 'project-switch-cover';
  transitionCover.setAttribute('aria-hidden', 'true');
  document.body.append(transitionCover);
  let navRoute = null;
  let navFrame;
  let navUntil = 0;
  let switchingProject = false;
  const navButtons = [...projectNav.querySelectorAll('button')];
  navButtons.forEach((button, index) => button.addEventListener('click', event => {
    event.stopPropagation();
    if (!active || syncing) return;
    const position = projectRoutes.indexOf(active);
    const next = projectRoutes[position + (index ? 1 : -1)];
    if (!next) return;
    const state = { ...history.state };
    if (state.portfolioModal) state.portfolioModal = next.slug;
    history.replaceState(state, '', '#' + next.slug);
    switchingProject = true;
    transitionCover.classList.add('is-active');
    syncFromUrl();
  }));

  function positionProjectNav() {
    cancelAnimationFrame(navFrame);
    if (projectRoutes.length < 2 || !('showPopover' in projectNav)) return;
    if (!active || !isOpen(active) || syncing || !projectRoutes.includes(active)) {
      if (projectNav.matches(':popover-open')) projectNav.hidePopover();
    } else {
      const panel = active.modal.matches('dialog') ? active.modal : active.modal.querySelector('[role="dialog"]');
      const rect = panel.getBoundingClientRect();
      // Use a sticky in-panel footer when the outside gutters are too narrow.
      const gutter = Math.min(rect.left, innerWidth - rect.right);
      {
        const compact = innerWidth < 1000 || gutter < 112;
        if (compact) {
          if (projectNav.matches(':popover-open')) projectNav.hidePopover();
          projectNav.removeAttribute('popover');
        } else projectNav.setAttribute('popover', 'manual');
        projectNav.classList.toggle('is-compact', compact);
        const parent = compact ? panel : active.modal;
        if (projectNav.parentElement !== parent) parent.append(projectNav);
        if (navRoute !== active) {
          if (projectNav.matches(':popover-open')) projectNav.hidePopover();
          parent.append(projectNav);
          navRoute = active;
          const position = projectRoutes.indexOf(active);
          navButtons.forEach((button, index) => {
            const neighbor = projectRoutes[position + (index ? 1 : -1)];
            button.hidden = !neighbor;
            if (!neighbor) return;
            const card = neighbor.buttons.find(item => item.closest('#projectGrid'));
            const title = card.querySelector('.folder-card-meta-copy p')?.textContent.trim() || card.dataset.projectTitle || neighbor.slug;
            button.querySelector('.project-neighbor-title').textContent = title;
            button.setAttribute('aria-label', `${index ? '다음' : '이전'} 프로젝트: ${title}`);
          });
        }
        projectNav.style.setProperty('--neighbor-width', Math.min(164, gutter - 24) + 'px');
        projectNav.style.setProperty('--neighbor-left', rect.left / 2 + 'px');
        projectNav.style.setProperty('--neighbor-right', (innerWidth + rect.right) / 2 + 'px');
        projectNav.style.setProperty('--neighbor-top', (rect.top + rect.height / 2) + 'px');
        if (!compact && !projectNav.matches(':popover-open')) projectNav.showPopover();
      }
    }
    if ((active || syncing) && performance.now() < navUntil) navFrame = requestAnimationFrame(positionProjectNav);
  }
  window.addEventListener('resize', () => {
    navUntil = performance.now() + 450;
    positionProjectNav();
  });
  if (projectRoutes.length > 1 && 'showPopover' in projectNav) positionProjectNav();

  function closedByUser() {
    if (syncing || !active || isOpen(active)) return;
    const previous = active;
    active = null;
    positionProjectNav();
    if (currentRoute() !== previous) return;
    if (history.state?.portfolioModal === previous.slug) {
      history.back();
    } else {
      // A shared link has no in-page history entry to return to.
      history.replaceState(history.state, '', location.pathname + location.search);
    }
  }

  function closeRoute(route) {
    return new Promise(resolve => {
      if (!isOpen(route)) { resolve(); return; }
      const observer = new MutationObserver(() => {
        if (!isOpen(route)) {
          observer.disconnect();
          // Native close listeners restore focus, scrolling and cursor layers.
          if (route.modal instanceof HTMLDialogElement) {
            route.modal.addEventListener('close', resolve, { once:true });
          } else resolve();
        }
      });
      observer.observe(route.modal, { attributes:true, attributeFilter:['open', 'hidden', 'style'] });
      if (route.modal instanceof HTMLDialogElement) route.modal.close();
      else route.modal.querySelector(route.closeSelector).click();
    });
  }

  async function syncFromUrl() {
    pending = true;
    if (syncing) return;
    syncing = true;
    try {
      while (pending) {
        pending = false;
        const next = currentRoute();
        if (active === next && active && isOpen(active)) continue;
        if (active) {
          const previous = active;
          if (switchingProject) previous.modal.dataset.projectSwitch = 'true';
          active = null;
          await closeRoute(previous);
        }
        // The user may navigate again while the closing animation plays.
        if (next !== currentRoute()) { pending = true; continue; }
        if (next) {
          if (switchingProject) next.modal.dataset.projectSwitch = 'true';
          const button = next.buttons.find(button => button.getClientRects().length) || next.buttons[0];
          button.click();
          if (isOpen(next)) active = next;
        }
      }
    } finally {
      syncing = false;
      navUntil = performance.now() + 450;
      positionProjectNav();
      if (switchingProject) {
        switchingProject = false;
        transitionCover.classList.remove('is-active');
        if (active) {
          const focusTarget = active.modal.querySelector('button');
          focusTarget?.focus({ preventScroll:true });
        }
      }
    }
  }

  for (const route of routes.values()) {
    for (const button of route.buttons) {
      button.addEventListener('click', () => {
        if (syncing || !isOpen(route)) return;
        active = route;
        navUntil = performance.now() + 450;
        positionProjectNav();
        if (currentRoute() !== route) {
          history.pushState({ ...history.state, portfolioModal:route.slug }, '', '#' + route.slug);
        }
      });
    }
  }
  for (const modal of new Set([...routes.values()].map(route => route.modal))) {
    new MutationObserver(closedByUser).observe(modal, {
      attributes:true, attributeFilter:['open', 'hidden', 'style'],
    });
  }
  window.addEventListener('popstate', syncFromUrl);
  window.addEventListener('hashchange', syncFromUrl);
  syncFromUrl();
});
