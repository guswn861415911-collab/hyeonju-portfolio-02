/* CINELIQ case study: reuse the existing db styles without altering other modals. */
(() => {
  const opener = document.querySelector('[data-media-project="cineliq"]');
  if (!opener) return;
  const sections = ['Problem', 'Solution', 'Key Features', 'UI Preview', 'Design System'];
  const shot = (file, alt) => `<img src="images/cineliq-case/${file}.png" alt="${alt}" loading="lazy" decoding="async">`;
  const heading = (i, title, lead) => `<div class="db-panel-heading"><b>0${i+1}</b><h2>${title}</h2><p>${lead}</p></div>`;
  const modal = document.createElement('dialog');
  modal.id = 'cineliqModal'; modal.className = 'db-modal responsive-project-panel';
  modal.setAttribute('aria-labelledby', 'cineliqTitle');
  modal.innerHTML = `<div class="db-shell">
    <button type="button" class="db-close" aria-label="CINELIQ 모달 닫기">×</button>
    <div class="db-hero">
      <div class="db-hero-copy">
        <span class="db-project-label">INTERACTIVE WEB SERVICE</span>
        <h2 id="cineliqTitle">CINELIQ</h2>
        <h3>촬영의 언어를 이해하는 새로운 방법</h3>
        <p>촬영 구도와 카메라 움직임, 영상 연출 기법을 쉽고 직관적으로 이해할 수 있도록 기획한 웹 라이브러리입니다.</p>
        <p>전문적인 촬영 용어를 이미지 및 영상 예시와 연결하고, 사용자가 원하는 기법을 탐색하고 개인적으로 정리할 수 있도록 구성했습니다.</p>
        <div class="db-tags">${['Camera Techniques','UI/UX Design','AI Creative','Web Service'].map(t=>`<span>${t}</span>`).join('')}</div>
        <div class="db-project-meta">
          <div><b>MY ROLE</b><p class="db-role-value"><strong>Service Planning<br>UI/UX Design<br>Web Design<br>AI Content Production</strong><span class="db-team-label">PERSONAL PROJECT</span></p></div>
          <div><b>PERIOD</b><p>1주일</p></div>
          <div><b>TOOLS</b><p>HTML · CSS · JavaScript<br>ChatGPT · Google Flow<br>CapCut</p></div>
        </div>
      </div>
      <div class="cq-media">
        <div class="cq-devices" aria-label="CINELIQ PC 및 모바일 목업">
          <figure class="cq-laptop" aria-label="CINELIQ 노트북 목업"></figure>
          <figure class="cq-phone" aria-label="CINELIQ 스마트폰 목업">${shot('mobile','CINELIQ 실제 모바일 첫 화면')}</figure>
        </div>
        <footer class="db-footer"><a href="https://cineliq.art/" target="_blank" rel="noopener noreferrer">사이트 방문하기 <span aria-hidden="true">→</span><span class="db-sr"> (새 탭)</span></a></footer>
      </div>
    </div>
    <nav class="db-nav" aria-label="CINELIQ 상세 섹션">
      <div class="db-tabs" role="tablist" aria-label="CINELIQ 소개">${sections.map((s,i)=>`<button type="button" role="tab" id="cq-tab-${i}" aria-controls="cq-panel-${i}" aria-selected="${i===0}" tabindex="${i===0?0:-1}"><span>0${i+1}</span>${s}</button>`).join('')}</div>
      <div class="db-pagination"><span class="db-count" aria-live="polite">1 / 5</span><button type="button" data-cq-step="-1" aria-label="이전 섹션">←</button><button type="button" data-cq-step="1" aria-label="다음 섹션">→</button></div>
    </nav>
    <div class="db-panels">
      <section id="cq-panel-0" role="tabpanel" aria-labelledby="cq-tab-0" class="db-panel db-live-panel" tabindex="0">
        ${heading(0,'Problem','전문적인 촬영 용어와 다양한 연출 기법을<br>누구나 쉽게 이해할 수 없을까?')}
        <div class="cq-prose"><h3>촬영 기법을 이해하는 과정은 왜 어려울까?</h3><p>영상 제작에는 다양한 카메라 구도와 움직임, 연출 기법이 사용됩니다.</p><p>하지만 전문 용어에 익숙하지 않은 제작자는 기법의 차이를 글만으로 이해하기 어렵고, 여러 자료를 찾아 비교해야 하는 불편함이 있습니다.</p><p>CINELIQ는 이러한 과정을 보다 직관적이고 체계적으로 만들기 위해 기획되었습니다.</p></div>
      </section>
      <section id="cq-panel-1" role="tabpanel" aria-labelledby="cq-tab-1" class="db-panel db-live-panel" tabindex="0" hidden>
        ${heading(1,'Solution','복잡한 전문 지식을<br>직관적인 시각 경험으로 연결합니다.')}
        <div class="cq-prose"><h3>촬영 기법을 하나의 라이브러리로.</h3><p>촬영 및 연출 기법을 카테고리별로 분류하고, 각 기법의 특징을 설명과 시각적 예시로 확인할 수 있도록 구성했습니다.</p><p>사용자가 원하는 기법을 쉽게 탐색하고 비교하며, 필요한 정보를 개인적으로 정리할 수 있도록 설계했습니다.</p><ul><li>체계적인 카테고리 구성</li><li>이미지 및 영상 중심 설명</li><li>직관적인 기법 탐색</li><li>개인별 콘텐츠 관리 중심의 설계</li></ul></div>
      </section>
      <section id="cq-panel-2" role="tabpanel" aria-labelledby="cq-tab-2" class="db-panel db-live-panel cq-wide" tabindex="0" hidden>
        ${heading(2,'Key Features','찾고, 이해하고, 장면에 적용하는 경험.')}
        <div class="cq-feature-grid">
          <article>${shot('library','CINELIQ 카메라 기법 라이브러리')}<h3>카메라 기법 라이브러리</h3><p>다양한 촬영 기법을 카드와 시각 자료로 한눈에 살펴봅니다.</p></article>
          <article>${shot('categories','CINELIQ 카테고리 탐색 메뉴')}<h3>카테고리별 탐색</h3><p>구도, 컷, 무빙 등 기법의 종류에 따라 원하는 정보를 찾습니다.</p></article>
          <article>${shot('detail','CINELIQ 기법 상세 설명 화면')}<h3>상세 설명과 시각 자료</h3><p>기법의 특징과 촬영 방법을 이미지·영상 예시로 이해합니다.</p></article>
          <article>${shot('login','CINELIQ 실제 로그인 화면')}<h3>회원 로그인 화면</h3><p>이메일·Google·카카오 로그인과 회원가입으로 연결되는 진입 화면입니다.</p></article>
        </div>
      </section>
      <section id="cq-panel-3" role="tabpanel" aria-labelledby="cq-tab-3" class="db-panel db-live-panel cq-wide" tabindex="0" hidden>
        ${heading(3,'UI Preview','실제 화면으로 살펴보는 CINELIQ.')}
        <div class="cq-gallery">
          <div class="cq-gallery-choices" role="group" aria-label="프리뷰 화면 선택">${[['home','PC 홈'],['library','기법 라이브러리'],['detail','기법 상세'],['mobile','모바일'],['video','프리뷰 영상']].map(([id,name],i)=>`<button type="button" data-cq-shot="${id}" aria-pressed="${i===0}">${name}</button>`).join('')}</div>
          <figure class="cq-gallery-stage">${shot('home','CINELIQ PC 첫 화면')}<video controls playsinline preload="none" poster="images/project-posters/cineliq.jpg" aria-label="CINELIQ 웹사이트 프리뷰 영상" hidden></video><figcaption>PC 홈 화면</figcaption></figure>
        </div>
      </section>
      <section id="cq-panel-4" role="tabpanel" aria-labelledby="cq-tab-4" class="db-panel db-live-panel cq-wide" tabindex="0" hidden>
        ${heading(4,'Design System','콘텐츠에 집중하는 블랙 앤 화이트.')}
        <div class="cq-design-grid">
          <article><h3>Color Palette</h3><p>서비스 화면에 적용된 실제 컬러</p><div class="cq-swatches">${[['#0B0B0B','Background','페이지 배경'],['#151515','Surface','콘텐츠 표면'],['#2A2A2A','Border','경계와 구분선'],['#FFFFFF','Text','주요 텍스트']].map(([c,n,u])=>`<div><i style="background:${c}"></i><b>${c}</b><strong>${n}</strong><span>${u}</span></div>`).join('')}</div></article>
          <article><h3>Typography</h3><div class="cq-type-sample">Aa <span>가나다</span></div><h4>Manrope · Pretendard</h4><p>영문 및 한글 본문과 인터페이스</p><h4>Montserrat</h4><p>CINELIQ 브랜드 로고</p></article>
          <article class="cq-components"><h3>UI Components</h3><p>카테고리 메뉴 · 콘텐츠 카드 · 상세 정보 패널 · 버튼</p>${shot('library','실제 CINELIQ 콘텐츠 카드와 탐색 UI')}${shot('detail','실제 CINELIQ 상세 정보 패널과 버튼')}</article>
        </div>
      </section>
    </div>
  </div>`;
  document.body.append(modal);
  // Reuse the existing laptop/browser markup, leaving LEGO's original nodes untouched.
  const laptop = document.querySelector('#legoModal .lego-device').cloneNode(true);
  const laptopImage = laptop.querySelector('img');
  laptopImage.src = 'images/cineliq-case/home.png'; laptopImage.alt = 'CINELIQ 실제 PC 첫 화면';
  laptopImage.removeAttribute('width'); laptopImage.removeAttribute('height');
  laptop.querySelector('.lego-browser-tab > span').textContent = 'CINELIQ';
  laptop.querySelector('.lego-browser-address > span:nth-child(2)').textContent = 'cineliq.art';
  modal.querySelector('.cq-laptop').replaceChildren(...laptop.childNodes);
  const tabs = [...modal.querySelectorAll('[role="tab"]')];
  const panels = [...modal.querySelectorAll('[role="tabpanel"]')];
  const video = modal.querySelector('video');
  let selected = 0, previousOverflow = '', cursorLayers = [];
  function select(next, focus=false) {
    selected = (next + tabs.length) % tabs.length;
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===selected));tab.tabIndex=i===selected?0:-1;panels[i].hidden=i!==selected;});
    modal.querySelector('.db-count').textContent = `${selected+1} / ${tabs.length}`;
    if (selected !== 3) video.pause();
    if (focus) tabs[selected].focus({preventScroll:true});
    const rail=modal.querySelector('.db-tabs');
    rail.scrollLeft += tabs[selected].getBoundingClientRect().left-rail.getBoundingClientRect().left;
    if (modal.open) modal.scrollTop = modal.querySelector('.db-hero').offsetHeight;
  }
  tabs.forEach((tab,i)=>tab.addEventListener('click',()=>select(i)));
  modal.querySelectorAll('[data-cq-step]').forEach(button=>button.addEventListener('click',()=>select(selected+Number(button.dataset.cqStep))));
  modal.querySelector('.db-nav').addEventListener('keydown',event=>{
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();event.stopPropagation();
    select(event.key==='Home'?0:event.key==='End'?4:selected+(event.key==='ArrowRight'?1:-1),true);
  });
  let touchStart;
  modal.querySelector('.db-panels').addEventListener('touchstart',event=>{
    if(event.target.closest('button,video,a'))return;
    const touch=event.changedTouches[0];touchStart={x:touch.clientX,y:touch.clientY};
  },{passive:true});
  modal.querySelector('.db-panels').addEventListener('touchend',event=>{
    if(!touchStart)return;const t=event.changedTouches[0],dx=t.clientX-touchStart.x,dy=t.clientY-touchStart.y;touchStart=null;
    if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5)select(selected+(dx<0?1:-1));
  },{passive:true});
  const gallery=modal.querySelector('.cq-gallery-stage'),galleryImage=gallery.querySelector('img');
  modal.querySelectorAll('[data-cq-shot]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.cqShot;video.pause();video.hidden=key!=='video';galleryImage.hidden=key==='video';
    gallery.classList.toggle('is-mobile',key==='mobile');
    if(key==='video'){if(!video.getAttribute('src'))video.src='videos/cineliq-preview.mp4';}
    else{galleryImage.src=`images/cineliq-case/${key}.png`;galleryImage.alt=`CINELIQ ${button.textContent} 실제 화면`;}
    gallery.querySelector('figcaption').textContent=button.textContent;
    modal.querySelectorAll('[data-cq-shot]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  }));
  const media=modal.querySelector('.cq-media'),marker=document.createComment('CINELIQ desktop media');media.before(marker);
  const narrow=matchMedia('(max-width:767px)');
  function arrange(){if(narrow.matches)modal.querySelector('#cineliqTitle').after(media);else marker.after(media);}
  narrow.addEventListener('change',arrange);arrange();
  opener.addEventListener('click',()=>{
    if(modal.open)return;
    document.querySelectorAll('video').forEach(v=>v.pause());select(0);
    previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    modal.showModal();modal.scrollTop=0;
    cursorLayers=['cursorTrailCanvas','customCursor'].flatMap(id=>{const element=document.getElementById(id);if(!element)return [];const marker=document.createComment('cursor return');element.before(marker);modal.append(element);return [{element,marker}];});
  });
  modal.querySelector('.db-close').addEventListener('click',()=>modal.close());
  modal.addEventListener('close',()=>{video.pause();video.removeAttribute('src');video.load();cursorLayers.forEach(({element,marker})=>marker.replaceWith(element));cursorLayers=[];document.body.style.overflow=previousOverflow;opener.focus({preventScroll:true});});
  let outside=false;
  const isOutside=e=>{const r=modal.getBoundingClientRect();return e.target===modal&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom);};
  modal.addEventListener('pointerdown',e=>outside=isOutside(e));modal.addEventListener('click',e=>{if(outside&&isOutside(e))modal.close();outside=false;});
})();
