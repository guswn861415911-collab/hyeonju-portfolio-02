/* Optional award records: existing copy and links remain the original DOM nodes. */
(() => {
  let active = null;
  document.addEventListener('awardcase:prepare', ({ detail: { modal, gallery } }) => {
    active?.cleanup(); active = null;
    modal.classList.toggle('has-award-gallery', gallery.length > 0);
    if (!gallery.length) return;
    const copy = modal.querySelector('.ac-copy');
    const heading = copy.querySelector('.ac-description-heading');
    const description = copy.querySelector('.ac-description');
    const role = copy.querySelector('.ac-role');
    const tags = copy.querySelector('.ac-role-tags');
    const tagMarker = document.createComment('original role tags'); tags.before(tagMarker);
    const shell = document.createElement('div'); shell.className = 'ac-scroll-shell';
    const scroll = document.createElement('div'); scroll.className = 'ac-description-scroll';
    scroll.tabIndex = 0; scroll.setAttribute('role', 'region'); scroll.setAttribute('aria-label', '작품 설명 본문');
    heading.after(shell); shell.append(scroll); scroll.append(description); role.after(tags);
    const records = document.createElement('section'); records.className = 'ac-records';
    records.setAttribute('aria-labelledby', 'acRecordsTitle');
    records.innerHTML = '<header class="ac-records-header"><div><h3 id="acRecordsTitle">시상식 &amp; 수상 기록</h3><p>2026.10.08 · 영상 부문 최우수상</p></div><p>이미지를 클릭하면 크게 볼 수 있어요.</p></header><div class="ac-records-grid"></div>';
    modal.querySelector('.ac-layout').after(records);
    gallery.forEach((item, index) => {
      const figure = document.createElement('figure');
      const button = document.createElement('button'); button.type = 'button'; button.className = 'ac-record-image';
      button.setAttribute('aria-label', item.caption + ' 크게 보기'); button.setAttribute('aria-haspopup', 'dialog');
      const image = document.createElement('img'); image.src = item.src; image.alt = item.alt; image.loading = 'lazy';
      const icon = document.createElement('span'); icon.className = 'ac-expand'; icon.setAttribute('aria-hidden','true');
      icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5M4 4l6 6m10-6-6 6M4 20l6-6m10 6-6-6"/></svg>';
      button.append(image, icon);
      const caption = document.createElement('figcaption'); caption.textContent = item.caption;
      figure.append(button, caption); records.querySelector('.ac-records-grid').append(figure);
      button.addEventListener('click', () => openViewer(gallery, index, button, modal, scroll));
    });
    function updateFade() {
      const desktop = matchMedia('(min-width:768px)').matches;
      shell.classList.toggle('has-more', desktop && scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop > 2);
      scroll.tabIndex = desktop && scroll.scrollHeight > scroll.clientHeight + 2 ? 0 : -1;
    }
    scroll.addEventListener('scroll', updateFade, { passive: true });
    const observer = new ResizeObserver(updateFade); observer.observe(scroll); observer.observe(description);
    active = { updateFade, cleanup() {
      observer.disconnect(); tagMarker.replaceWith(tags); shell.before(description); shell.remove(); records.remove();
    } };
  });
  document.addEventListener('awardcase:opened', () => requestAnimationFrame(() => active?.updateFade()));

  const viewer = document.createElement('dialog'); viewer.id = 'awardImageViewer';
  viewer.setAttribute('aria-label','시상식 및 수상 기록 이미지 확대 보기');
  viewer.innerHTML = '<div class="av-toolbar"><button type="button" data-av="close" aria-label="이미지 뷰어 닫기" autofocus>×</button></div><div class="av-stage" tabindex="0" role="region" aria-label="수상 기록 이미지"><div class="av-canvas"><img alt=""></div></div><footer><button type="button" data-av="prev" aria-label="이전 이미지">←</button><p aria-live="polite" class="av-caption"></p><button type="button" data-av="next" aria-label="다음 이미지">→</button></footer>';
  document.body.append(viewer);
  const image = viewer.querySelector('img');
  let items = [], index = 0, returnTo, parentModal, textScroll, savedScroll;
  function show(next) {
    index = (next + items.length) % items.length;
    image.alt = items[index].alt; image.src = items[index].src;
    viewer.querySelector('.av-caption').textContent = `${index + 1} / ${items.length} · ${items[index].caption}`;
  }
  function openViewer(gallery, start, button, modal, scroll) {
    items = gallery; returnTo = button; parentModal = modal; textScroll = scroll;
    savedScroll = [modal.scrollTop, scroll.scrollTop]; viewer.showModal(); show(start);
  }
  viewer.addEventListener('click', e => {
    const action = e.target.closest('[data-av]')?.dataset.av;
    if (action === 'close') viewer.close();
    if (action === 'prev') show(index - 1);
    if (action === 'next') show(index + 1);
  });
  viewer.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); viewer.close(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); show(index + (e.key === 'ArrowRight' ? 1 : -1)); }
  });
  viewer.addEventListener('cancel', e => { e.preventDefault(); e.stopPropagation(); viewer.close(); });
  viewer.addEventListener('close', () => {
    parentModal.scrollTop = savedScroll[0]; textScroll.scrollTop = savedScroll[1]; returnTo.focus({ preventScroll: true });
  });
})();
