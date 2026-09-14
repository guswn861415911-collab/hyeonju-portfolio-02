/* me-mobile.js
 * 모바일 Me 탭과 도구 목록을 만들고 연락처를 이동합니다. groups 배열에서 도구를 수정합니다.
 * 수정할 위치 안내: 코드-읽는-순서.md
 */
(() => {
  const page = document.querySelector(".contact-page");
  if (!page) return;
  const mobile = matchMedia("(max-width: 767px)");
  const skills = page.querySelector(".contact-skills");
  const contact = page.querySelector(".contact-copy");
  const links = contact.querySelector(".contact-links");
  const keywords = skills.querySelector(".contact-keywords");
  const linksHome = document.createComment("Desktop contacts");
  const keywordsHome = document.createComment("Desktop keywords");
  links.before(linksHome);
  keywords.before(keywordsHome);
  const root = document.createElement("section");
  root.className = "me-mobile";
  root.innerHTML = `<header class="me-mobile-heading"><p class="eyebrow">ME · MY TOOLKIT</p><h1>Skills</h1><p class="me-mobile-intro"></p></header>
    <div class="me-mobile-tabs" role="tablist" aria-label="Me 페이지 내용"><button type="button" id="me-skills-tab" role="tab" aria-controls="me-skills-panel">Skills</button><button type="button" id="me-contact-tab" role="tab" aria-controls="me-contact-panel">Contact</button></div>
    <section id="me-skills-panel" role="tabpanel" aria-labelledby="me-skills-tab"></section>
    <section id="me-contact-panel" role="tabpanel" aria-labelledby="me-contact-tab" hidden><div class="me-welcome"><div><p>LET’S<br>WORK TOGETHER</p><h2>좋은 아이디어는<br>언제든 환영합니다.</h2><span>프로젝트, 협업, 궁금한 점이 있다면<br>편하게 연락 주세요.</span></div><svg viewBox="0 0 120 120" aria-hidden="true"><path d="M12 48 60 14l48 34v56H12Z" fill="#f1c8d0"/><rect x="28" y="29" width="64" height="65" rx="7" fill="#fff"/><path d="M42 47h36M42 58h29M42 69h23" stroke="#9aabc1" stroke-width="3" stroke-linecap="round"/><path d="m12 48 48 36 48-36v56H12Z" fill="#f6d8df"/><path d="M12 104 53 81M108 104 67 81" stroke="#e7bac6" stroke-width="2" stroke-linecap="round"/></svg></div></section>`;
  const skillPanel = root.querySelector("#me-skills-panel");
  const contactPanel = root.querySelector("#me-contact-panel");
  const groups = [
    [
      "Design",
      "디자인 기초와 편집 작업의 시작.",
      "◉",
      [
        ["Photoshop", "01_Adobe_Photoshop.png"],
        ["Illustrator", "02_Adobe_Illustrator.png"],
        ["AutoCAD", "03_AutoCAD.png"],
      ],
    ],
    [
      "Web design",
      "웹 퍼블리싱과 프론트엔드 구현.",
      "‹/›",
      [
        ["HTML", null, "5"],
        ["CSS", null, "3"],
        ["JavaScript", null, "JS"],
      ],
    ],
    [
      "Video & Motion",
      "영상 제작과 편집, 간단한 숏폼 제작.",
      "▷",
      [
        ["Premiere Pro", "15_Premiere_Pro.png"],
        ["After Effects", "16_After_Effects.png"],
        ["CapCut", "04_CapCut.png"],
      ],
    ],
    [
      "AI / Creative Tools",
      "업무 효율을 높이는 AI 및 크리에이티브 도구.",
      "✧",
      [
        ["ChatGPT", "07_ChatGPT.png"],
        ["Gemini", "06_Gemini.png"],
        ["NotebookLM", "11_NotebookLM.png"],
        ["Gamma", "12_Gamma.png"],
        ["Canva", "13_Canva.png"],
        ["Figma", "14_Figma.png"],
        ["Notion", null, "N"],
        ["기타 AI Tool", null, "+"],
      ],
    ],
  ];
  groups.forEach(([title, description, icon, tools], i) => {
    const card = document.createElement("article");
    card.className = `me-skill-group me-skill-group-${i}`;
    card.innerHTML = `<header><span class="me-group-icon" aria-hidden="true">${icon}</span><div><h2>${title}</h2><p>${description}</p></div><small>0${i + 1}</small></header><ul class="me-programs ${i === 3 ? "me-programs-four" : ""}">${tools.map(([name, file, letter]) => `<li>${file ? `<img src="images/contact-icons/${file}" alt="" width="40" height="40">` : `<span class="me-program-symbol" data-program="${name}" aria-hidden="true">${letter}</span>`}<span>${name}</span></li>`).join("")}</ul>`;
    skillPanel.append(card);
  });
  page.append(root);
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  let selected = 0;
  let skillAnimations = [];
  let skillFrame;
  // 모바일 Me에서 현재 선택된 탭의 글자와 아이콘을 순차 등장시킵니다.
  function revealSkills() {
    cancelAnimationFrame(skillFrame);
    skillAnimations.forEach((animation) => animation.cancel());
    skillAnimations = [];
    if (!mobile.matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    skillFrame = requestAnimationFrame(() => {
      const play = (node, delay) => {
        if (!node) return;
        skillAnimations.push(
          node.animate(
            [
              { opacity: 0, translate: "0 -14px" },
              { opacity: 1, translate: "0 0" },
            ],
            {
              duration: 520,
              delay,
              easing: "cubic-bezier(.22,1,.36,1)",
              fill: "backwards",
            },
          ),
        );
      };
      root
        .querySelectorAll(".me-mobile-heading > *")
        .forEach((node, i) => play(node, i * 80));
      if (selected === 1) {
        contactPanel
          .querySelectorAll(".me-welcome > div > *")
          .forEach((node, i) => play(node, 220 + i * 80));
        play(contactPanel.querySelector(".me-welcome svg"), 400);
        links.querySelectorAll("a").forEach((node, i) => play(node, 480 + i * 90));
        return;
      }
      skillPanel.querySelectorAll(".me-skill-group").forEach((group, i) => {
        const start = 220 + i * 170;
        play(group.querySelector(".me-group-icon"), start);
        play(group.querySelector("h2"), start + 35);
        play(group.querySelector("header p"), start + 70);
        play(group.querySelector("header small"), start + 70);
        group
          .querySelectorAll(".me-programs li")
          .forEach((node, j) => play(node, start + 100 + j * 40));
      });
      play(keywords, 950);
    });
  }
  function select(index, focus = false) {
    selected = index;
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    skillPanel.hidden = index !== 0;
    contactPanel.hidden = index !== 1;
    root.dataset.active = index ? "contact" : "skills";
    root.querySelector("h1").textContent = index ? "Contact" : "Skills";
    root.querySelector(".eyebrow").textContent = index
      ? "ME · GET IN TOUCH"
      : "ME · MY TOOLKIT";
    root.querySelector(".me-mobile-intro").textContent = index
      ? "협업 문의와 프로젝트 제안은 아래 연락처 및 링크를 통해 편하게 연락 주세요."
      : "지금까지 익혀온 도구와 프로그램, 그리고 실제 작업에 활용하고 있는 스킬들을 정리했습니다.";
    if (focus) tabs[index].focus();
    revealSkills();
  }
  tabs.forEach((tab, i) => tab.addEventListener("click", () => select(i)));
  root.querySelector('[role="tablist"]').addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    select(event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - selected, true);
  });
  function arrange() {
    if (mobile.matches) {
      skillPanel.append(keywords);
      contactPanel.append(links);
    } else {
      keywordsHome.after(keywords);
      linksHome.after(links);
    }
  }
  mobile.addEventListener("change", arrange);
  mobile.addEventListener("change", revealSkills);
  select(0);
  arrange();
})();
