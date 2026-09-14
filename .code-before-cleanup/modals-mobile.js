(() => {
  const mobile = matchMedia('(max-width: 767px)');
  const layouts = [];
  document.querySelectorAll('[data-goodnotes-modal], #projectVideoModalPanel, #detailPageModal .detail-page-modal, #shortsModal .shorts-modal').forEach(panel => {
    const copy = panel.querySelector('.planner-copy, .shorts-modal-copy, .detail-page-modal-copy');
    const title = copy?.querySelector('h2');
    if (!title) return;
    panel.classList.add('mobile-project-modal');
    copy.classList.add('mobile-project-copy');
    const media = [...panel.querySelectorAll('.planner-device, .project-modal-view, .project-laptop-wrap, .shorts-phone-wrap')]
      .filter(node => !node.parentElement.closest('.planner-device, .project-modal-view, .project-laptop-wrap, .shorts-phone-wrap'));
    const items = media.map(node => {
      const marker = document.createComment('Desktop mockup position');
      node.before(marker);
      return { node, marker };
    });
    layouts.push({ title, items });
  });
  function arrange() {
    layouts.forEach(({title, items}) => {
      let anchor = title;
      items.forEach(({node, marker}) => {
        if (mobile.matches) { anchor.after(node); anchor = node; }
        else marker.after(node);
      });
    });
  }
  mobile.addEventListener('change', arrange);
  arrange();
})();
