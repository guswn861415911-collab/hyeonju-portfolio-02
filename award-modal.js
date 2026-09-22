/* One award presentation for About and Projects. */
(() => {
  const triggers = [...document.querySelectorAll('[data-award-case]')];
  if (!triggers.length) return;
  const projects = {
    hangeul: {
      title: '2026 한글 AI아트 창작 공모전\n최우수상 수상작',
      award: '최우수상 · Top Excellence Award', tier: 'gold', video: 'yqp4EKRR_ek',
      paragraphs: [
        '한글의 아름다움과 역사적 의미를\nAI 기술을 활용하여 재해석한 숏폼 프로젝트입니다.',
        'AI 이미지 생성부터 영상 제작,\n배경음악, 나레이션까지 직접 제작하여\n하나의 완성도 높은 콘텐츠로 제작했습니다.',
        '본 작품은 2인 팀 프로젝트로 진행되었으며,\n한글 AI아트 창작 공모전에서 최우수상을 수상한 작품입니다.'
      ],
      role: '콘텐츠 기획부터 AI 영상 생성, 자막 디자인, 최종 편집까지 영상 제작 전반을 주도했습니다.',
      responsibilities: ['기획', 'AI 영상 생성', '자막 디자인', '영상 편집']
    },
    cosmetics: {
      title: '2026 화장품 안전성 평가 제도\n숏폼 공모전 장려상 수상작',
      award: '장려상 · Encouragement Award', tier: 'bronze', video: 'vJjWN50Z5XM',
      paragraphs: [
        '2026 화장품 안전성 평가 제도를 쉽고 친근하게 전달하기 위해 제작한\nAI 숏폼 영상입니다.',
        '공모전 주제를 누구나 쉽게 이해할 수 있도록\nAI를 활용한 이미지 제작부터 영상 편집,\n배경음악, 나레이션까지 직접 제작했습니다.',
        '짧은 시간 안에 핵심 메시지를 효과적으로 전달하는\n스토리텔링과 캐릭터 중심의 연출을 구성했습니다.',
        '본 작품은 2인 팀 프로젝트로 제작되었으며,\n‘2026 화장품 안전성 평가 제도 숏폼 공모전’에서\n장려상을 수상한 작품입니다.'
      ],
      role: 'AI 이미지·영상 생성, 자막 디자인, 음악·나레이션, 영상 편집 등 영상 제작 전반을 담당했습니다.',
      responsibilities: ['AI 이미지 생성', 'AI 영상 생성', '자막 디자인', '음악 · 나레이션', '영상 편집']
    }
  };
  const laurel = `<svg viewBox="0 0 44 100" aria-hidden="true"><path d="M33 94C6 71 8 32 28 7" fill="none" stroke="currentColor" stroke-width="1.5"/>${[25,19,15,15,18,24].map((x,i) => `<ellipse cx="${x-6}" cy="${15+i*13}" rx="3.8" ry="9" transform="rotate(-35 ${x-6} ${15+i*13})" fill="currentColor"/><ellipse cx="${x+5}" cy="${13+i*13}" rx="3.8" ry="9" transform="rotate(40 ${x+5} ${13+i*13})" fill="currentColor"/><path d="m${x-9} ${9+i*13} 5 10" stroke="#ffedc4" stroke-width="1" opacity=".75"/>`).join('')}<ellipse cx="32" cy="92" rx="4" ry="6" fill="currentColor"/></svg>`;
  const crown = '<svg viewBox="0 0 32 26" aria-hidden="true"><path d="m3 7 7 7 6-11 6 11 7-7-4 16H7Z" fill="currentColor"/><circle cx="3" cy="5" r="2" fill="currentColor"/><circle cx="16" cy="2" r="2" fill="currentColor"/><circle cx="29" cy="5" r="2" fill="currentColor"/></svg>';
  const modal = document.createElement('dialog');
  modal.id = 'awardCaseModal';
  modal.setAttribute('aria-labelledby', 'awardCaseTitle');
  modal.innerHTML = `<button class="ac-close" type="button" aria-label="수상작 모달 닫기">×</button>
    <div class="ac-layout"><div class="ac-copy">
      <p class="ac-kicker">AWARD SHORT-FORM</p>
      <div class="ac-award-banner"><span class="ac-laurel">${laurel}</span><div class="ac-award-pill">${crown}<span data-ac-award></span></div><span class="ac-laurel ac-laurel-right">${laurel}</span></div>
      <h2 id="awardCaseTitle"></h2>
      <h3 class="ac-description-heading">작품 설명</h3><div class="ac-description"></div>
      <section class="ac-role" aria-labelledby="awardCaseRoleTitle">
        <h3 id="awardCaseRoleTitle">기여 역할</h3>
        <p class="ac-role-description"></p>
        <ul class="ac-role-tags"></ul>
      </section>
      <div class="ac-chips"></div>
      <div class="ac-actions"><a class="ac-youtube" target="_blank" rel="noopener noreferrer">Open on YouTube <span aria-hidden="true">↗</span></a><a href="https://www.youtube.com/@Study_ebeb/shorts" target="_blank" rel="noopener noreferrer">@Study_ebeb <span aria-hidden="true">↗</span></a></div>
    </div><div class="ac-phone-wrap"><div class="ac-phone"><div class="ac-phone-status" aria-hidden="true"><b>9:41</b><span>●●● 5G ▰</span></div><div class="ac-island" aria-hidden="true"></div><iframe class="ac-video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div></div></div>`;
  document.body.append(modal);
  let opener, overflow, hadModalClass, cursors = [];
  const video = modal.querySelector('.ac-video');
  triggers.forEach(button => button.addEventListener('click', () => {
    const project = projects[button.dataset.awardCase];
    if (!project || modal.open) return;
    opener = button;
    modal.dataset.tier = project.tier;
    modal.querySelector('[data-ac-award]').textContent = project.award;
    modal.querySelector('h2').textContent = project.title;
    modal.querySelector('.ac-description').replaceChildren(...project.paragraphs.map(text => {
      const p = document.createElement('p'); p.textContent = text; return p;
    }));
    modal.querySelector('.ac-role-description').textContent = project.role;
    modal.querySelector('.ac-role-tags').replaceChildren(...project.responsibilities.map(text => {
      const tag = document.createElement('li'); tag.textContent = text; return tag;
    }));
    const chips = ['AI Short-form · Team Project', project.award, '2인 팀 프로젝트'];
    modal.querySelector('.ac-chips').replaceChildren(...chips.map(text => {
      const chip = document.createElement('span'); chip.textContent = text;
      if (text === project.award) { chip.className = 'ac-award-chip'; chip.insertAdjacentHTML('afterbegin', crown); }
      return chip;
    }));
    modal.querySelector('.ac-youtube').href = 'https://www.youtube.com/shorts/' + project.video;
    video.title = project.title.replace('\n', ' ');
    video.src = 'https://www.youtube-nocookie.com/embed/' + project.video + '?controls=1&playsinline=1&rel=0';
    document.querySelectorAll('.folder-card video').forEach(v => v.pause());
    overflow = document.body.style.overflow;
    hadModalClass = document.body.classList.contains('modal-open');
    document.body.style.overflow = 'hidden'; document.body.classList.add('modal-open');
    modal.showModal(); modal.scrollTop = 0;
    cursors = ['cursorTrailCanvas','customCursor'].flatMap(id => {
      const element = document.getElementById(id); if (!element) return [];
      const marker = document.createComment('cursor return'); element.before(marker); modal.append(element); return [{element,marker}];
    });
  }));
  modal.querySelector('.ac-close').addEventListener('click', () => modal.close());
  function outside(e) { const r = modal.getBoundingClientRect(); return e.target === modal && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom); }
  let pressedOutside = false;
  modal.addEventListener('pointerdown', e => { pressedOutside = outside(e); });
  modal.addEventListener('click', e => { if (pressedOutside && outside(e)) modal.close(); pressedOutside = false; });
  modal.addEventListener('close', () => {
    video.src = 'about:blank'; document.body.style.overflow = overflow;
    if (!hadModalClass) document.body.classList.remove('modal-open');
    cursors.forEach(({element,marker}) => marker.replaceWith(element)); cursors = [];
    opener?.focus({preventScroll:true});
  });
})();
