/* script.js
 * 사이트 공통 기능입니다. 아래 시작 목록에서 필요한 setup 함수를 실행합니다.
 * 수정할 위치 안내: 코드-읽는-순서.md
 */
document.addEventListener("DOMContentLoaded", function () {
  setupEmailCopy();
  setupCustomCursor();
  setupScrollCue();
  setupAboutModal();
  setupProjectFilters();
  setupProjectPreviewVideos();
  setupProjectVideoModal();
  setupDetailPageModal();
  setupDetailScrollPreview();
  setupProjectDetail();
});

// 이메일 버튼을 누르면 주소를 복사하고 완료 문구를 잠깐 보여줍니다.

function setupEmailCopy() {
  const buttons = document.querySelectorAll("[data-copy-email]");
  if (!buttons.length) return;

  const toast = document.createElement("div");
  toast.className = "email-copy-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.setAttribute("aria-atomic", "true");
  document.body.appendChild(toast);
  let hideTimer;

  function showToast(message) {
    clearTimeout(hideTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    hideTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
      toast.textContent = "";
    }, 2000);
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", async function (event) {
      event.preventDefault();
      try {
        await navigator.clipboard.writeText(button.dataset.copyEmail);
        showToast("이메일이 복사되었습니다.");
      } catch (error) {
        showToast("이메일 복사에 실패했습니다. 다시 시도해주세요.");
      }
    });
    button.addEventListener("keydown", function (event) {
      if (event.key === " ") {
        event.preventDefault();
        button.click();
      }
    });
  });
}

// 커스텀 커서와 잔상을 준비하고 ON/OFF 및 위치 이동을 연결합니다.

function setupCustomCursor() {
  const cursor = document.getElementById("customCursor");
  const canvas = document.getElementById("cursorTrailCanvas");
  if (!cursor || !canvas || document.getElementById("cursorEffectControl")) return;

  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
  if (isTouchDevice) {
    cursor.style.display = "none";
    canvas.style.display = "none";
    return;
  }

  cursor.style.pointerEvents = "none";
  canvas.style.pointerEvents = "none";

  const context = canvas.getContext("2d");
  if (!context) return;

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let previousX = pointerX;
  let previousY = pointerY;
  let hasMoved = false;

  const points = [];
  const TRAIL_LIFETIME = 420;
  const MAX_TRAIL_LENGTH = 220;
  const SAMPLE_GAP = 10;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  let events = null;
  let frame = null;
  function start() {
    if (events) return;
    events = new AbortController();
    cursor.style.display = "";
    canvas.style.display = "";
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { signal: events.signal });

    window.addEventListener(
      "pointermove",
      function (event) {
        if (!hasMoved) {
          document.body.classList.add("has-custom-cursor");
          hasMoved = true;
        }

        pointerX = event.clientX;
        pointerY = event.clientY;

        cursor.style.left = pointerX + "px";
        cursor.style.top = pointerY + "px";

        const distance = Math.hypot(pointerX - previousX, pointerY - previousY);
        const steps = Math.max(1, Math.ceil(distance / SAMPLE_GAP));
        const now = performance.now();

        for (let step = 1; step <= steps; step += 1) {
          const progress = step / steps;
          points.unshift({
            x: previousX + (pointerX - previousX) * progress,
            y: previousY + (pointerY - previousY) * progress,
            timestamp: now,
          });
        }

        let accumulatedLength = 0;
        for (let index = 1; index < points.length; index += 1) {
          accumulatedLength += Math.hypot(
            points[index - 1].x - points[index].x,
            points[index - 1].y - points[index].y,
          );
          if (accumulatedLength > MAX_TRAIL_LENGTH) {
            points.length = index;
            break;
          }
        }

        previousX = pointerX;
        previousY = pointerY;
      },
      { signal: events.signal },
    );

    document.addEventListener(
      "pointerover",
      function (event) {
        const element = event.target.closest(
          "a, button, [role='button'], .browser-tab, input, select",
        );
        cursor.classList.toggle("is-hovering", Boolean(element));
      },
      { signal: events.signal },
    );
    animateTrail();
  }

  function animateTrail() {
    const now = performance.now();
    const cutoff = now - TRAIL_LIFETIME;

    while (points.length > 0 && points[points.length - 1].timestamp < cutoff) {
      points.pop();
    }

    if (points.length === 0 || points[0].x !== pointerX || points[0].y !== pointerY) {
      points.unshift({ x: pointerX, y: pointerY, timestamp: now });
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    const palette = ["#f7e6a6", "#f7cdb6", "#efc7df", "#cbbcf0", "#add1f8", "#b6e6de"];

    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      const progress = index / Math.max(1, points.length - 1);
      const ageFade = Math.max(0, 1 - (now - point.timestamp) / TRAIL_LIFETIME);
      const trailFade = Math.pow(1 - progress, 1.35);
      const colorIndex = Math.min(
        palette.length - 1,
        Math.floor(progress * (palette.length - 1)),
      );
      const radius = 6 + 22 * Math.pow(progress, 1.05);

      context.beginPath();
      context.globalAlpha = ageFade * trailFade * 0.36;
      context.fillStyle = palette[colorIndex];
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = 1;
    frame = requestAnimationFrame(animateTrail);
  }

  function stop() {
    if (events) events.abort();
    events = null;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    points.length = 0;
    hasMoved = false;
    previousX = pointerX;
    previousY = pointerY;
    context.clearRect(0, 0, canvas.width, canvas.height);
    document.body.classList.remove("has-custom-cursor");
    cursor.classList.remove("is-hovering");
    cursor.style.display = "none";
    canvas.style.display = "none";
  }
  const control = document.createElement("div");
  control.id = "cursorEffectControl";
  control.innerHTML =
    '<div class="cursor-effect-label"><span aria-hidden="true">✨</span> Cursor Effect</div><button type="button" role="switch" aria-label="Cursor Effect"><span>OFF</span><span class="cursor-effect-track"><span></span></span><span>ON</span></button>';
  const help = document.createElement("p");
  help.className = "cursor-effect-help";
  help.textContent = "마우스 효과를 켜거나 끌 수 있습니다.";
  control.appendChild(help);
  document.body.appendChild(control);
  const dragHandle = control.querySelector(".cursor-effect-label");
  dragHandle.tabIndex = 0;
  dragHandle.setAttribute(
    "aria-label",
    "마우스 설정 창 이동. 방향키 또는 드래그로 이동할 수 있습니다.",
  );
  dragHandle.title = "드래그하여 이동";
  let controlDrag = null;
  function positionControl(left, top) {
    const bounds = control.getBoundingClientRect();
    const x = Math.max(0, Math.min(left, window.innerWidth - bounds.width));
    const y = Math.max(0, Math.min(top, window.innerHeight - bounds.height));
    Object.assign(control.style, {
      left: x + "px",
      top: y + "px",
      right: "auto",
      bottom: "auto",
    });
  }
  // 현재 방문 중에는 위치를 유지하고, 새 방문은 오른쪽 상단에서 시작합니다.
  function saveControlPosition() {
    const bounds = control.getBoundingClientRect();
    try {
      sessionStorage.setItem(
        "cursorEffectPosition",
        JSON.stringify({ x: bounds.left, y: bounds.top }),
      );
    } catch (_) {}
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem("cursorEffectPosition"));
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y))
      positionControl(saved.x, saved.y);
  } catch (_) {}
  dragHandle.addEventListener("pointerdown", function (event) {
    if (!event.isPrimary || event.button !== 0) return;
    const bounds = control.getBoundingClientRect();
    controlDrag = {
      id: event.pointerId,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
    dragHandle.setPointerCapture(event.pointerId);
    control.classList.add("is-dragging");
    event.preventDefault();
  });
  dragHandle.addEventListener("pointermove", function (event) {
    if (!controlDrag || controlDrag.id !== event.pointerId) return;
    positionControl(event.clientX - controlDrag.x, event.clientY - controlDrag.y);
  });
  function finishControlDrag() {
    if (!controlDrag) return;
    const id = controlDrag.id;
    controlDrag = null;
    control.classList.remove("is-dragging");
    if (dragHandle.hasPointerCapture(id)) dragHandle.releasePointerCapture(id);
    saveControlPosition();
  }
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    dragHandle.addEventListener(event, finishControlDrag);
  dragHandle.addEventListener("keydown", function (event) {
    const direction = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[event.key];
    if (!direction) return;
    event.preventDefault();
    const bounds = control.getBoundingClientRect();
    const step = event.shiftKey ? 30 : 10;
    positionControl(bounds.left + direction[0] * step, bounds.top + direction[1] * step);
    saveControlPosition();
  });
  window.addEventListener("resize", function () {
    if (!control.style.left) return;
    const bounds = control.getBoundingClientRect();
    positionControl(bounds.left, bounds.top);
  });
  const toggle = control.querySelector("button");
  let enabled = true;
  try {
    enabled = sessionStorage.getItem("cursorEffect") !== "off";
  } catch (_) {}
  function apply() {
    toggle.setAttribute("aria-checked", String(enabled));
    if (enabled) start();
    else stop();
  }
  toggle.addEventListener("click", function () {
    enabled = !enabled;
    try {
      sessionStorage.setItem("cursorEffect", enabled ? "on" : "off");
    } catch (_) {}
    apply();
  });
  apply();
}

