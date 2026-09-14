/* 모바일에서 목업을 제목 아래로 옮기고, PC에서는 원래 자리로 돌려놓습니다. */
(function setupMobileModalOrder() {
  const mobileScreen = window.matchMedia("(max-width: 767px)");
  const savedLayouts = [];
  const modalSelector =
    "[data-goodnotes-modal], #projectVideoModalPanel, #detailPageModal .detail-page-modal, #shortsModal .shorts-modal";
  const mockupSelector =
    ".planner-device, .project-modal-view, .project-laptop-wrap, .shorts-phone-wrap";

  // 1. 제목과 목업을 찾고, 목업이 원래 있던 자리에 표시를 남깁니다.
  for (const modalPanel of document.querySelectorAll(modalSelector)) {
    const descriptionArea = modalPanel.querySelector(
      ".planner-copy, .shorts-modal-copy, .detail-page-modal-copy",
    );
    if (!descriptionArea) continue;
    const title = descriptionArea.querySelector("h2");
    if (!title) continue;
    modalPanel.classList.add("mobile-project-modal");
    descriptionArea.classList.add("mobile-project-copy");
    const savedMockups = [];

    for (const mockup of modalPanel.querySelectorAll(mockupSelector)) {
      // 다른 목업 안에 포함된 요소까지 따로 이동하지 않습니다.
      if (mockup.parentElement.closest(mockupSelector)) continue;
      const originalPosition = document.createComment("PC 목업의 원래 자리");
      mockup.before(originalPosition);
      savedMockups.push({ element: mockup, originalPosition: originalPosition });
    }
    savedLayouts.push({ title: title, mockups: savedMockups });
  }

  // 2. 요소를 복사하지 않고 이동하므로 버튼에 연결된 기능이 유지됩니다.
  function updateMockupOrder() {
    for (const layout of savedLayouts) {
      let previousElement = layout.title;
      for (const mockup of layout.mockups) {
        if (mobileScreen.matches) {
          previousElement.after(mockup.element);
          previousElement = mockup.element;
        } else {
          mockup.originalPosition.after(mockup.element);
        }
      }
    }
  }

  // 3. 처음 열었을 때와 모바일/PC 경계를 넘었을 때 실행합니다.
  mobileScreen.addEventListener("change", updateMockupOrder);
  updateMockupOrder();
})();
