/* Local-media projects reuse the portfolio's native dialog and device styling. */
(() => {
  const projects = {
    cineliq: {
      title:'CINELIQ — 촬영과 연출을 이해하는 새로운 방법',
      paragraphs:[
        '촬영 기법과 영상 연출에 관심 있는 제작자들이 전문적인 카메라 용어와 다양한 연출 방식을 보다 쉽게 이해할 수 있도록 제작한 웹 서비스입니다.',
        '촬영 구도와 카메라 무빙, 시각적 연출 기법 등을 체계적으로 정리하고, 이미지와 영상 예시를 통해 기법의 특징을 직관적으로 확인할 수 있도록 구성했습니다.',
        '단순히 촬영 용어를 나열하는 것이 아니라 사용자가 원하는 기법을 탐색하고, 비교하고, 개인적으로 정리할 수 있는 경험을 제공하는 데 중점을 두었습니다.',
        '기획과 UI/UX 디자인부터 반응형 웹 구현, 생성형 AI를 활용한 시각 자료 제작까지 하나의 웹 서비스로 연결한 개인 프로젝트입니다.'
      ],
      role:'서비스 기획, 정보 구조 설계, UI/UX 디자인, 반응형 웹 구현, AI 이미지·영상 제작 및 기능 개선',
      tools:'HTML, CSS, JavaScript, AI 기반 코딩 도구 활용',
      features:['촬영 및 영상 연출 기법 라이브러리', '카테고리별 기법 탐색과 검색', '이미지·영상 예시 및 기법 상세 설명', 'PC 및 모바일 반응형 인터페이스'],
      tags:['UI/UX Design','Web Service','Responsive Web','AI Creative'],
      link:'https://cineliq.art/', linkLabel:'Visit CINELIQ'
    },
    'seoul-night': {
      title:'서울 29초영화제',
      paragraphs:[
        '서울의 밤, 도시가 잠든 사이에도 이어지는 사람들의 일상을 담은 29초 AI 단편영화입니다.',
        '밤거리와 야간 근무 장면, 귀갓길을 함께 걷는 인물들을 짧은 장면으로 연결합니다. 누군가의 밤을 지키는 사람들의 모습을 통해 서울의 또 다른 일상을 보여 줍니다.',
        '서울 29초영화제에 출품한 작품입니다.'
      ],
      tags:['AI Short Film','29 Seconds','Contest Entry','AI Video','출품작']
    }
  };
  if (!document.querySelector('[data-media-project]')) return;
  const modal = document.createElement('dialog'); modal.id = 'projectMediaModal';
  modal.setAttribute('aria-labelledby','mediaProjectTitle');
  modal.innerHTML = `<button type="button" class="ac-close" aria-label="프로젝트 모달 닫기">×</button><div class="pm-layout"><div class="pm-copy"><p class="pm-kicker"></p><h2 id="mediaProjectTitle"></h2><div class="pm-description"><h3>작품 설명</h3><div class="pm-paragraphs"></div></div><section class="pm-role"><h3>기여 역할</h3><p></p></section><section class="pm-tools"><h3>기술 및 제작 방식</h3><p></p></section><section class="pm-features"><h3>주요 기능</h3><ul></ul></section><div class="pm-tags"></div><div class="pm-actions"></div></div><div class="pm-media"><div class="pm-device"><video controls playsinline preload="none"></video></div></div></div>`;
  document.body.append(modal);
  const video = modal.querySelector('video');
  let opener, previousOverflow, cursorLayers = [];
  function render(slug) {
    const project = projects[slug], registry = window.portfolioProjects.find(p=>p.slug===slug);
    modal.dataset.projectSlug = slug;
    modal.querySelector('.pm-kicker').textContent = registry.kicker;
    modal.querySelector('h2').textContent = project.title;
    modal.querySelector('.pm-paragraphs').replaceChildren(...project.paragraphs.map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));
    for (const key of ['role','tools']) {const section=modal.querySelector('.pm-'+key);section.hidden=!project[key];section.querySelector('p').textContent=project[key]||'';}
    const features=modal.querySelector('.pm-features'); features.hidden=!project.features;
    features.querySelector('ul').replaceChildren(...(project.features||[]).map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
    modal.querySelector('.pm-tags').replaceChildren(...project.tags.map(text=>{const tag=document.createElement('span');tag.textContent=text;return tag;}));
    const actions=modal.querySelector('.pm-actions'); actions.replaceChildren();actions.hidden=!project.link;
    if(project.link){const a=document.createElement('a');a.href=project.link;a.target='_blank';a.rel='noopener noreferrer';a.textContent=project.linkLabel+' ↗';actions.append(a);}
    video.pause();video.poster=registry.poster;video.src=registry.video;video.setAttribute('aria-label',project.title+' 영상');video.load();
    modal.scrollTop=0;
  }
  modal.renderProject=render;
  document.querySelectorAll('[data-media-project="seoul-night"]').forEach(button=>button.addEventListener('click',()=>{
    if(modal.open)return;
    opener=button;previousOverflow=document.body.style.overflow;
    document.querySelectorAll('video').forEach(v=>v.pause());
    render(button.dataset.mediaProject);document.body.style.overflow='hidden';document.body.classList.add('modal-open');modal.showModal();modal.scrollTop=0;
    cursorLayers = ['cursorTrailCanvas','customCursor'].flatMap(id=>{const element=document.getElementById(id);if(!element)return [];const marker=document.createComment('cursor return');element.before(marker);modal.append(element);return [{element,marker}];});
  }));
  modal.querySelector('.ac-close').addEventListener('click',()=>modal.close());
  modal.addEventListener('close',()=>{cursorLayers.forEach(({element,marker})=>marker.replaceWith(element));cursorLayers=[];video.pause();video.removeAttribute('src');video.load();document.body.style.overflow=previousOverflow;document.body.classList.remove('modal-open');opener?.focus({preventScroll:true});});
  let outside=false;
  const isOutside=e=>{const r=modal.getBoundingClientRect();return e.target===modal&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)};
  modal.addEventListener('pointerdown',e=>outside=isOutside(e));modal.addEventListener('click',e=>{if(outside&&isOutside(e))modal.close();outside=false;});
})();