// 페이지가 더 아래로 이어지는지 확인하고 스크롤 안내를 표시합니다.

function setupScrollCue() {
  const scrollCue = document.getElementById("scrollCue");
  if (!scrollCue) return;

  function updateScrollCue() {
    const doc = document.documentElement;
    if (document.body.dataset.page === "about") {
      const viewport = window.visualViewport;
      const visibleBottom = viewport
        ? viewport.pageTop + viewport.height
        : window.scrollY + window.innerHeight;
      scrollCue.hidden = doc.scrollHeight - visibleBottom <= 24;
      return;
    }
    const canScroll = doc.scrollHeight > window.innerHeight + 100;
    const nearTop = window.scrollY < 120;
    const notNearBottom = window.innerHeight + window.scrollY < doc.scrollHeight - 100;

    scrollCue.hidden = !(canScroll && nearTop && notNearBottom);
  }

  scrollCue.addEventListener("click", function () {
    window.scrollBy({
      top: Math.round(window.innerHeight * 0.78),
      behavior: "smooth",
    });
  });

  updateScrollCue();
  window.addEventListener("scroll", updateScrollCue, { passive: true });
  window.addEventListener("resize", updateScrollCue);
  window.addEventListener("load", updateScrollCue, { once: true });
  window.visualViewport?.addEventListener("resize", updateScrollCue);
  if (document.body.dataset.page === "about") {
    new ResizeObserver(updateScrollCue).observe(document.querySelector(".about-page"));
    document.fonts?.ready.then(updateScrollCue);
  }
}

// About 수상작 모달을 열고 닫습니다.

function setupAboutModal() {
  const modal = document.getElementById("shortsModal");
  if (!modal) return;

  const openButtons = document.querySelectorAll('[data-modal-open="shortsModal"]');

  const closeButton = modal.querySelector("[data-modal-close]");
  const videoIframe = modal.querySelector(".iphone-video-iframe");

  const videoUrl =
    "https://www.youtube.com/embed/vJjWN50Z5XM?autoplay=1&playsinline=1&controls=1&rel=0";

  function openModal(e) {
    if (e) e.preventDefault();

    // 모달을 열 때 영상 주소를 다시 넣어서
    // 처음부터 자동 재생
    if (videoIframe) {
      videoIframe.src = videoUrl;
    }

    modal.hidden = false;
    modal.style.display = "grid";
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    // 빈 페이지로 전환해서
    // 영상과 소리를 완전히 정지
    if (videoIframe) {
      videoIframe.src = "about:blank";
    }

    modal.hidden = true;
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
  }

  openButtons.forEach(function (button) {
    button.addEventListener("click", openModal);
  });

  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
}

// 카테고리에 맞는 프로젝트만 보여줍니다. 모바일에서는 폴더 화면도 전환합니다.

