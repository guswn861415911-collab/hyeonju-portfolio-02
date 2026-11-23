/* Shareable modal URLs. Reuse existing open/close handlers and media cleanup. */
document.addEventListener('DOMContentLoaded', () => {
  const definitions = window.portfolioProjects.map(p => [p.slug, p.selector, p.modal, p.close]);
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
  const projectRoutes = [...routes.values()];
  const projectNav = document.createElement('nav');
  projectNav.className = 'project-neighbors';

  projectNav.setAttribute('aria-label', '이전 및 다음 프로젝트');
  projectNav.innerHTML = ['previous', 'next'].map((direction, index) =>
    `<button type="button" class="project-neighbor project-neighbor--${direction}"><span class="project-neighbor-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${index ? 'M4 12h16m-6-6 6 6-6 6' : 'M20 12H4m6-6-6 6 6 6'}"/></svg></span><span class="project-neighbor-label">${index ? '다음' : '이전'} 프로젝트</span><span class="project-neighbor-title"></span></button>`
  ).join('');
  projectNav.insertAdjacentHTML('afterbegin', `<div class="project-mobile-scroll-cue" aria-hidden="true"><span class="project-mobile-scroll-copy"><svg class="project-scroll-mouse" viewBox="0 0 24 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="27" rx="7"/><path d="M12 7v5" stroke-linecap="round"/></svg><svg class="project-scroll-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16m-5-5 5 5 5-5"/></svg><span>아래로 스크롤</span></span></div>`);
  const transitionCover = document.createElement('div');
  transitionCover.className = 'project-switch-cover';
  transitionCover.setAttribute('aria-hidden', 'true');
  document.body.append(transitionCover);
  let switchingProject = false;
  const navButtons = [...projectNav.querySelectorAll('button')];
  navButtons.forEach((button, index) => button.addEventListener('click', event => {
    event.stopPropagation();
    if (!active || syncing) return;
    const projects = visibleProjects();
    const position = projects.indexOf(active);
    const next = projects[position + (index ? 1 : -1)];
    if (!next) return;
    const state = { ...history.state };
    if (state.portfolioModal) state.portfolioModal = next.slug;
    history.replaceState(state, '', '#' + next.slug);
    switchingProject = true;
    transitionCover.classList.add('is-active');
    syncFromUrl();
  }));

  function visibleProjects() {
    // CINELIQ introduces the full portfolio, so its next project is always Hangeul.
    if (active?.slug === 'cineliq') return projectRoutes;
    const filtered = projectRoutes.filter(route => route.buttons.some(button => !button.classList.contains('is-filter-hidden')));
    return filtered.includes(active) ? filtered : projectRoutes;
  }
  function positionProjectNav() {
    if (!active || !isOpen(active) || syncing) { projectNav.hidden = true; return; }
    const panel = active.modal.matches('dialog') ? active.modal : active.modal.querySelector('[role="dialog"]');
    projectNav.classList.add('is-compact'); projectNav.hidden = false;
    if (projectNav.parentElement !== panel) panel.append(projectNav);
    const projects = visibleProjects(), position = projects.indexOf(active);
    navButtons.forEach((button,index)=>{
      const neighbor = projects[position + (index ? 1 : -1)];
      button.hidden = false; button.disabled = !neighbor;
      const card = neighbor?.buttons.find(item=>item.closest('#projectGrid')) || neighbor?.buttons[0];
      const title = card?.querySelector('.folder-card-meta-copy p')?.textContent.trim() || card?.dataset.projectTitle || neighbor?.slug || (index ? '마지막 프로젝트' : '첫 번째 프로젝트');
      button.querySelector('.project-neighbor-title').textContent = title;
      button.setAttribute('aria-label', (index ? '다음' : '이전') + ' 프로젝트: ' + title);
    });
  }
  window.addEventListener('resize', positionProjectNav);
  document.addEventListener('keydown', event => {
    if (!active || syncing || event.defaultPrevented || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    if (document.querySelector('#awardImageViewer[open]')) return;
    if (event.target.closest('video, audio, iframe, input, textarea, select, [contenteditable], [role="slider"], [role="tablist"], .planner-device, .av-stage')) return;
    event.preventDefault();
    navButtons[event.key === 'ArrowRight' ? 1 : 0].click();
  });

  function closedByUser() {
    if (syncing || !active || isOpen(active)) return;
    const previous = active;
    active = null;
    positionProjectNav();
    if (currentRoute() !== previous) return;
    // Closing is not browser Back: older entries (including embedded players)
    // may point at another project. Clear only this modal's URL and state.
    const state = { ...history.state };
    delete state.portfolioModal;
    history.replaceState(state, '', location.pathname + location.search);
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
          if (isOpen(next)) {
            active = next;
            const panel = next.modal.matches('dialog') ? next.modal : next.modal.querySelector('[role="dialog"]');
            [next.modal, panel, ...panel.querySelectorAll('.ac-description-scroll, .db-panels, .detail-page-scroll-area')].forEach(el => el.scrollTop = 0);
          }
        }
      }
    } finally {
      syncing = false;
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
