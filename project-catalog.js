/* One ordered registry for cards, deep links and project navigation. */
window.portfolioProjects = [
  {slug:'cineliq', selector:'[data-media-project="cineliq"]', modal:'projectMediaModal', category:'web', title:'CINELIQ', subtitle:'Camera technique library · Web service', kicker:'WEB SERVICE / UI·UX DESIGN', poster:'images/project-posters/cineliq.jpg', video:'videos/cineliq-preview.mp4'},
  {slug:'hangeul', selector:'[data-award-case="hangeul"]', modal:'awardCaseModal'},
  {slug:'cosmetics', selector:'[data-award-case="cosmetics"]', modal:'awardCaseModal'},
  {slug:'hunmin', selector:'[data-video-open][data-project-number="02"]', modal:'projectVideoModal', close:'#projectModalClose'},
  {slug:'icn', selector:'[data-video-open][data-project-number="13"]', modal:'projectVideoModal', close:'#projectModalClose'},
  {slug:'seoul-night', selector:'[data-media-project="seoul-night"]', modal:'projectMediaModal', category:'video', title:'서울 29초영화제', subtitle:'AI short film · Contest entry', kicker:'AI SHORT FILM / CONTEST ENTRY', poster:'images/project-posters/seoul-night.jpg', video:'videos/seoul-night.mp4'},
  {slug:'dippingbook', selector:'[data-dippingbook-open]', modal:'dippingbookModal'},
  {slug:'lego', selector:'[data-lego-open]', modal:'legoModal'},
  {slug:'skinex-ppf', selector:'[data-detail-open][data-project-number="05"]', modal:'detailPageModal', close:'#detailPageModalClose'},
  {slug:'wheel-decal', selector:'[data-detail-open][data-project-number="06"]', modal:'detailPageModal', close:'#detailPageModalClose'},
  {slug:'ipass-filter', selector:'[data-detail-open][data-project-number="07"]', modal:'detailPageModal', close:'#detailPageModalClose'},
  {slug:'forest-filter', selector:'[data-detail-open][data-project-number="08"]', modal:'detailPageModal', close:'#detailPageModalClose'},
  {slug:'planner', selector:'[data-planner-open][aria-controls="plannerModal"]', modal:'plannerModal'},
  {slug:'diary-planner', selector:'[data-planner-open][aria-controls="diaryPlannerModal"]', modal:'diaryPlannerModal'},
  {slug:'study-notes', selector:'[data-planner-open][aria-controls="studyNotesModal"]', modal:'studyNotesModal'},
  {slug:'life-planner', selector:'[data-planner-open][aria-controls="lifePlannerModal"]', modal:'lifePlannerModal'}
];
(() => {
  const grid = document.getElementById('projectGrid');
  if (!grid) return;
  for (const project of window.portfolioProjects) {
    if (project.video && !grid.querySelector(project.selector)) {
      const card = document.createElement('button');
      card.type = 'button'; card.className = 'folder-card ' + (project.category === 'web' ? 'folder-butter' : 'folder-peach');
      card.dataset.category = project.category; card.dataset.mediaProject = project.slug;
      card.setAttribute('aria-haspopup', 'dialog'); card.setAttribute('aria-label', project.title + ' 프로젝트 보기');
      card.innerHTML = `<div class="folder-visual"><div class="folder-tab-piece"></div><div class="folder-card-surface"><div class="folder-card-head"></div><div class="folder-card-preview is-landscape new-project-preview"><video class="folder-card-video folder-card-video-landscape" data-preview-src="${project.video}" poster="${project.poster}" muted loop playsinline preload="none" aria-label="${project.title} 영상 미리보기"></video><span class="folder-video-open-hint">VIEW PROJECT ↗</span></div></div></div><div class="folder-card-meta"><div class="folder-card-meta-copy"><p>${project.title}</p><span>${project.subtitle}</span></div><div class="folder-card-meta-side"><small>${project.category === 'web' ? 'WEB SERVICE' : 'FILM ENTRY'}</small><span class="project-arrow">↗</span></div></div>`;
      grid.append(card);
    }
    const card = grid.querySelector(project.selector);
    if (card) { card.dataset.projectSlug = project.slug; grid.append(card); }
  }
})();
