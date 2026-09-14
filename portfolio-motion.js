/* portfolio-motion.js
 * 페이지 진입, 카드 등장, 모달 전환, 전화번호 복사 등 인터랙션을 처리합니다.
 * 수정할 위치 안내: 코드-읽는-순서.md
 */
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const ease = "cubic-bezier(.22,.61,.36,1)";
  function animate(node, frames, duration = 350, delay = 0) {
    if (!node || reduced.matches) return Promise.resolve();
    return node
      .animate(frames, { duration, delay, easing: ease, fill: "backwards" })
      .finished.catch(() => {});
  }
  // 페이지 종류에 따라 등장할 요소와 순서를 정합니다.
  function enterPage() {
    if (
      document.body.dataset.page === "contact" &&
      matchMedia("(min-width: 768px)").matches
    ) {
      const skills = [
        ...document.querySelectorAll(
          ".contact-skills > .eyebrow, .contact-skills > .contact-section-title, .contact-skills-intro, .contact-timeline-item, .contact-skills > .contact-keywords",
        ),
      ];
      const contact = [
        ...document.querySelectorAll(
          ".contact-copy > .eyebrow, .contact-copy > h1, .contact-copy > .about-storyline, .contact-copy .contact-links > a",
        ),
      ];
      const frames = [
        { opacity: 0, translate: "0 -16px" },
        { opacity: 1, translate: "0 0" },
      ];
      skills.forEach((node, i) => animate(node, frames, 550, i * 90));
      const contactStart = Math.max(0, skills.length - 1) * 90 + 350;
      contact.forEach((node, i) => animate(node, frames, 550, contactStart + i * 90));
    } else if (document.body.dataset.page === "home") {
      animate(
        document.querySelector(".site-frame"),
        [{ opacity: 0.6 }, { opacity: 1 }],
        600,
      );
      [
        ".home-redesign-title",
        ".home-redesign-intro",
        ".home-redesign-action-row",
        ".home-redesign-image",
        ".home-redesign-contact-strip",
      ].forEach((selector, i) =>
        animate(
          document.querySelector(selector),
          [
            { opacity: 0, translate: "0 20px" },
            { opacity: 1, translate: "0 0" },
          ],
          700,
          100 + i * 120,
        ),
      );
    } else
      animate(
        document.querySelector(".site-content"),
        [
          { opacity: 0, translate: "0 20px" },
          { opacity: 1, translate: "0 0" },
        ],
        650,
      );
  }
  enterPage();
  // Reveal each visible row progressively without changing wheel behavior.
  if (
    document.body.dataset.page === "work" &&
    !reduced.matches &&
    "IntersectionObserver" in window
  ) {
    const pending = new Set();
    let revealFrame;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          pending.add(entry.target);
          observer.unobserve(entry.target);
        });
        if (!pending.size) return;
        cancelAnimationFrame(revealFrame);
        revealFrame = requestAnimationFrame(() => {
          const cards = [...pending].sort((a, b) => {
            const first = a.getBoundingClientRect(),
              second = b.getBoundingClientRect();
            return Math.abs(first.top - second.top) > 12
              ? first.top - second.top
              : first.left - second.left;
          });
          pending.clear();
          cards.forEach((card, i) => {
            // Animate the visual inside the card, leaving hover transforms independent.
            const visual =
              card.querySelector(".folder-visual, .mobile-category-visual") || card;
            animate(
              visual,
              [
                { opacity: 0, translate: "0 -22px" },
                { opacity: 1, translate: "0 0" },
              ],
              650,
              Math.min(i, 5) * 85,
            );
            const caption = card.querySelector(".folder-card-meta");
            if (caption)
              animate(
                caption,
                [
                  { opacity: 0, translate: "0 -10px" },
                  { opacity: 1, translate: "0 0" },
                ],
                500,
                Math.min(i, 5) * 85 + 70,
              );
          });
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -24px 0px" },
    );
    document
      .querySelectorAll("#projectGrid .folder-card, .mobile-category-folder")
      .forEach((card) => observer.observe(card));
    reduced.addEventListener("change", () => {
      if (reduced.matches) {
        observer.disconnect();
        cancelAnimationFrame(revealFrame);
        pending.clear();
      }
    });
  }
  document.querySelectorAll(".browser-tabs a").forEach((link) =>
    link.addEventListener("click", (event) => {
      if (
        reduced.matches ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0 ||
        link.target === "_blank"
      )
        return;
      const destination = new URL(link.href, location.href);
      if (destination.pathname === location.pathname) return;
      event.preventDefault();
      animate(
        document.querySelector(".site-content"),
        [
          { opacity: 1, translate: "0 0" },
          { opacity: 0, translate: "0 8px" },
        ],
        150,
      ).then(() => location.assign(destination.href));
    }),
  );
  document.querySelectorAll(".folder-card").forEach((card) => {
    const hint = document.createElement("span");
    hint.className = "folder-open-hint";
    hint.textContent = "Open Folder →";
    hint.setAttribute("aria-hidden", "true");
    card.querySelector(".folder-card-surface")?.append(hint);
    let frame;
    card.addEventListener("pointermove", (event) => {
      if (
        reduced.matches ||
        event.pointerType !== "mouse" ||
        !matchMedia("(hover:hover)").matches
      )
        return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = Math.max(-0.5, Math.min(0.5, (event.clientX - r.left) / r.width - 0.5)),
          y = Math.max(-0.5, Math.min(0.5, (event.clientY - r.top) / r.height - 0.5));
        card.style.transform = `perspective(1000px) rotateX(${-y * 2}deg) rotateY(${x * 2}deg)`;
      });
    });
    card.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame);
      card.style.transform = "";
    });
    card.addEventListener("click", () => {
      cancelAnimationFrame(frame);
      card.style.transform = "";
    });
  });
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) enterPage();
  });
  let source;
  document.addEventListener(
    "click",
    (e) => {
      const card = e.target.closest(".folder-card");
      if (card)
        source = {
          rect: (
            card.querySelector(".folder-card-preview") || card
          ).getBoundingClientRect(),
          time: performance.now(),
        };
    },
    true,
  );
  const shells = [
    ...document.querySelectorAll(
      "#projectVideoModal,#detailPageModal,#shortsModal,dialog",
    ),
  ];
  shells.forEach((shell) => {
    const panel = shell.matches("dialog")
      ? shell
      : shell.querySelector(".shorts-modal,.detail-page-modal");
    if (!panel) return;
    let wasOpen = false,
      closing = false;
    const visible = () =>
      shell.matches("dialog")
        ? shell.open
        : !shell.hidden && getComputedStyle(shell).display !== "none";
    new MutationObserver(() => {
      const open = visible();
      if (open && !wasOpen) {
        const r = panel.getBoundingClientRect();
        const from =
          source && performance.now() - source.time < 1000 ? source.rect : null;
        const dx = from
          ? Math.max(
              -40,
              Math.min(40, from.left + from.width / 2 - (r.left + r.width / 2)),
            )
          : 0;
        const dy = from
          ? Math.max(
              -35,
              Math.min(35, from.top + from.height / 2 - (r.top + r.height / 2)),
            )
          : 12;
        animate(
          panel,
          [
            { opacity: 0, scale: ".96", translate: `${dx}px ${dy}px` },
            { opacity: 1, scale: "1", translate: "0 0" },
          ],
          400,
        );
        const preview = [
          ...panel.querySelectorAll(
            ".ipad-pro,.shorts-phone,.project-laptop-player,.db-device-art",
          ),
        ].find((node) => node.getBoundingClientRect().width > 0);
        if (from && preview) {
          const bounds = preview.getBoundingClientRect();
          animate(
            preview,
            [
              {
                opacity: 0.35,
                scale: String(Math.max(0.85, Math.min(0.96, from.width / bounds.width))),
                translate: `${dx}px ${dy}px`,
              },
              { opacity: 1, scale: "1", translate: "0 0" },
            ],
            400,
          );
        }
        if (shell !== panel)
          animate(shell, [
            { backdropFilter: "blur(0px)" },
            { backdropFilter: "blur(10px)" },
          ]);
      }
      wasOpen = open;
    }).observe(shell, { attributes: true, attributeFilter: ["open", "hidden", "style"] });
    const exit = async (action) => {
      if (closing) return;
      closing = true;
      await animate(
        panel,
        [
          { opacity: 1, scale: "1" },
          { opacity: 0, scale: ".96" },
        ],
        250,
      );
      action();
      closing = false;
    };
    if (shell.matches("dialog")) {
      const close = shell.close.bind(shell);
      shell.close = (value) => (visible() ? exit(() => close(value)) : close(value));
      shell.addEventListener("cancel", (e) => {
        e.preventDefault();
        shell.close();
      });
    } else {
      let replay = false;
      shell.addEventListener(
        "click",
        (e) => {
          if (replay) return;
          const button = e.target.closest(
            "[data-modal-close],#projectModalClose,#detailPageModalClose",
          );
          if (!button && e.target !== shell) return;
          e.preventDefault();
          e.stopImmediatePropagation();
          exit(() => {
            replay = true;
            (button || shell).click();
            replay = false;
          });
        },
        true,
      );
      document.addEventListener(
        "keydown",
        (e) => {
          if (e.key === "Escape" && visible()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            exit(() => {
              const button = shell.querySelector(
                "[data-modal-close],#projectModalClose,#detailPageModalClose",
              );
              replay = true;
              button?.click();
              replay = false;
            });
          }
        },
        true,
      );
    }
  });
  document.addEventListener("click", async (e) => {
    const link = e.target.closest('a[href^="tel:"]');
    if (!link || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(link.getAttribute("href").slice(4));
      document.querySelector(".motion-toast")?.remove();
      const toast = document.createElement("div");
      toast.className = "motion-toast";
      toast.setAttribute("role", "status");
      toast.textContent = "전화번호가 복사되었습니다.";
      document.body.append(toast);
      animate(
        toast,
        [
          { opacity: 0, translate: "-50% 8px" },
          { opacity: 1, translate: "-50% 0" },
        ],
        200,
      );
      setTimeout(async () => {
        await animate(toast, [{ opacity: 1 }, { opacity: 0 }], 200);
        toast.remove();
      }, 2000);
    } catch {
      /* Keep the original call link usable if clipboard is unavailable. */ location.href =
        link.href;
    }
  });
})();