function setupProjectFilters() {
  const grid = document.getElementById("projectGrid");
  if (!grid) return;

  const filterButtons = document.querySelectorAll("[data-filter]");
  const cards = grid.querySelectorAll(".folder-card[data-category]");
  const workPage = document.querySelector(".work-page");

  let explorerHeader = document.querySelector(".mobile-explorer-header");
  let explorerEmpty = document.querySelector(".mobile-explorer-empty");

  if (!explorerHeader && workPage) {
    explorerHeader = document.createElement("div");
    explorerHeader.className = "mobile-explorer-header";
    explorerHeader.innerHTML = `
      <button type="button" class="mobile-explorer-back">
        <span class="mobile-explorer-back-icon">←</span> Back to categories
      </button>
      <div class="mobile-explorer-path">
        <span>PROJECTS</span>
        <span class="mobile-explorer-path-separator">/</span>
        <span class="mobile-explorer-current-path">ALL WORK</span>
      </div>
      <div class="mobile-explorer-title-row">
        <h2 class="mobile-explorer-title">All work</h2>
        <span class="mobile-explorer-count">0 items</span>
      </div>
    `;
    workPage.insertBefore(explorerHeader, grid);

    explorerEmpty = document.createElement("div");
    explorerEmpty.className = "mobile-explorer-empty";
    explorerEmpty.textContent = "아직 등록된 프로젝트가 없습니다.";
    workPage.insertBefore(explorerEmpty, grid.nextSibling);

    const backBtn = explorerHeader.querySelector(".mobile-explorer-back");
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        closeMobileExplorer();
      });
    }
  }

  function closeMobileExplorer() {
    if (workPage) workPage.classList.remove("mobile-explorer-folder-open");
    grid.classList.remove("mobile-folder-open");
    grid.classList.add("mobile-folder-closed");
    if (explorerEmpty) explorerEmpty.hidden = true;
  }

  function openMobileExplorer(filter, labelText) {
    if (!workPage) return;
    workPage.classList.add("mobile-explorer-folder-open");
    grid.classList.remove("mobile-folder-closed");
    grid.classList.add("mobile-folder-open");

    const currentPath = explorerHeader.querySelector(".mobile-explorer-current-path");
    const title = explorerHeader.querySelector(".mobile-explorer-title");
    const count = explorerHeader.querySelector(".mobile-explorer-count");

    if (currentPath) currentPath.textContent = labelText.toUpperCase();
    if (title) title.textContent = labelText;

    let visibleCount = 0;
    cards.forEach(function (card) {
      if (!card.classList.contains("is-filter-hidden")) visibleCount += 1;
    });

    if (count)
      count.textContent = visibleCount + (visibleCount <= 1 ? " item" : " items");
    grid.classList.toggle("is-empty", visibleCount === 0);
    if (explorerEmpty) {
      explorerEmpty.hidden = visibleCount !== 0;
      explorerEmpty.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const filter = button.dataset.filter || "all";
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const labelText = button.querySelector("strong")
        ? button.querySelector("strong").textContent.trim()
        : button.textContent.trim();

      filterButtons.forEach(function (item) {
        item.classList.toggle("selected", item.dataset.filter === filter);
      });

      cards.forEach(function (card) {
        const categories = (card.dataset.category || "").split(" ").filter(Boolean);
        const shouldShow = filter === "all" || categories.includes(filter);
        card.classList.toggle("is-filter-hidden", !shouldShow);
      });

      if (isMobile) {
        openMobileExplorer(filter, labelText);
      }
    });
  });
  const mobileProjects = window.matchMedia("(max-width: 767px)");
  if (mobileProjects.matches) closeMobileExplorer();
  mobileProjects.addEventListener("change", function () {
    closeMobileExplorer();
    if (!mobileProjects.matches) {
      cards.forEach((card) => card.classList.remove("is-filter-hidden"));
      filterButtons.forEach((button) =>
        button.classList.toggle("selected", button.dataset.filter === "all"),
      );
    }
  });
}

// PC에서 카드 위에 마우스를 올리면 영상을 재생합니다.

function setupProjectPreviewVideos() {
  document.querySelectorAll(".folder-card").forEach(function (card) {
    const videos = card.querySelectorAll("video");
    if (!videos.length || card.dataset.previewBound === "true") return;
    card.dataset.previewBound = "true";
    let hovering = false;
    function stop() {
      hovering = false;
      videos.forEach(function (video) {
        video.pause();
        if (video.readyState >= 1 && video.currentTime !== 0) video.currentTime = 0;
      });
    }
    videos.forEach(function (video) {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.removeAttribute("autoplay");
      video.pause();
    });
    card.addEventListener("mouseenter", function () {
      if (!window.matchMedia("(hover: hover)").matches || hovering) return;
      hovering = true;
      videos.forEach(function (video) {
        if (video.dataset.previewSrc && !video.getAttribute("src"))
          video.src = video.dataset.previewSrc;
        const playing = video.play();
        if (playing)
          playing
            .then(function () {
              if (!hovering) {
                video.pause();
                if (video.readyState >= 1) video.currentTime = 0;
              }
            })
            .catch(function () {});
      });
    });
    card.addEventListener("mouseleave", stop);
    card.addEventListener("click", stop);
  });
}

// 영상 프로젝트의 제목과 영상을 모달에 넣고 열기·닫기를 연결합니다.

