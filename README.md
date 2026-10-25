# CabinShield AI — React Native (Expo + TypeScript)

AeroFlux · 2026 BOEING DAY. 난기류 접근 시 객실 안전화 계획을 검증하는 승무원 태블릿 PoC.
기존 웹 프리뷰(https://cabinshield-ai.vercel.app)의 단일 HTML을 Expo Router 기반 RN 앱으로 이식했습니다.
iOS · Android · Web 동시 지원.

> ※ 모든 행동시간 및 임계값은 현재 PoC 가정값입니다.

## 실행

```bash
npm install
npm run start        # Expo dev server (i: iOS, a: Android, w: Web)
npm run typecheck    # tsc --noEmit
npm run build:web    # dist/ 로 웹 정적 빌드
```

`react-native-view-shot`, `@react-native-community/slider`, `expo-sharing`, `react-native-svg`는
모두 Expo Go에 포함된 모듈이라 Expo Go에서 바로 실행됩니다.

## 구조

```
src/
  app/                    # Expo Router — 파일 = 화면 (웹 URL도 동일)
    _layout.tsx           # 폰트 로드, Theme/Scenario Provider, 사이드바 + 작업 패널 셸
    index.tsx             # → /overview
    overview.tsx          # Overview (기체·좌석·존·요약 타일)
    twin.tsx              # Cabin Digital Twin
    kernel.tsx            # Safety Kernel (CSM 판정, 액션 라이브러리)
    plans.tsx             # Response Plans (CST vs TTA 차트, 승무원 확정)
    scenario.tsx          # Scenario Input (객실 상태·시간 입력, 실시간 판정)
    incidents.tsx         # Incident Data (다음 단계 placeholder)
    settings.tsx          # Settings (다음 단계 placeholder)
  domain/
    types.ts              # 도메인 타입
    constants.ts          # Scenario 01, 플랜 정의, 존, 입력 옵션
    kernel.ts             # Safety Kernel 순수 함수 (UI 무관, 테스트 용이)
  state/ScenarioContext.tsx   # useReducer 기반 전역 시나리오 상태
  theme/                  # 라이트/다크 팔레트, Manrope 폰트 매핑
  components/             # Sidebar, TopBar, Screen, PlaneArt(SVG), Floorplan, CabinTwin, PlanChart …
    ui/                   # T(텍스트), Card/Panel, Grid, Button/Chip/Segmented/OptionField/SliderField, Badge …
  hooks/                  # useResponsive(760/560 breakpoint), usePngExport
```

## 브랜드

- 원본: `assets/brand/AF_color_logo.svg`(컬러 로고), `assets/brand/AF_mono_icon.svg`(단색 아이콘)
- 앱 안 로고: `src/components/AeroFluxMark.tsx` (react-native-svg 벡터, `color` prop으로 단색 가능)
- `assets/icon.png`, `splash-icon.png`, `favicon.png`, `android-icon-*.png`는 위 SVG에서 생성한 AF 마크

## Safety Kernel

`CSM = TTA − CST − Safety Buffer`

| 판정 | 조건 |
| --- | --- |
| PASS | CSM ≥ 15 s |
| TIGHT | 0 – 14 s |
| REJECT | CSM < 0 s |

플랜 A(Full tidy-up) · B(Minimum safe transition) · C(Self-protection)의 CST는
현재 객실 상태에 적용되는 액션만 합산합니다 (`src/domain/kernel.ts`).

## 웹 버전과 달라진 점

- `<select>` → 터치용 옵션 pill (`OptionField`), `<input type=range>` → `@react-native-community/slider`
- **Save screenshot / Quick save PNG**: 앱에서는 실제 PNG 캡처 후 공유 시트(사진 저장·AirDrop 등)를 엽니다.
  - Save screenshot = 현재 보이는 화면, Quick save PNG = 스크롤 밖까지 포함한 작업 패널 전체
  - 웹 빌드에서는 기존처럼 안내 토스트만 표시
- 해시 라우팅(`#overview`) → 경로 라우팅(`/overview`). Settings 경로는 `/settings` (기존 `#config`)
- 폰(<760px)에서는 사이드바가 상단 가로 스크롤 탭으로 바뀜. 시스템 다크 모드 자동 대응
- 기체 측면도 객실 컷어웨이의 좌석 아이콘을 실제로 그리도록 수정 (웹 버전은 SVG pattern 좌표 문제로 보이지 않았음)

## 배포 (Web)

`vercel.json` 포함: Vercel에서 이 저장소를 연결하면 `expo export -p web` → `dist/`가 배포됩니다.
기존 Vercel 프로젝트(단일 HTML)를 교체할지 여부는 직접 결정하세요.