/* 스크롤바가 없는 모달에, 아래쪽 내용이 남아 있을 때 안내를 보여줍니다. */
(function setupModalScrollHints() {
  const modalPanels = document.querySelectorAll(
    '[role="dialog"], dialog'
  );

  for (const panel of modalPanels) {
    const hint = document.createElement('div');
    hint.className = 'modal-scroll-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = '<span class="modal-scroll-hint-label">아래로 스크롤 <span class="modal-scroll-hint-arrow">↓</span></span>';
    panel.appendChild(hint);
    let frame;

    function updateHint() {
      const isVisible = panel.getClientRects().length > 0;
      const remaining = panel.scrollHeight - panel.clientHeight - panel.scrollTop;
      hint.classList.toggle('is-visible', isVisible && remaining > 12);
    }

    function scheduleUpdate() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateHint);
    }

    panel.addEventListener('scroll', scheduleUpdate, { passive: true });
    panel.addEventListener('load', scheduleUpdate, true);
    window.addEventListener('resize', scheduleUpdate);
    window.visualViewport?.addEventListener('resize', scheduleUpdate);
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(panel);
    for (const child of panel.children) {
      if (child !== hint) resizeObserver.observe(child);
    }
    const visibilityObserver = new MutationObserver(scheduleUpdate);
    visibilityObserver.observe(panel, { attributes: true, attributeFilter: ['open', 'hidden', 'style', 'class'] });
    if (panel.parentElement) {
      visibilityObserver.observe(panel.parentElement, { attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
    }
    document.fonts?.ready.then(scheduleUpdate);
    scheduleUpdate();
  }
})();
