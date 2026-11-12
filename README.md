# CabinShield AI — React Native (Expo + TypeScript)

AeroFlux · 2026 BOEING DAY. 난기류 접근 시 승무원에게 포인트별 행동을 안내하는 iPad용 승무원 앱 PoC.
iOS · Android · Web 동시 지원.

> ※ 모든 행동시간 및 임계값은 현재 PoC 가정값입니다.

## 실행

```bash
npm install
npm run start        # Expo dev server (i: iOS, a: Android, w: Web)
npm run typecheck    # tsc --noEmit
npm run build:web    # dist/ 로 웹 정적 빌드
```

`react-native-svg` 등 사용하는 모듈은 모두 Expo Go에 포함되어 있어 Expo Go에서 바로 실행됩니다.

## 구조 (승무원 화면 앱)

난기류 구간 23·13·5분 전(P1·P2·P3) 대응을 안내하는 iPad용 승무원 앱입니다. 편명을 입력하면 노선이 자동으로 채워지고,
실제 지도 위에 오늘 예보 구간(빨간 실선)과 과거 유사 보고 구간(점선)을 함께 보여 줍니다.

```
src/
  app/                    # Expo Router — 파일 = 화면
    _layout.tsx           # Provider, 사이드바 + 화면 셸, 넓은 웹 화면에서는 iPad 프레임
    overview.tsx          # 운항 현황: 전체 비행, 포인트 배너, 지도, 비행 정보 ↔ 지금 할 일, 과거 데이터, AI 인사이트
    points.tsx            # 포인트 · 구역: 1·2·3포인트 가이드, 구역 일정
    cabin.tsx             # 객실 · 서비스: 승무원 상태, 서비스 계획(자동 조정)
    trip.tsx              # 비행 · 도착: 비행 정보, 가까운 공항, 도착 준비
    system.tsx            # 상태 · 기록: 연결 상태, 알림 기록, 데모 조작
    (kernel, plans, scenario, twin, incidents, settings) → /overview 리다이렉트 (이전 PoC 경로 호환)
  domain/                 # UI와 무관한 순수 TS
    geo.ts                # 대권항로, 거리·방위, 메르카토르
    land.ts               # 북태평양 해안선 (Natural Earth 1:50m, 단순화·인라인)
    flight.ts             # 비행 모델, 예보 구역, 1시간 선행 탐색, 구간 노출
    content.ts            # 포인트별 할 일·방송 문구, 과거 보고, 공항, 승무원, 서비스
    planner.ts            # 서비스 타이밍 플래너
    schedule.ts           # 가상 AFX 운항 스케줄 (편명 → 노선 자동 입력)
  ai/                     # 온디바이스 AI (앱 안에서만 실행, 네트워크 불필요)
    cstWeights.ts         # 정리 시간 예측 MLP 38→32→16→3 가중치 (1,827 파라미터, sim787 데이터로 학습)
    cstModel.ts           # 순수 TS 추론 + Safety Kernel (CSM = Q_low − (CST̂+마진) − 버퍼) + 자체 점검
    cabinState.ts         # 서비스 계획·휴식·체크리스트로 객실 상태(38개 특성) 구성
  state/
    FlightSim.ts          # 시뮬레이션 상태 (위치 추정, 포인트 단계, 서비스 계획, 로그)
    FlightContext.tsx     # 0.2초마다 시뮬레이션을 돌리고 화면 갱신
    crewView.ts           # 배너·할 일 문구 계산
    UiContext.tsx         # 비행편 시작 시트 열기/닫기
  components/
    Sidebar, TopBar, Screen, Toast, SetupSheet(편명·날짜 칩·시간 휠), Icon, AeroFluxMark
    crew/                 # FlightMap(react-native-svg), RouteBar, PointBanner, InfoTodoCard, HistoryInsight, …
    ui/                   # T, Card/Tag/Tile/KV, Segmented/PillButton
  theme/                  # Apple 스타일 라이트/다크 팔레트, 시스템 폰트
```

> 편명, 스케줄, 예보 구역, 과거 보고, 승객 수 등은 모두 가상 데이터입니다.

### 정리해도 되는 이전 파일

아래 파일은 이전 Safety Kernel PoC에서 쓰던 것으로, 지금은 `export {}`만 남아 있어 삭제해도 됩니다.
`src/components/{CabinTwin,Floorplan,PlaceholderView,PlanChart,PlaneArt}.tsx`, `src/components/ui/{DashedRule,Grid,Verdict}.tsx`,
`src/domain/{constants,kernel,types}.ts`, `src/state/ScenarioContext.tsx`, `src/hooks/usePngExport.ts`

## 배포 (Web)

`vercel.json` 포함: Vercel에서 이 저장소를 연결하면 `expo export -p web` → `dist/`가 배포됩니다.
기존 Vercel 프로젝트(단일 HTML)를 교체할지 여부는 직접 결정하세요.

## Language (EN / 한국어)

The app defaults to English. Use the **EN / 한국어** toggle in the top bar (or in the flight setup sheet) to switch.
Every user-facing string is stored as `Txt { ko, en }` (`src/i18n/LangContext.tsx`). Components read it with
`useLang()` → `L(ko, en)` for inline strings and `P(txt)` for content objects. Formatting helpers (minutes, dates,
weekdays, countdowns) live in `src/i18n/format.ts`.
