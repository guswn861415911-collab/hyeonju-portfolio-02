# LEGO World 추가 및 수정

- 카드 위치: DippingBook → LEGO World → 훈민정음 → 기존 카드.
- 첨부 영상 `videos/lego-world-preview.mp4`는 **프로젝트 카드 프리뷰**에 사용합니다. PC 호버 재생/모바일 자동 프리뷰는 기존 공통 스크립트로 처리합니다.
- 첨부 이미지 `images/lego-world-cover.png`는 **모달 안 노트북 목업**에 사용합니다. 모달에는 영상 플레이어를 넣지 않았습니다.
- 모달은 DippingBook과 같은 소개/메타 정보(왼쪽), 목업(오른쪽), 사이트 버튼, 하단 상세 탭 구조입니다. LEGO 탭은 Overview / Key Features / Design System입니다.

## 파일
- `work.html`: 카드와 모달 HTML.
- `dippingbook-modal.css`: 두 프로젝트의 공통 레이아웃과 모바일 스타일.
- `dippingbook-modal.js`: 두 모달 각각 초기화; 열기/닫기, 포커스 복귀, 탭·키보드·스크롤 전환을 공유.
- `lego-modal.css`: LEGO 목업과 컬러 포인트만 정의.
- `images/lego-world-cover.png`, `videos/lego-world-preview.mp4`: 원본 첨부 에셋.
- 이전 LEGO 전용 모달 JS는 공통 로직으로 통합해 제거했습니다.

## 테스트
`work.html`을 브라우저로 열거나 기존 로컬 서버의 /work.html에 접속하세요. PC에서는 두 번째 카드에 마우스를 올리면 영상이 재생되고, 클릭하면 이미지 목업이 있는 모달이 열립니다. 모바일에서는 All work 또는 Web design을 먼저 여세요. 모달 탭, 화살표 키, 닫기 버튼과 Escape도 사용할 수 있습니다.

기존 data-project-number는 훈민정음 등 프로젝트 판별에 쓰이는 식별자이므로 유지합니다. 실제 표시 순서는 위와 같습니다. Vercel 배포는 수행하지 않았습니다.
