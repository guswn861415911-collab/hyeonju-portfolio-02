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

  function closedByUser() {
    if (syncing || !active || isOpen(active)) return;
    const previous = active;
    active = null;
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
          requestAnimationFrame(() => requestAnimationFrame(resolve));
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
          active = null;
          await closeRoute(previous);
        }
        // The user may navigate again while the closing animation plays.
        if (next !== currentRoute()) { pending = true; continue; }
        if (next) {
          const button = next.buttons.find(button => button.getClientRects().length) || next.buttons[0];
          button.click();
          if (isOpen(next)) active = next;
        }
      }
    } finally { syncing = false; }
  }

  for (const route of routes.values()) {
    for (const button of route.buttons) {
      button.addEventListener('click', () => {
        if (syncing || !isOpen(route)) return;
        active = route;
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
