/* Reorder existing DOM nodes, preserving players, listeners and desktop positions. */
document.addEventListener('DOMContentLoaded', () => {
  const narrow = matchMedia('(max-width:900px)');
  const layouts = [];
  const panels = document.querySelectorAll('#projectVideoModalPanel, #detailPageModal .detail-page-modal, [data-goodnotes-modal], #awardCaseModal, #projectMediaModal, #dippingbookModal, #legoModal');
  for (const panel of panels) {
    const copy = panel.querySelector('.shorts-modal-copy, .detail-page-modal-copy, .planner-copy, .ac-copy, .pm-copy, .db-hero-copy');
    const title = copy?.querySelector('h2'); if (!title) continue;
    panel.classList.add('responsive-project-panel');
    if (!panel.matches('#awardCaseModal, #projectMediaModal, #dippingbookModal, #legoModal')) { panel.classList.add('mobile-project-modal'); copy.classList.add('mobile-project-copy'); }
    const media = [...panel.querySelectorAll('.project-modal-view, .project-laptop-wrap, .planner-device, .ac-phone-wrap, .pm-media, .db-device-art')].filter(el=>!el.parentElement.closest('.project-modal-view, .planner-device'));
    const actions = [...panel.querySelectorAll('.project-video-actions, .ac-actions, .pm-actions, .db-footer, .planner-blog-link, a.project-number-chip')].filter(el=>!el.closest('.project-video-actions') || el.classList.contains('project-video-actions'));
    const nodes = [...new Set([...media,...actions])].map(element=>{const marker=document.createComment('desktop project position');element.before(marker);return {element,marker};});
    layouts.push({panel,title,nodes});
  }
  function update() {
    for(const {panel,title,nodes} of layouts){
      panel.classList.toggle('media-first',narrow.matches);
      let anchor=title;
      for(const {element,marker} of nodes){
        const parent=narrow.matches?title.parentElement:marker.parentElement;
        const before=narrow.matches?anchor.nextSibling:marker.nextSibling;
        if(element!==before){if(parent.moveBefore)parent.moveBefore(element,before);else parent.insertBefore(element,before);}
        if(narrow.matches)anchor=element;
      }
    }
  }
  narrow.addEventListener('change',update);update();
});