function setupProjectVideoModal() {
  const modal = document.getElementById("projectVideoModal");
  if (!modal) return;

  const panel = document.getElementById("projectVideoModalPanel");
  const closeButton = document.getElementById("projectModalClose");
  const landscapeView = document.getElementById("landscapeModalView");
  const portraitView = document.getElementById("portraitModalView");
  const landscapeVideo = document.getElementById("landscapeModalVideo");
  const portraitIframe = document.getElementById("portraitModalIframe");
  const openButtons = document.querySelectorAll("[data-video-open]");

  const hunminIframe = document.getElementById("hunminModalIframe");
  const shortFormStories = {
    "03": {
      title: "2026 화장품 안전성 평가 제도\n숏폼 공모전 장려상 수상작",
      description:
        "2026 화장품 안전성 평가 제도를 쉽고 친근하게 전달하기 위해 제작한 AI 숏폼 영상입니다.\n\n공모전 주제를 누구나 쉽게 이해할 수 있도록\nAI를 활용한 이미지 제작부터 영상 편집,\n배경음악, 나레이션까지 직접 제작했습니다.\n\n짧은 시간 안에 핵심 메시지를 효과적으로 전달하는\n스토리텔링과 캐릭터 중심의 연출을 구성했습니다.\n\n본 작품은 2인 팀 프로젝트로 제작되었으며,\n'2026 화장품 안전성 평가 제도 숏폼 공모전'에서\n장려상을 수상한 작품입니다.",
      quote:
        "“AI 기술을 활용해 정보를 쉽고 재미있게 전달하는\n숏폼 콘텐츠를 제작했습니다.”",
      status: "Award Winner",
    },
    "04": {
      title: "2026 한글 AI아트 창작 공모전",
      description:
        "한글의 아름다움과 역사적 의미를\nAI 기술을 활용하여 재해석한 숏폼 프로젝트입니다.\n\nAI 이미지 생성부터 영상 제작,\n배경음악, 나레이션까지 직접 제작하여\n하나의 완성도 높은 콘텐츠로 제작했습니다.\n\n본 작품은 2인 팀 프로젝트로 진행되었으며,\n한글 AI 공모전에 출품한 작품입니다.",
      quote: "“AI로 전통을 새롭게 표현하며\n한글의 가치를 영상으로 담아냈습니다.”",
      status: "Contest Entry",
    },
  };
  function stopModalVideos() {
    if (hunminIframe) {
      hunminIframe.src = "about:blank";
      hunminIframe.hidden = true;
    }
    if (landscapeVideo) {
      landscapeVideo.pause();
      landscapeVideo.removeAttribute("src");
      landscapeVideo.load();
    }
    if (portraitIframe) portraitIframe.src = "";
  }

  function closeModal() {
    modal.hidden = true;
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
    stopModalVideos();
  }

  function openModal(button) {
    stopModalVideos();
    const number = button.dataset.projectNumber || "01";
    const isHunmin = number === "02";
    const story = shortFormStories[number];
    const isStory = isHunmin || Boolean(story);
    panel.classList.toggle("is-hunmin", isHunmin);
    panel.classList.toggle("is-project-story", isStory);
    panel.classList.toggle("is-cosmetics", number === "03");
    [
      "hunminQuote",
      "hunminNote",
      "hunminYoutubeLink",
      "hunminDescriptionHeading",
    ].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.hidden = !isStory;
    });
    if (landscapeVideo) landscapeVideo.hidden = isStory;
    const title = button.dataset.projectTitle || "Project";
    const kicker = button.dataset.projectKicker || "VIDEO PROJECT";
    const description = button.dataset.projectDescription || "";
    const orientation = button.dataset.projectOrientation || "landscape";
    const videoSource = button.dataset.projectVideo || "";
    const youtubeId = button.dataset.youtubeId || "";
    const meta = button.dataset.projectMeta || "";

    const kickerEl = document.getElementById("projectModalKicker");
    const titleEl = document.getElementById("projectModalTitle");
    const descEl = document.getElementById("projectModalDescription");
    const numEl = document.getElementById("projectModalNumber");

    if (kickerEl) kickerEl.textContent = kicker;
    if (titleEl)
      titleEl.textContent = story
        ? story.title
        : isHunmin
          ? "훈민정음 창제 :\n세종의 비밀 프로젝트, 글자 전쟁"
          : title;
    if (descEl) descEl.textContent = story ? story.description : description;
    if (numEl) numEl.textContent = "PROJECT " + number;
    const quoteEl = document.getElementById("hunminQuote");
    const noteEl = document.getElementById("hunminNote");
    const youtubeLink = document.getElementById("hunminYoutubeLink");
    if (quoteEl)
      quoteEl.textContent = story
        ? story.quote
        : "“말할 수 있는 사람에게,\n자신의 뜻을 기록할 가능성을 건넨 설계였다.”";
    if (noteEl)
      noteEl.textContent = story
        ? "AI 이미지 생성, AI 영상 제작, AI 음악, AI 나레이션을 활용하여\n완성한 팀 프로젝트입니다."
        : "한글의 탄생을 현대적인 영상 언어로 재해석한 프로젝트.";
    if (youtubeLink)
      youtubeLink.href =
        "https://www.youtube.com/watch?v=" + (isHunmin ? "uudhaBaXUUs" : youtubeId);
    const genreChip = document.getElementById("projectModalGenreChip");
    if (genreChip) genreChip.textContent = story ? "AI Project" : "Video Project";
    panel.querySelectorAll("[data-story-chip]").forEach(function (chip) {
      chip.remove();
    });
    if (story) {
      ["Team Project (2 People)", story.status].forEach(function (label) {
        const chip = document.createElement("span");
        chip.className = "shorts-info-chip";
        chip.dataset.storyChip = "true";
        chip.textContent = label;
        panel.querySelector(".project-modal-chip-row").appendChild(chip);
      });
    }

    const ratioChip = document.getElementById("projectModalRatioChip");
    const typeChip = document.getElementById("projectModalTypeChip");

    if (orientation === "portrait") {
      panel.classList.remove("is-landscape-video");
      if (landscapeView) {
        landscapeView.hidden = true;
        landscapeView.style.display = "none";
      }
      if (portraitView) {
        portraitView.hidden = false;
        portraitView.style.display = "flex";
      }

      if (ratioChip) ratioChip.textContent = "9:16 Vertical";
      if (typeChip) typeChip.textContent = "Short-form";

      if (portraitIframe) {
        portraitIframe.src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&controls=1&rel=0&playsinline=1`;
      }

      const cap = document.getElementById("portraitModalCaption");
      const met = document.getElementById("portraitModalMeta");
      if (cap) cap.textContent = title;
      if (met) met.textContent = number + " / 04";
    } else {
      panel.classList.add("is-landscape-video");
      if (landscapeView) {
        landscapeView.hidden = false;
        landscapeView.style.display = "flex";
      }
      if (portraitView) {
        portraitView.hidden = true;
        portraitView.style.display = "none";
      }

      if (ratioChip) ratioChip.textContent = story ? "9:16 Vertical" : "16:9 Landscape";
      if (typeChip) typeChip.textContent = story ? "Short-form" : "Long-form";

      if (isStory && hunminIframe) {
        hunminIframe.hidden = false;
        hunminIframe.src =
          "https://www.youtube-nocookie.com/embed/" +
          (isHunmin ? "uudhaBaXUUs" : youtubeId) +
          "?autoplay=1&mute=1&controls=1&playsinline=1&rel=0&start=0";
      } else if (landscapeVideo) {
        landscapeVideo.src = videoSource;
        landscapeVideo.load();
        landscapeVideo.play().catch(function () {});
      }

      const lNum = document.getElementById("landscapeModalNumber");
      const lTitle = document.getElementById("landscapeModalTitle");
      const lMeta = document.getElementById("landscapeModalMeta");
      if (lNum) lNum.textContent = number;
      if (lTitle) lTitle.textContent = title;
      if (lMeta) lMeta.textContent = meta;
    }

    modal.hidden = false;
    modal.style.display = "grid";
    document.body.classList.add("modal-open");
  }

  openButtons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      openModal(button);
    });
  });

  if (closeButton) closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
}

// Use the same natural layout and uniform fit for project overviews 05–12.
// PC 모달이 화면을 넘지 않도록 크기를 맞춥니다. 모바일은 CSS가 크기를 담당합니다.
function fitProjectOverview(element) {
  if (window.matchMedia("(max-width: 767px)").matches) {
    [
      "zoom",
      "height",
      "width",
      "transform",
      "transform-origin",
      "position",
      "inset",
      "margin",
    ].forEach((property) => element.style.removeProperty(property));
    return;
  }
  const viewport = window.visualViewport;
  const availableWidth = Math.max(1, (viewport?.width || window.innerWidth) - 48);
  const availableHeight = Math.max(1, (viewport?.height || window.innerHeight) - 48);
  element.style.zoom = "1";
  if (element.matches("dialog[data-goodnotes-modal]")) element.style.transform = "none";
  element.style.height = "auto";
  element.style.width = Math.min(1380, Math.max(1100, availableWidth)) + "px";
  const styles = getComputedStyle(element);
  const content = element.querySelector(".planner-layout");
  const contentHeight = content
    ? content.offsetHeight
    : Math.max(
        element.querySelector(".detail-page-modal-copy")?.offsetHeight || 0,
        element.querySelector(".project-laptop-wrap")?.offsetHeight || 0,
      );
  const height = Math.ceil(
    Math.max(
      element.offsetHeight,
      contentHeight +
        parseFloat(styles.paddingTop) +
        parseFloat(styles.paddingBottom) +
        parseFloat(styles.borderTopWidth) +
        parseFloat(styles.borderBottomWidth),
    ),
  );
  element.style.height = height + "px";
  const scale = Math.min(
    1,
    availableWidth / element.offsetWidth,
    availableHeight / height,
  );
  if (element.matches("dialog[data-goodnotes-modal]")) {
    // Keep native dialog controls in unzoomed coordinates. Transform scales
    // rendering and hit-testing together without scaling the cursor layer.
    element.style.position = "fixed";
    element.style.inset = "50% auto auto 50%";
    element.style.margin = "0";
    element.style.transform = `translate(-50%, -50%) scale(${scale})`;
    element.style.transformOrigin = "center";
  } else {
    element.style.zoom = String(scale);
  }
}

// PROJECT 05~08의 상품 정보와 긴 상세페이지 이미지를 바꿔 넣습니다.

function setupDetailPageModal() {
  const modal = document.getElementById("detailPageModal");
  if (!modal) return;

  const closeButton = document.getElementById("detailPageModalClose");
  const openButtons = document.querySelectorAll("[data-detail-open]");

  const modalTitle = document.getElementById("detailPageModalTitle");
  const modalKicker = document.getElementById("detailPageModalKicker");
  const modalDescription = document.getElementById("detailPageModalDescription");
  const modalNumber = document.getElementById("detailPageModalNumber");
  const modalMainImage = document.getElementById("detailPageModalImage");

  const productTitle = document.getElementById("detailProductTitle");
  const productPrice = document.getElementById("detailProductPrice");
  const productBreadcrumb = document.getElementById("detailProductBreadcrumb");
  const productMainImage = document.getElementById("detailProductMainImage");

  const thumbBtn1 = document.getElementById("detailThumbBtn1");
  const thumbBtn2 = document.getElementById("detailThumbBtn2");
  const productThumb1 = document.getElementById("detailProductThumb1");
  const productThumb2 = document.getElementById("detailProductThumb2");

  const footerTitle = document.getElementById("detailLaptopFooterTitle");
  const footerMeta = document.getElementById("detailLaptopFooterMeta");
  const scrollArea = modal.querySelector(".detail-page-scroll-area");
  const panel = modal.querySelector(".detail-page-modal");
  const scrollGuide = modal.querySelector(".detail-scroll-guide");
  let guideShowTimer = 0;
  let guideHideTimer = 0;
  let guideDismissed = true;

  function stopScrollGuide() {
    clearTimeout(guideShowTimer);
    clearTimeout(guideHideTimer);
    guideDismissed = true;
    if (scrollGuide) {
      scrollGuide.hidden = true;
      scrollGuide.classList.remove("is-playing");
    }
  }

  function dismissScrollGuide() {
    if (guideDismissed || !scrollGuide) return;
    guideDismissed = true;
    clearTimeout(guideShowTimer);
    scrollGuide.classList.remove("is-playing");
    guideHideTimer = window.setTimeout(() => {
      scrollGuide.hidden = true;
    }, 380);
  }

  function playScrollGuide() {
    stopScrollGuide();
    if (!scrollGuide || !scrollArea) return;
    guideDismissed = false;
    scrollGuide.hidden = false;
    guideShowTimer = window.setTimeout(() => {
      if (guideDismissed || modal.hidden) return;
      scrollGuide.classList.add("is-playing");
    }, 800);
  }
  // Fit the complete overview without clipping or adding a second scroll area.
  function fitDetailModal() {
    if (modal.hidden || !panel) return;
    fitProjectOverview(panel);
  }
  window.addEventListener("resize", fitDetailModal);
  window.visualViewport?.addEventListener("resize", fitDetailModal);
  modalMainImage?.addEventListener("load", fitDetailModal);
  if (document.fonts) {
    document.fonts.ready.then(fitDetailModal);
    document.fonts.addEventListener("loadingdone", fitDetailModal);
  }

  const laptopScreen = modal.querySelector(".project-laptop-screen");
  if (laptopScreen)
    laptopScreen.addEventListener("wheel", dismissScrollGuide, { passive: true });
  if (scrollArea) {
    scrollArea.addEventListener("touchmove", dismissScrollGuide, { passive: true });
    scrollArea.addEventListener(
      "scroll",
      () => {
        if (scrollArea.scrollTop > 0) dismissScrollGuide();
      },
      { passive: true },
    );
  }
  modal.addEventListener("keydown", (event) => {
    if (
      ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(
        event.key,
      )
    )
      dismissScrollGuide();
  });
  function closeModal() {
    stopScrollGuide();
    modal.hidden = true;
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
  }

  function openModal(btn) {
    const d = btn.dataset;
    const projectNum = d.projectNumber || "05";

    const project = {
      "05": {
        title: "SKINEX PPF\n상세페이지 디자인",
        paragraphs: [
          "실제 판매 중인 자동차 PPF 제품을 위해 제작한 상세페이지 디자인 프로젝트입니다.",
          "쿠팡 상품 페이지 형태를 참고하여 제품의 특징과 장점을 한눈에 전달할 수 있도록 정보 구조와 시각적 흐름을 설계했습니다.",
          "도장면 보호, 내구성, 시공 과정, 제품 구성 등 핵심 정보를 단계별로 정리하여 구매자가 제품을 쉽게 이해하고 신뢰할 수 있도록 디자인했습니다.",
          "자동차 이미지 보정, 아이콘 디자인, 레이아웃 구성, 정보 시각화를 통해 브랜드 아이덴티티를 유지하면서 구매 전환을 고려한 상세페이지를 제작했습니다.",
        ],
        quote:
          "실사용 환경을 고려한 정보 설계와 시각적 구성으로, 구매자가 제품의 가치를 쉽게 이해할 수 있도록 디자인했습니다.",
        note: "카즈온(주) 재직 기간 동안 제작한 실무 자동차 PPF 상세페이지 디자인 프로젝트입니다.",
      },
      "06": {
        title: "휠 데칼 상세페이지",
        paragraphs: [
          "실제 판매용 휠 데칼 제품을 위해 제작한 상세페이지 디자인 프로젝트입니다.",
          "제품의 컬러 변화와 적용 전·후 이미지를 중심으로 소비자가 실제 장착 모습을 쉽게 상상할 수 있도록 정보 흐름을 설계했습니다.",
          "홀로그램 컬러 특징, 적용 예시, 제품 구성, 사용 방법과 인증 정보를 단계적으로 구성하여 제품의 장점을 직관적으로 전달했습니다.",
          "자동차 이미지 보정, 제품 합성, 레이아웃 구성, 정보 시각화를 통해 브랜드 아이덴티티를 유지하면서 구매 전환을 고려한 상세페이지를 제작했습니다.",
        ],
        quote:
          "제품의 컬러감과 실제 적용 이미지를 중심으로, 소비자가 구매 전 제품의 변화를 직관적으로 이해할 수 있도록 디자인했습니다.",
        note: "카즈온(주) 재직 기간 동안 제작한 실무 휠 데칼 상세페이지 디자인 프로젝트입니다.",
      },
      "07": {
        title: "아이트로닉스 에어컨필터 상세페이지",
        paragraphs: [
          "실제 판매용 자동차 에어컨필터 제품을 위해 제작한 상세페이지 디자인 프로젝트입니다.",
          "제품의 성능과 교체 필요성을 쉽게 이해할 수 있도록 정보 구조와 시각적 흐름을 설계했습니다.",
          "미세먼지 차단, 필터 성능, 교체 주기, 제품 특징 등을 단계별로 구성하여 소비자가 제품의 핵심 가치를 직관적으로 확인할 수 있도록 디자인했습니다.",
          "제품 이미지 보정, 인포그래픽 제작, 레이아웃 구성, 정보 시각화를 통해 브랜드 아이덴티티를 유지하면서 구매 전환을 고려한 상세페이지를 제작했습니다.",
        ],
        quote:
          "복잡한 제품 정보를 이해하기 쉬운 시각적 구성으로 정리하여, 제품의 성능과 장점을 효과적으로 전달하도록 디자인했습니다.",
        note: "카즈온(주) 재직 기간 동안 제작한 실무 자동차 에어컨필터 상세페이지 디자인 프로젝트입니다.",
      },
      "08": {
        title: "포레스트 스카이 에어컨필터 상세페이지",
        paragraphs: [
          "실제 판매용 자동차 에어컨필터 제품을 위해 제작한 상세페이지 디자인 프로젝트입니다.",
          "제품의 필터 구조와 성능, 교체 필요성을 소비자가 쉽게 이해할 수 있도록 정보 흐름과 시각적 구성을 설계했습니다.",
          "제품 특징, 필터 성능, 미세먼지 차단 효과, 교체 시기 등을 단계별로 정리하여 구매자가 제품의 장점을 쉽게 이해할 수 있도록 디자인했습니다.",
          "제품 이미지 보정, 레이아웃 구성, 인포그래픽 제작, 정보 시각화를 통해 브랜드 아이덴티티를 유지하면서 구매 전환을 고려한 상세페이지를 제작했습니다.",
        ],
        quote:
          "제품의 핵심 정보를 직관적인 레이아웃과 시각적 흐름으로 구성하여, 구매자가 제품의 가치를 빠르게 이해할 수 있도록 디자인했습니다.",
        note: "카즈온(주) 재직 기간 동안 제작한 실무 자동차 에어컨필터 상세페이지 디자인 프로젝트입니다.",
      },
    }[projectNum];
    panel.classList.add("is-marketing-detail");
    if (modalTitle)
      modalTitle.textContent = project?.title || d.projectTitle || "Detail Page";
    if (modalKicker) modalKicker.textContent = "MARKETING DESIGN PROJECT";
    if (modalNumber) modalNumber.textContent = "PROJECT " + projectNum;
    if (modalDescription) {
      modalDescription.replaceChildren();
      (project?.paragraphs || [d.projectDescription || ""]).forEach((text) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        modalDescription.append(paragraph);
      });
    }
    document.getElementById("detailProjectQuote").textContent = project
      ? "“" + project.quote + "”"
      : "";
    document.getElementById("detailProjectNote").textContent = project?.note || "";

    if (modalMainImage && d.projectImage) modalMainImage.src = d.projectImage;
    if (productTitle) productTitle.textContent = d.productTitle || d.projectTitle || "";
    if (productPrice) productPrice.textContent = d.productPrice || "상세페이지";
    if (productBreadcrumb) {
      productBreadcrumb.innerHTML =
        "쿠팡 홈 &nbsp;›&nbsp; " + (d.productCategory || "자동차용품");
    }

    const mainImgSrc = d.productImage || "images/bugatti-product-main.jpg";
    if (productMainImage) productMainImage.src = mainImgSrc;
    if (productThumb1) productThumb1.src = mainImgSrc;

    if (thumbBtn1) thumbBtn1.classList.add("is-active");

    if (thumbBtn2) {
      if (d.productImageSub) {
        thumbBtn2.style.display = "block";
        if (productThumb2) productThumb2.src = d.productImageSub;
      } else {
        thumbBtn2.style.display = "none";
      }
    }

    if (footerTitle) footerTitle.textContent = d.projectTitle || "";
    if (footerMeta)
      footerMeta.textContent = (d.projectMeta || "") + " · PROJECT " + projectNum;

    modal.hidden = false;
    modal.style.display = "grid";
    panel.scrollTop = 0;
    fitDetailModal();
    if (scrollArea) scrollArea.scrollTop = 0;
    if (panel) panel.scrollTop = 0;
    document.body.classList.add("modal-open");
    playScrollGuide();
  }

  openButtons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      openModal(button);
    });
  });

  if (closeButton) closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
}

// PC 카드의 긴 상세페이지를 마우스 오버 중 천천히 움직입니다.

function setupDetailScrollPreview() {
  const previewBoxes = document.querySelectorAll("[data-detail-preview-scroll]");
  if (previewBoxes.length === 0) return;

  previewBoxes.forEach(function (box) {
    const img = box.querySelector(".detail-scroll-preview-image");
    if (!img) return;

    let animId = null;
    let currentY = 0;

    function startScroll() {
      if (window.matchMedia("(max-width: 767px)").matches) return;

      const boxHeight = box.clientHeight;
      const imgHeight = img.clientHeight;
      const maxScroll = Math.max(0, imgHeight - boxHeight);
      if (maxScroll <= 0) return;

      const duration = 30000;
      const start = performance.now();
      const initialY = currentY;

      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / duration);
        currentY = initialY + (maxScroll - initialY) * progress;
        img.style.transform = "translate3d(0, -" + currentY + "px, 0)";

        if (progress < 1) {
          animId = requestAnimationFrame(step);
        }
      }

      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(step);
    }

    function resetScroll() {
      if (window.matchMedia("(max-width: 767px)").matches) return;
      cancelAnimationFrame(animId);
      currentY = 0;
      img.style.transition = "transform 0.4s ease";
      img.style.transform = "translate3d(0, 0, 0)";
      setTimeout(function () {
        img.style.transition = "";
      }, 400);
    }

    const card = box.closest(".folder-card");
    if (card) {
      card.addEventListener("mouseenter", startScroll);
      card.addEventListener("mouseleave", resetScroll);
      card.addEventListener("focusin", startScroll);
      card.addEventListener("focusout", resetScroll);
    }
  });
}

const PROJECT_ITEMS = [
  {
    slug: "mori",
    number: "01",
    title: "MORI",
    name: "MORI / Digital archive",
    type: "Web site design",
    color: "pink",
  },
  {
    slug: "nova",
    number: "02",
    title: "NOVA",
    name: "NOVA / Brand story",
    type: "Corporate landing page",
    color: "charcoal",
  },
  {
    slug: "reearth",
    number: "03",
    title: "PLAY",
    name: "RE:EARTH",
    type: "Contest submission film",
    color: "red",
  },
  {
    slug: "object",
    number: "04",
    title: "OBJECT",
    name: "OBJECT / Editorial tool",
    type: "Product experience",
    color: "blush",
  },
  {
    slug: "notes",
    number: "05",
    title: "notes",
    name: "notes / Goodnotes study",
    type: "Graphic design",
    color: "peach",
  },
  {
    slug: "mori-film",
    number: "06",
    title: "MORI",
    name: "MORI / Short film",
    type: "Contest film",
    color: "lilac",
  },
];

// 주소에서 프로젝트를 찾아 개별 상세 화면에 표시합니다.

function setupProjectDetail() {
  const visual = document.getElementById("projectVisual");
  if (!visual) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const project =
    PROJECT_ITEMS.find(function (item) {
      return item.slug === slug;
    }) || PROJECT_ITEMS[0];

  const elNumber = document.getElementById("projectNumber");
  const elTitle = document.getElementById("projectTitle");
  const elEyebrow = document.getElementById("projectEyebrow");
  const elName = document.getElementById("projectName");
  const elDesc = document.getElementById("projectDescription");

  if (elNumber) elNumber.textContent = project.number;
  if (elTitle) elTitle.textContent = project.title;
  if (elEyebrow) elEyebrow.textContent = "PROJECT / " + project.number;
  if (elName) elName.textContent = project.name;
  if (elDesc) {
    elDesc.innerHTML =
      project.type +
      ".<br />A considered visual system built to make a clear, memorable impression across every touchpoint.";
  }

  visual.className = "detail-visual project-card " + project.color;
}

// Goodnotes portrait iPad gallery. No changes to existing modal handlers.
document.addEventListener("DOMContentLoaded", function setupPlannerGallery() {
  document
    .querySelectorAll(
      "#plannerModal, #diaryPlannerModal, #studyNotesModal, #lifePlannerModal",
    )
    .forEach(function (modal) {
      const select = modal.querySelector("[data-planner-select]");
      const image = modal.querySelector("[data-planner-image]");
      const status = modal.querySelector("[data-planner-status]");
      const previousButton = modal.querySelector("[data-planner-prev]");
      const nextButton = modal.querySelector("[data-planner-next]");
      // Keep the existing cursor and trail above the native dialog's backdrop.
      const cursorLayers = ["cursorTrailCanvas", "customCursor"]
        .map(function (id) {
          const element = document.getElementById(id);
          if (!element) return null;
          const marker = document.createComment(id + " original position");
          element.before(marker);
          return { element, marker };
        })
        .filter(Boolean);
      let opener = null;
      function fitPlannerModal() {
        if (!modal.open) return;
        const ratio =
          image.naturalWidth && image.naturalHeight
            ? image.naturalWidth / image.naturalHeight
            : 3 / 4;
        modal.style.setProperty(
          "--planner-mobile-width",
          Math.round(
            Math.min(390, Math.max(220, window.innerHeight * 0.48 * ratio + 28)),
          ) + "px",
        );
        fitProjectOverview(modal);
      }
      window.addEventListener("resize", fitPlannerModal);
      window.visualViewport?.addEventListener("resize", fitPlannerModal);
      function syncPlannerPageRatio() {
        const width = image.naturalWidth || Number(image.getAttribute("width"));
        const height = image.naturalHeight || Number(image.getAttribute("height"));
        if (width > 0 && height > 0) {
          modal.style.setProperty("--planner-page-ratio", `${width} / ${height}`);
          modal.style.setProperty(
            "--planner-device-width",
            Math.min(640, Math.round((490 * width) / height) + 32) + "px",
          );
        }
        fitPlannerModal();
      }
      syncPlannerPageRatio();
      image.addEventListener("load", syncPlannerPageRatio);
      if (document.fonts) document.fonts.addEventListener("loadingdone", fitPlannerModal);
      // 굿노트 페이지 선택, 이미지와 페이지 번호를 함께 갱신합니다.
      function showPage(index) {
        const oldIndex = select.selectedIndex;
        const oldSrc = image.getAttribute("src");
        select.selectedIndex = Math.max(0, Math.min(index, select.options.length - 1));
        const option = select.selectedOptions[0];
        const label = option.textContent.split(" · ").slice(1).join(" · ");
        if (
          modal.open &&
          oldSrc !== option.dataset.src &&
          !matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          const stage = image.parentElement;
          stage
            .querySelectorAll("[data-page-transition]")
            .forEach((node) => node.remove());
          const snapshot = image.cloneNode(false);
          snapshot.removeAttribute("id");
          snapshot.removeAttribute("data-planner-image");
          snapshot.setAttribute("data-page-transition", "");
          snapshot.alt = "";
          snapshot.setAttribute("aria-hidden", "true");
          snapshot.style.cssText =
            "position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;z-index:2";
          stage.append(snapshot);
          const direction = select.selectedIndex < oldIndex ? -1 : 1;
          const expected = option.dataset.src;
          image.addEventListener(
            "load",
            function transitionPage() {
              if (image.getAttribute("src") !== expected || !snapshot.isConnected) {
                snapshot.remove();
                return;
              }
              image.animate(
                [
                  { opacity: 0.3, translate: `${direction * 18}px 0` },
                  { opacity: 1, translate: "0 0" },
                ],
                { duration: 320, easing: "ease-out" },
              );
              snapshot
                .animate(
                  [
                    { opacity: 1, translate: "0 0" },
                    { opacity: 0, translate: `${-direction * 18}px 0` },
                  ],
                  { duration: 320, easing: "ease-out" },
                )
                .finished.finally(() => snapshot.remove());
            },
            { once: true },
          );
          setTimeout(() => snapshot.remove(), 2000);
        }
        image.src = option.dataset.src;
        image.alt =
          modal.querySelector("h2").textContent +
          " · " +
          (option.dataset.colorLabel ? option.dataset.colorLabel + " · " : "") +
          label;
        const current = document.createElement("span");
        current.className = "planner-page-current";
        current.textContent = String(select.selectedIndex + 1).padStart(2, "0");
        const divider = document.createElement("span");
        divider.className = "planner-page-divider";
        divider.textContent = " / ";
        const total = document.createElement("span");
        total.className = "planner-page-total";
        total.textContent = String(select.options.length).padStart(2, "0");
        status.replaceChildren(current, divider, total);
        previousButton.disabled = select.selectedIndex === 0;
        nextButton.disabled = select.selectedIndex === select.options.length - 1;
      }
      const colorButtons = Array.from(modal.querySelectorAll("[data-planner-color]"));
      if (colorButtons.length) {
        const allPages = Array.from(select.options);
        const pagesPerColor = allPages.length / colorButtons.length;
        function chooseColor(colorIndex) {
          const pageIndex = Math.max(0, select.selectedIndex);
          const pages = allPages.slice(
            colorIndex * pagesPerColor,
            (colorIndex + 1) * pagesPerColor,
          );
          select.replaceChildren(...pages);
          pages.forEach(function (option, index) {
            option.textContent =
              String(index + 1).padStart(2, "0") + " · " + option.dataset.pageLabel;
          });
          colorButtons.forEach(function (button, index) {
            button.setAttribute("aria-pressed", String(index === colorIndex));
          });
          select.setAttribute(
            "aria-label",
            colorButtons[colorIndex].textContent.trim() + " 페이지 선택",
          );
          showPage(pageIndex);
        }
        allPages.forEach(function (option) {
          option.dataset.pageLabel = option.textContent.split(" · ").slice(2).join(" · ");
          option.dataset.colorLabel = option.textContent.split(" · ")[1];
        });
        colorButtons.forEach(function (button, index) {
          button.addEventListener("click", function () {
            chooseColor(index);
          });
        });
        chooseColor(0);
      }
      document
        .querySelectorAll('[data-planner-open][aria-controls="' + modal.id + '"]')
        .forEach(function (button) {
          button.addEventListener("click", function () {
            opener = button;
            showPage(0);
            modal.showModal();
            fitPlannerModal();
            modal.scrollTop = 0;
            // Native cursor stays accurate inside the scaled top-layer dialog.
            document.body.classList.add("modal-open");
          });
        });
      modal.querySelector(".planner-close").addEventListener("click", function () {
        modal.close();
      });
      modal.addEventListener("click", function (event) {
        if (event.target !== modal) return;
        const bounds = modal.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          modal.close();
      });
      modal.addEventListener("close", function () {
        cursorLayers.forEach(function (layer) {
          layer.marker.after(layer.element);
        });
        document.body.classList.remove("modal-open");
        if (opener) opener.focus();
      });
      select.addEventListener("change", function () {
        showPage(select.selectedIndex);
      });
      modal.querySelector("[data-planner-prev]").addEventListener("click", function () {
        showPage(select.selectedIndex - 1);
      });
      modal.querySelector("[data-planner-next]").addEventListener("click", function () {
        showPage(select.selectedIndex + 1);
      });
      modal.addEventListener("keydown", function (event) {
        if (event.target === select) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          showPage(select.selectedIndex + (event.key === "ArrowRight" ? 1 : -1));
        }
      });
    });
});
