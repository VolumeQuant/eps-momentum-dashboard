# UX Benchmarks: 금융 플랫폼 분석 및 대시보드 적용 전략

> **"AI 종목 브리핑 US"** 대시보드를 위한 5개 금융 플랫폼 벤치마크 분석.
> 각 플랫폼의 강점을 추출하고, 우리 시스템에 구체적으로 적용할 수 있는 패턴을 도출한다.

---

## 목차

1. [FINVIZ — 데이터 밀도의 교과서](#1-finviz--데이터-밀도의-교과서)
2. [Seeking Alpha — 등급 기반 신호 체계](#2-seeking-alpha--등급-기반-신호-체계)
3. [TradingView — 다크 테마와 차트 인터랙션의 정점](#3-tradingview--다크-테마와-차트-인터랙션의-정점)
4. [Webull — 모바일 퍼스트 금융 데이터 카드](#4-webull--모바일-퍼스트-금융-데이터-카드)
5. [토스증권 — 미니멀리즘과 한국어 UX의 기준](#5-토스증권--미니멀리즘과-한국어-ux의-기준)
6. [종합 비교 매트릭스](#6-종합-비교-매트릭스)
7. [우리 대시보드 적용 전략](#7-우리-대시보드-적용-전략)
8. [컴포넌트별 구체적 개선안](#8-컴포넌트별-구체적-개선안)
9. [컬러 시스템 벤치마크](#9-컬러-시스템-벤치마크)
10. [모바일/데스크톱 반응형 전략](#10-모바일데스크톱-반응형-전략)

---

## 1. FINVIZ — 데이터 밀도의 교과서

> 참고: [finviz.com](https://finviz.com) | [FINVIZ Heatmap Guide](https://finviz.blog/the-power-of-finviz-heat-maps-a-visual-guide-for-stock-analysis/) | [Luxalgo Analysis](https://www.luxalgo.com/blog/finviz-market-screener-analysis/)

### 1.1 탁월한 점: 고밀도 데이터 테이블

**스크리너 테이블 설계**
- 14가지 뷰 모드 제공 (Overview, Valuation, Financial, Technical, Custom 등) — 같은 데이터를 다른 관점으로 봄
- Custom Tab에서 사용자가 컬럼 순서와 구성을 직접 조합 (20+ 필터)
- 모든 컬럼 헤더가 클릭 정렬(sortable)이며, 정렬 아이콘이 텍스트 정렬을 방해하지 않음
- 행당 높이가 극도로 압축적 — 한 화면에 20~30종목이 보임

**히트맵 (트리맵)**
- S&P 500 전체를 한 화면에 시각화 — 사각형 크기 = 시가총액, 색상 = 등락률
- 색상 강도(intensity)로 변동 크기를 직관적 전달: 진한 녹색(+3%↑) → 연한 녹색(+1%) → 회색(보합) → 연한 빨강(-1%) → 진한 빨강(-3%↓)
- 섹터별 영역 구분으로 "어떤 업종이 강한가"를 2초 내 파악 가능
- hover 시 개별 종목의 정확한 수치 팝업

### 1.2 위험/기회 신호 표현

- **색상 농도 매핑**: 숫자 값의 크기를 색상 강도에 직접 매핑 — 극값은 색이 진하고, 보합은 회색
- 필터 기반 접근: "어닝 이번 주" 같은 이벤트 필터를 스크리너에 내장
- 별도의 "위험" 아이콘 없음 — 대신 데이터 자체가 컬러로 말함

### 1.3 Glanceability (2초 파악성)

| 요소 | 점수 | 설명 |
|------|------|------|
| 히트맵 | **10/10** | 업계 최고 — 시장 전체 상태를 1초에 파악 |
| 스크리너 테이블 | **7/10** | 밀도 높지만, 초보자에겐 과부하 |
| 필터 패널 | **5/10** | 숙련자 전용 — 드롭다운이 너무 많음 |

### 1.4 컬러 체계

```
Positive Gradient:  진한 녹색 → 중간 녹색 → 연한 녹색
Neutral:            회색 (#999 계열)
Negative Gradient:  연한 빨강 → 중간 빨강 → 진한 빨강
배경:               밝은 회색 (#FFFFFF ~ #F8F8F8)
텍스트:             검정 (#333)
하이퍼링크:         파란색 (전통적 웹 스타일)
```

- 라이트 테마 전용 — 다크 모드 없음
- 테이블 행: 짝수/홀수 행 교대 배경 (#FFFFFF / #F0F0F0)

### 1.5 반응형 전략

- **데스크톱 전용 설계** — 모바일 대응 미흡
- 히트맵은 반응형이지만 스크리너 테이블은 가로 스크롤 필요
- 교훈: 데이터 밀도가 높은 테이블은 모바일에서 "카드" 변환이 필수

### 1.6 우리 대시보드에 가져올 것

| 패턴 | 적용 대상 | 구체적 구현 |
|------|-----------|------------|
| **셀 색상 농도 매핑** | CandidatesTable의 adj_gap, adj_score 컬럼 | 값의 크기에 따라 배경색 강도 변화 (현재는 텍스트 컬러만 변경 중) |
| **컴팩트 행 높이** | CandidatesTable | 행 높이를 `py-2`로 줄이고, 한 화면에 최소 15종목 표시 |
| **뷰 모드 전환** | 매수 후보 섹션 | "기본 뷰 / 상세 뷰" 토글 — 기본은 핵심 5컬럼, 상세는 전체 10컬럼 |
| **정렬 시 아이콘 위치** | SortHeader 컴포넌트 | 컬럼 정렬 정렬(right-aligned) 시 chevron이 숫자 왼쪽에 오도록 |

---

## 2. Seeking Alpha — 등급 기반 신호 체계

> 참고: [seekingalpha.com](https://seekingalpha.com) | [Quant Ratings FAQ](https://help.seekingalpha.com/premium/quant-ratings-and-factor-grades-faq) | [Quant Education](https://seekingalpha.com/education/quant-ratings)

### 2.1 탁월한 점: 팩터 그레이드 시스템

**Quant Rating 구조**
- 5점 척도 (1.0~5.0) + 5단계 레이블 (Strong Sell → Strong Buy)
- 각 종목에 5개 팩터 (Value, Growth, Profitability, Momentum, EPS Revisions) 독립 평가
- 각 팩터별 A+ ~ F 학점 부여 — 학교 성적표처럼 직관적
- 종합 점수 + 세부 팩터 분해 = **"왜 이 종목이 좋은가"를 구조적으로 설명**

**심볼 페이지 레이아웃**
- 좌측: 기사/분석 콘텐츠 (스크롤)
- 우측 사이드바: Ratings Summary 박스 (고정)
  - Quant Rating 배지 (최상단)
  - Factor Grades 바로 아래
  - Wall Street 애널리스트 의견
  - SA Authors 의견
- **3가지 관점(Quant + Wall Street + Authors)을 한 페이지에 대조** 표시

### 2.2 위험/기회 신호 표현

**그레이드 배지 시스템**
```
A+, A, A-  → 진한 초록 배경 / 흰 텍스트 (Strong Positive)
B+, B, B-  → 연한 초록 배경 (Positive)
C+, C, C-  → 회색/노란 배경 (Neutral)
D+, D, D-  → 연한 빨강/주황 배경 (Negative)
F          → 진한 빨강 배경 / 흰 텍스트 (Strong Negative)
```
- 배지(pill) 형태 — 라운드 코너, 작은 크기, 배경색이 의미를 전달
- 텍스트+배경색+위치의 삼중 인코딩으로 색맹 사용자도 식별 가능

**Rating 배지**
```
Strong Buy  → 진한 초록 배지 (#2E7D32 계열)
Buy         → 중간 초록 배지
Hold        → 노란/회색 배지
Sell        → 주황 배지
Strong Sell → 빨강 배지
```

### 2.3 Glanceability

| 요소 | 점수 | 설명 |
|------|------|------|
| Quant Rating 배지 | **9/10** | "Strong Buy" 한마디 + 색상으로 즉시 파악 |
| Factor Grades | **8/10** | A~F 학점은 전세계 공통 직관 |
| 종목 페이지 전체 | **6/10** | 콘텐츠가 많아 처음 방문 시 포커스 분산 |

### 2.4 컬러 체계

```
Brand:           Deep Green (#0D6B37 계열) — 신뢰감
Strong Buy:      #2E7D32 (진한 초록)
Buy:             #4CAF50 (중간 초록)
Hold:            #FFC107 (앰버) 또는 #9E9E9E (회색)
Sell:            #FF9800 (오렌지)
Strong Sell:     #F44336 (빨강)
배경:            화이트 (#FFFFFF)
카드 배경:       #FAFAFA
테두리:          #E0E0E0
```

### 2.5 반응형 전략

- 데스크톱 중심 설계, 모바일에서는 사이드바가 하단으로 이동
- Quant Rating은 데스크톱 웹사이트에서만 완전히 표시
- 모바일에서는 핵심 Rating 배지만 보여주고 세부 Factor는 탭/확장으로 숨김

### 2.6 우리 대시보드에 가져올 것

| 패턴 | 적용 대상 | 구체적 구현 |
|------|-----------|------------|
| **학점형 배지 시스템** | 3일 검증 상태 표시 | 현재 이모지(✅⏳🆕)에 **배경색 배지** 추가 — 검증완료=초록 배지, 대기=앰버 배지, 신규=파랑 배지 |
| **팩터 분해 카드** | TickerDetail 페이지 | adj_score를 seg1~seg4로 분해하여 개별 "학점" 표시 (각 세그먼트별 A~F 등급 매핑) |
| **멀티 관점 대조** | 종목 상세 | "시스템 점수 vs AI 분석 vs 리스크 플래그"를 SA의 "Quant vs WallSt vs Authors" 방식으로 나란히 배치 |
| **Rating Summary 고정 사이드바** | 종목 상세 페이지 | 우측에 핵심 지표 박스 고정 (스크롤해도 따라옴) |

---

## 3. TradingView — 다크 테마와 차트 인터랙션의 정점

> 참고: [tradingview.com](https://www.tradingview.com) | [TradingView Brand Colors](https://mobbin.com/colors/brand/tradingview) | [Custom Themes API](https://www.tradingview.com/charting-library-docs/latest/customization/styles/custom-themes/) | [Watchlist Blog](https://www.tradingview.com/blog/en/minimalistic-display-mode-for-watchlist-41721/)

### 3.1 탁월한 점: 다크 테마 컬러 시스템

**Mirage 다크 테마**
- 배경색: `#131722` (Mirage) — 순수 검정(#000)이 아닌 깊은 청회색
- 표면색: `#1E222D` — 배경보다 한 톤 밝은 카드 표면
- 텍스트: `#D1D4DC` (기본), `#787B86` (보조)
- 액센트: `#2962FF` (Dodger Blue) — 인터랙티브 요소에만 사용, 주의를 끌되 과하지 않음

**19단계 컬러 쉐이드**
- 하나의 기본 색상에서 19개 농도를 추출하여 UI 요소별로 분배
- 밝은 회색 → 툴바 구분선, 어두운 회색 → 툴팁 배경
- 이 체계 덕분에 수십 개 요소가 있어도 시각적 통일감 유지

**워치리스트 미니멀 모드**
- 일반 모드: 심볼 + 가격 + 변동 + 스파크라인
- 미니멀 모드: 심볼 + 컴팩트 가격만 (밀도 극대화)
- 테이블 뷰: Symbol, Last, Change%, Volume, High/Low 커스텀 컬럼
- **모바일에서는 테이블 뷰 비활성화** → 리스트 뷰만 지원 (의도적 제한)

### 3.2 위험/기회 신호 표현

**스크리너 색상 코딩**
- Golden Cross (추세 전환): 별도 레이블 + 색상
- Bullish (상승): 초록 레이블
- Bearish (하락): 빨강 레이블
- 이동평균선 대비 거리: 양수 = 초록 (추세 강도), 음수 = 빨강 (약세)
- **극단값(과매수/과매도)에 커스텀 컬러로 하이라이트** — 시각적 경고

**차트 인터랙션**
- Crosshair + 툴팁: 마우스를 차트 위에 올리면 정확한 OHLCV 표시
- 어두운 배경 위 밝은 데이터 포인트 — 데이터가 "빛나는" 효과
- 그리드 라인: 극도로 연한 (#2A2E39) — 데이터를 방해하지 않으면서 정렬 가이드 제공

### 3.3 Glanceability

| 요소 | 점수 | 설명 |
|------|------|------|
| 워치리스트 | **9/10** | 스파크라인 + 색상으로 즉시 추세 파악 |
| 차트 | **7/10** | 데이터 풍부하지만 "시장 전체 상태" 파악은 아님 |
| 스크리너 | **8/10** | 필터 결과 + 색상 코딩이 효과적 |

### 3.4 컬러 체계

```
Dark Theme:
  Background:     #131722 (Mirage)
  Surface:        #1E222D
  Elevated:       #2A2E39
  Text Primary:   #D1D4DC
  Text Secondary: #787B86
  Text Muted:     #4C525E
  Accent:         #2962FF (Dodger Blue)
  Positive:       #26A69A (Teal Green)
  Negative:       #EF5350 (Coral Red)
  Grid Lines:     #2A2E39

Light Theme:
  Background:     #FFFFFF
  Positive:       #089981
  Negative:       #F23645
```

### 3.5 반응형 전략

- 시스템 테마 자동 감지 (OS의 다크/라이트 모드 연동)
- 데스크톱: 다중 패널 (차트 + 워치리스트 + 뉴스)
- 태블릿: 패널 수 축소, 차트 전체 화면 우선
- 모바일: 단일 뷰 전환 (차트 or 워치리스트, 동시 표시 안 함)
- **CSS Custom Properties + 자동 라이트/다크 전환** — 위젯 수준에서도 호스트 페이지 테마와 자동 연동

### 3.6 우리 대시보드에 가져올 것

| 패턴 | 적용 대상 | 구체적 구현 |
|------|-----------|------------|
| **Mirage 스타일 컬러 레이어링** | 전체 다크 테마 | 현재 `--bg-deep: #0B1120`은 TradingView보다 더 짙음 — 유지하되, 표면/elevated 간 차이를 더 명확히 |
| **스파크라인 인라인** | CandidatesTable 행, Portfolio 카드 | 30일 가격 스파크라인을 행 내부에 소형 SVG로 삽입 (높이 16px, 너비 60px) |
| **극단값 하이라이트** | VixBar, adj_gap 컬럼 | 90th 이상 VIX나 adj_gap -15% 이하에 **글로우 효과** (text-shadow 또는 ring) 추가 |
| **그리드 라인 최소화** | 차트 컴포넌트 | Recharts의 그리드를 #1E293B 수준으로 극히 연하게 |
| **미니멀 워치리스트 모드** | 포트폴리오 카드 | 현재 카드 뷰 외에 "리스트 모드" 토글 추가 — 한 줄에 티커+수익률만 표시 |

---

## 4. Webull — 모바일 퍼스트 금융 데이터 카드

> 참고: [webull.com](https://www.webull.com) | [Webull Desktop App](https://www.webull.com/trading-platforms/desktop-app) | [StockBrokers Review](https://www.stockbrokers.com/review/webull)

### 4.1 탁월한 점: 모바일 데이터 시각화

**Saturn 마켓 허브**
- 수익률 곡선, 순유입 등 매크로 데이터를 시각적 카드로 제공
- 트레이더가 "스캔 → 분석 → 실행"의 흐름으로 빠르게 이동하도록 설계
- AI 뉴스 요약 기능 내장 — 긴 기사를 한 문장으로 요약

**주문 흐름 시각화**
- Bid(매수 압력) vs Ask(매도 압력) 볼륨 분석을 모바일에서 시각적으로 표현
- 이 수준의 주문 흐름 가시성은 모바일 환경에서 드문 기능

**카드 기반 종목 요약**
- 종목 상세 페이지가 카드 스택으로 구성
- 각 카드: 차트, 분석가 평가, 재무 요약, 뉴스
- 카드 사이를 세로 스크롤로 이동 — 탭 전환 없음

**로딩 애니메이션**
- 카드별 순차적 로딩 (staggered entrance)
- 스켈레톤 → 실제 데이터 전환 시 부드러운 페이드

### 4.2 위험/기회 신호 표현

- **초록/빨강 이중 코딩**: 가격 변동 + 화살표 방향
- 분석가 등급: "Buy 12 / Hold 5 / Sell 2" 형태의 수평 바 차트
- 56개 기술 지표, 63개 기술 신호 — 숫자 기반 경고가 아닌 시각적 신호로 변환
- Ladder Trading: 주요 지표(Buy/Sell Trades, Volume Delta)를 시각적으로 직접 표시

### 4.3 Glanceability

| 요소 | 점수 | 설명 |
|------|------|------|
| 종목 요약 카드 | **9/10** | 가격 + 변동률 + 미니 차트가 한눈에 |
| 마켓 허브 | **8/10** | 매크로 지표를 카드형으로 정리 |
| 포트폴리오 뷰 | **7/10** | 보유 종목과 수익률이 명확하지만, 세부 데이터 접근이 불편하다는 사용자 피드백 존재 |

### 4.4 컬러 체계

```
Dark Theme:
  Background:     #1C1C28 계열 (깊은 네이비)
  Surface:        #25253A 계열
  Positive:       #00C805 (밝은 초록 — Robinhood 계열)
  Negative:       #FF3B30 (밝은 빨강)
  Accent:         #3B82F6 계열 (블루)
  Text:           #FFFFFF (강조), #A0A0A0 (보조)

Light Theme:
  Background:     #FFFFFF
  Positive:       #00B812
  Negative:       #FF3B2F
```

### 4.5 반응형 전략

- **진정한 모바일 퍼스트**: 모바일 앱이 주력, 데스크톱은 보조
- Webull Lite: 경량 모드 — 정보를 의도적으로 줄임 (초보자 타겟)
- 멀티 플랫폼 단일 계정: iOS, Android, Windows, Mac, Web 동일 경험
- 태블릿 전용 앱: iPad 에서 더 넓은 차트 + 멀티패널 지원

### 4.6 우리 대시보드에 가져올 것

| 패턴 | 적용 대상 | 구체적 구현 |
|------|-----------|------------|
| **카드 스택 스크롤** | 모바일 Dashboard | 모바일에서 MarketPulse → Stats → Candidates → Portfolio → DeathList 순서의 수직 카드 스택 |
| **순차적 로딩 애니메이션** | 전체 Dashboard | 현재 `animate-pulse` 스켈레톤에 **staggered 진입 애니메이션** 추가 (이미 DESIGN_SPEC에 명시) |
| **분석가 수평 바** | TickerDetail 리스크 섹션 | 리스크 플래그를 Webull의 "Buy/Hold/Sell bar" 스타일로 표현 — 4개 리스크를 가로 막대로 시각화 |
| **AI 요약 카드** | AI 점검 결과 표시 | Gemini AI 분석 결과를 1~2문장 요약 카드로 표시, 탭하면 전체 분석 노출 |
| **Lite/Full 모드** | 매수 후보 섹션 | 초보자용 "간편 뷰" (Top 5 + 핵심 점수만) / 고급 뷰 (전체 30종목 + 모든 지표) |

---

## 5. 토스증권 — 미니멀리즘과 한국어 UX의 기준

> 참고: [tossinvest.com](https://www.tossinvest.com) | [PLUSX UX분석](https://brunch.co.kr/@plusx/71) | [요즘IT UX 분석](https://yozm.wishket.com/magazine/) | [OpenSurvey 비교](https://blog.opensurvey.co.kr/article/ux-finance-app-3/) | [TDS 컬러 업데이트](https://toss.tech/article/tds-color-system-update)

### 5.1 탁월한 점: 초보자를 위한 정보 구조

**"한 화면 한 기능" 원칙**
- 사용자가 화면에서 헤매는 시간을 최소화
- 복잡한 정보를 탭으로 나누는 모듈화 전략
- 선택한 정보에만 집중할 수 있는 Progressive Disclosure

**투자 입문자 시각 설계**
- 메뉴 구성, 명칭, 투자 정보 탐색을 완전히 새롭게 구성
- 불필요한 그래픽 요소 없이 깔끔한 디자인 — 정보 전달에만 집중
- 전문 용어 대신 일상 한국어: "시가총액" 대신 "회사 규모"

**UX 스코어 업계 1위**
- OpenSurvey 기준 73.2점 (5개 주요 증권앱 중 최고)
- 나무증권 68.4, M-STOCK 67.2 대비 확연한 우위
- 거의 모든 경험 차원에서 우위

### 5.2 위험/기회 신호 표현

**심플한 수익률 표시**
- 양수: 빨강 (한국 주식 시장 관습 — 상승 = 빨강)
  - 주의: 미국 시장 대시보드이므로 **초록 = 상승** 유지
- 음수: 파랑
- 큰 숫자 + 색상으로 즉시 인지
- 보조 정보(전일 대비, 누적)는 작은 글씨로 아래에 배치

**리스크 표현**
- 경고를 과장하지 않음 — "주의가 필요해요" 같은 중립적 한국어 문구
- 아이콘 최소 사용, 텍스트 기반 설명 우선
- 색상 역할: 강조(빨강/파랑)와 중립(회색) 두 계층만

### 5.3 Glanceability

| 요소 | 점수 | 설명 |
|------|------|------|
| 메인 화면 | **9/10** | 보유 종목 + 총 수익률이 첫 화면에 크게 |
| 종목 상세 | **8/10** | 가격 + 변동이 최상단, 세부는 스크롤 |
| 뉴스/분석 | **6/10** | 텍스트 기반이라 스캔 속도는 보통 |

### 5.4 컬러 체계

```
Brand:           Toss Blue (#3182F6)
Background:      #FFFFFF (라이트 모드), #17171B (다크 모드)
Surface:         #F5F5F5 (라이트), #212126 (다크)
Text Primary:    #191F28 (라이트), #ECECEC (다크)
Text Secondary:  #8B95A1
Positive:        #F04452 (한국 시장: 빨강=상승) — 미국용은 초록
Negative:        #3182F6 (한국 시장: 파랑=하락) — 미국용은 빨강
Divider:         #EAEBEE (라이트), #2C2C34 (다크)
```

- TDS (Toss Design System): 7년간 운영, 2025년 대규모 컬러 시스템 업데이트
- 각 컬러 스케일의 명도를 균일화 (Grey 100, Blue 100, Red 100의 명도 통일)
- 다크모드 1:1 자동 대응 팔레트

### 5.5 반응형 전략

- **모바일 네이티브** — 웹은 부가 채널
- 화면 전환이 부드러운 네이티브 애니메이션
- 하단 탭 네비게이션 (5개 이내)
- 데이터 밀도를 의도적으로 낮춤 — 핵심 수치 1~2개만 크게 표시

### 5.6 우리 대시보드에 가져올 것

| 패턴 | 적용 대상 | 구체적 구현 |
|------|-----------|------------|
| **한국어 친화적 카피** | final_action 표시 | "적극 투자하세요!" / "신중하게 접근하세요" — 현재 구현과 일치, 유지 |
| **한 화면 한 메시지** | 모바일 MarketPulse | 모바일에서 MarketPulse 카드는 "시장은 지금 [계절]입니다" 한 문장 + 신호등만 표시. 세부(HY값, VIX값)는 탭하면 펼침 |
| **명도 균일 컬러 스케일** | 전체 color system | 현재 emerald-400, red-400, amber-400의 명도(perceived brightness)를 검증하고, 다크 배경에서 동일한 시인성 보장 |
| **제한된 정보 계층** | 모든 카드 | "주 정보(크게)" → "보조 정보(작게)" → "상세(숨김)" 3계층만 사용 |
| **중립적 경고 문구** | 리스크 플래그 | "경고!" 대신 "확인이 필요해요" — 불안을 유발하지 않으면서 주의를 환기 |

---

## 6. 종합 비교 매트릭스

| 차원 | FINVIZ | Seeking Alpha | TradingView | Webull | 토스증권 |
|------|--------|---------------|-------------|--------|---------|
| **데이터 밀도** | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | ★★☆☆☆ |
| **Glanceability** | ★★★★☆ (히트맵) | ★★★★☆ (배지) | ★★★★☆ (워치리스트) | ★★★★☆ (카드) | ★★★★★ (미니멀) |
| **위험 신호 명확성** | ★★★☆☆ | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★☆☆ |
| **다크 테마 품질** | ☆☆☆☆☆ (없음) | ★★☆☆☆ | ★★★★★ | ★★★★☆ | ★★★★☆ |
| **모바일 경험** | ★☆☆☆☆ | ★★☆☆☆ | ★★★★☆ | ★★★★★ | ★★★★★ |
| **한국어 UX** | ☆☆☆☆☆ | ☆☆☆☆☆ | ★★☆☆☆ | ☆☆☆☆☆ | ★★★★★ |
| **차트/시각화** | ★★★★★ (히트맵) | ★★★☆☆ | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| **진입 장벽** | ★★★☆☆ (중) | ★★★☆☆ (중) | ★★☆☆☆ (높) | ★★★★☆ (낮) | ★★★★★ (매우낮) |

### 우리 대시보드의 포지셔닝

```
데이터 밀도:   FINVIZ ========= TradingView ===== [우리] ======= Webull === 토스
접근성:        토스 ============ [우리] =========== Webull ====== SA === FINVIZ
시각화 품질:   TradingView ==== FINVIZ ==== [우리] ============= Webull === 토스
```

**목표 포지션**: "TradingView의 다크 테마 품질" + "Seeking Alpha의 등급 체계" + "토스의 한국어 UX" + "FINVIZ의 테이블 효율성"

---

## 7. 우리 대시보드 적용 전략

### 7.1 디자인 원칙 (벤치마크 종합)

**원칙 1: 2초 법칙 (FINVIZ 히트맵 + 토스 미니멀)**
- 페이지 로딩 후 2초 내에 "시장이 좋은가 나쁜가"를 알 수 있어야 한다
- MarketPulse의 계절 아이콘 + 신호등 조합이 이 역할을 담당
- 추가: **전체 페이지 상단에 1줄 요약 배너** — "봄 32일째 | 적극 투자 | 검증 완료 8종목"

**원칙 2: 삼중 인코딩 (Seeking Alpha 배지)**
- 모든 핵심 신호는 **색상 + 텍스트 + 형태** 세 가지로 동시 전달
- 색맹 사용자도, 작은 화면에서도, 흑백 인쇄에서도 의미 전달
- 예: 검증 상태 = 초록색 + "검증완료" + 원형 배지

**원칙 3: Progressive Disclosure (토스 + Webull)**
- 1단계: 결론 (배지, 한줄 요약)
- 2단계: 핵심 수치 (점수, 랭크, 수익률)
- 3단계: 상세 데이터 (세그먼트별 점수, 원시 데이터)
- 데스크톱에서는 1+2단계를 동시 표시, 모바일에서는 1단계만 표시 후 탭으로 확장

**원칙 4: 숫자는 빛나고, 텍스트는 숨는다 (TradingView)**
- 다크 배경에서 핵심 숫자는 밝은 컬러로 강조
- 보조 텍스트(레이블, 단위)는 `text-slate-500` 이하로 억제
- 폰트: 숫자는 `font-mono tabular-nums`로 정렬 보장

### 7.2 컴포넌트 우선순위별 개선 로드맵

```
[높음] MarketPulse — 계절 카드 + 1줄 요약 배너 추가
[높음] CandidatesTable — 셀 배경색 그라데이션 + 스파크라인
[높음] StatusBadge — SA 스타일 배경색 배지로 업그레이드
[중간] PortfolioCard — 리스트 모드 토글 + 총 수익률 강조
[중간] VixBar — 영역별 레이블 추가 + 극값 글로우
[중간] DeathList — 이탈 사유 + 순위 이력 시각화
[낮음] TickerDetail — 팩터 분해 카드 + 고정 사이드바
[낮음] IndustryChart — FINVIZ 스타일 히트맵 전환
```

---

## 8. 컴포넌트별 구체적 개선안

### 8.1 MarketPulse 개선

**현재 상태**: 계절 아이콘 + 신호등 + 3개 하위 카드 (HY, VIX, 시장 지수)

**개선안 A: 1줄 요약 배너 (FINVIZ 히트맵의 instant glance에서 착안)**
```
┌─────────────────────────────────────────────────────────┐
│  🌸 봄 32일째  ●● 2/2 안정  │  적극 투자하세요!        │
└─────────────────────────────────────────────────────────┘
```
- 페이지 최상단 고정 (sticky)
- 화면 폭 100%, 높이 40px, 계절 배경색 tint
- 스크롤해도 항상 보임 — **시장 상태를 잊지 않게**

**개선안 B: HY/VIX 하위 카드 밀도 증가 (TradingView 워치리스트에서 착안)**
```
현재:                           개선 후:
┌──────────┐                    ┌──────────────────────────────┐
│ HY SPREAD│                    │ HY 3.42% ↑  │ Q1 봄 32일째 │
│ 3.42%    │                    │ ──────────── │ 중앙값 하회   │
│ Q1 안정   │                    │ ●───────○   │ 방향: 안정 ↓  │
└──────────┘                    └──────────────────────────────┘
```
- 한 카드 안에 수치 + 미니 차트(252일 HY 추이) + 텍스트 설명을 압축
- TradingView의 "밀도 있지만 깔끔한" 스타일 차용

**개선안 C: 신호등(SignalDots) 디자인 강화 (Seeking Alpha 배지에서 착안)**

현재 SignalDots는 5x5px 원형 dot + 9px 레이블. 개선:
```tsx
// 현재: 단순 dot
<div className="w-5 h-5 rounded-full bg-emerald-400" />

// 개선: 배지형 + 텍스트 레이블 통합
<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
  <span className="text-[10px] font-bold text-emerald-400 tracking-wider">HY 안정</span>
</div>
```
- dot + 텍스트를 하나의 pill 배지로 통합
- 배경색 tint로 영역 구분
- **Seeking Alpha의 "Strong Buy" 배지와 동일한 시각적 무게감**

### 8.2 CandidatesTable 개선

**현재 상태**: 정렬 가능 테이블 + 그룹 헤더 + 모바일 카드 뷰

**개선안 A: 셀 배경색 그라데이션 (FINVIZ 히트맵에서 착안)**

현재 `getGapColor()`는 텍스트 색상만 변경. 배경색도 추가:
```tsx
function getGapCellStyle(gap: number): string {
  // FINVIZ 스타일: 값의 크기에 비례하는 배경색 농도
  if (gap <= -15) return 'bg-emerald-500/20 text-emerald-300'   // 강한 저평가
  if (gap <= -10) return 'bg-emerald-500/12 text-emerald-400'
  if (gap <= -5)  return 'bg-emerald-500/8 text-emerald-400'
  if (gap <= 0)   return 'text-green-400'                       // 약한 저평가
  if (gap <= 5)   return 'text-amber-400'                       // 약한 고평가
  if (gap <= 10)  return 'bg-amber-500/8 text-amber-400'
  return 'bg-red-500/12 text-red-400'                           // 강한 고평가
}
```
- 극단 값에서 배경 tint가 나타남 → 테이블 스캔 시 "어디가 기회인지" 즉시 시각화
- FINVIZ 히트맵의 핵심 원리를 테이블 셀 수준에 적용

**개선안 B: 인라인 스파크라인 (TradingView 워치리스트에서 착안)**
```
#  상태  종목명     현재가    Adj Gap   30일 추이    추세
1  ✅   NVDA      $878.40   -12.4%   ╱╱╱╲╱╱      ████
```
- 30일 가격 스파크라인을 SVG로 렌더링 (너비 64px, 높이 16px)
- 양수 기간 = 초록, 음수 기간 = 빨강
- 기존 TrendIcon(seg1~4 바 차트)과 보완적 관계 — TrendIcon은 EPS 추세, 스파크라인은 가격 추세

**개선안 C: Top 5 시각적 분리 (Webull 카드 강조에서 착안)**
```
현재: border-l-2 border-l-emerald-500 (왼쪽 보더만)

개선: Top 5 행에 미세한 배경 그라데이션 추가
className={`
  ${isTopFive ? 'bg-gradient-to-r from-emerald-500/5 to-transparent border-l-2 border-l-emerald-500' : ''}
`}
```
- 왼쪽 보더 + 배경 그라데이션으로 "이 종목이 최우선"임을 강조
- 그라데이션이 오른쪽으로 사라지므로 데이터 가독성 방해 없음

**개선안 D: 뷰 모드 토글 (FINVIZ 14개 뷰에서 영감)**
```
[기본 뷰] [상세 뷰] [차트 뷰]

기본 뷰:  #, 상태, 종목, 현재가, Score, Gap, 추세 (7컬럼)
상세 뷰:  + 업종, 매출성장, Fwd P/E, 리스크 플래그, 순위이력 (12컬럼)
차트 뷰:  FINVIZ 그리드처럼 종목별 미니 차트 격자 표시
```

### 8.3 StatusBadge 개선 (Seeking Alpha 핵심 차용)

**현재 상태**: 이모지만 표시 (✅⏳🆕)

**개선안: SA 스타일 컬러 배지**
```tsx
function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = {
    '\u2705': {
      label: '검증',
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    '\u23F3': {
      label: '대기',
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400',
    },
    '\uD83C\uDD95': {
      label: '신규',
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      dot: 'bg-blue-400',
    },
  }[status] || { label: '-', bg: 'bg-slate-700', text: 'text-slate-400', border: 'border-slate-600', dot: 'bg-slate-400' }

  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-full
      text-[10px] font-bold tracking-wider
      border ${config.bg} ${config.text} ${config.border}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
```
- 이모지 의존에서 벗어남 — **크로스 플랫폼 일관성** 확보
- Seeking Alpha의 "A+" 배지와 동일한 시각적 문법
- dot + 레이블 + 배경 tint + 테두리 = 삼중 인코딩

### 8.4 VixBar 개선

**현재 상태**: 5영역 색상 바 + 인디케이터 dot

**개선안 A: 영역 레이블 추가 (TradingView 구간 표시에서 착안)**
```
 안일   │    정 상    │경계│상승│위기│
  ○─────┼─────────────┼────┼────┼────┤
 0%    10%          67%  80%  90% 100%
        ▲ 현재: 23rd pct
```
- 각 영역 상단에 레이블 표시 (현재는 하단에 퍼센타일 값만)
- 현재 위치 아래에 작은 삼각형 + 수치

**개선안 B: 극값 시각 경고 (TradingView 극단값 하이라이트)**
```tsx
// 90th 이상일 때: 인디케이터에 pulse 애니메이션 + glow
className={`
  ${percentile >= 90 ? 'animate-pulse shadow-[0_0_12px_rgba(248,113,113,0.8)]' : ''}
`}
```

### 8.5 PortfolioCard 개선

**현재 상태**: 2x3 그리드 카드 + 총 수익률

**개선안 A: 총 수익률 히어로 숫자 (토스증권 메인 화면에서 착안)**
```
현재:
  포트폴리오 수익률   +2.34%

개선:
  ┌──────────────────────────────────────┐
  │         +2.34%                       │
  │   포트폴리오 수익률 (5종목 균등)      │
  │   ▇▇▇▇▇▇▇▇▇▇▇▇░░░ 30일 추이        │
  └──────────────────────────────────────┘
```
- 총 수익률을 **카드 최상단에 큰 숫자(text-3xl)로 배치** — 토스증권 메인 화면의 "내 투자" 패턴
- 아래에 30일 포트폴리오 가치 미니 차트
- 개별 종목 카드는 아래로 이동

**개선안 B: 리스트 모드 토글 (TradingView 미니멀 워치리스트)**
```
[카드 뷰]  [리스트 뷰]

리스트 뷰:
  NVDA   HOLD   $878.40   +5.2%   ━━━━━━━━━
  AAPL   HOLD   $234.10   +1.8%   ━━━━━━━
  META   ENTER  $612.30   +0.0%   ━━━━━
```
- 한 줄에 한 종목 — 밀도 최대화
- 우측에 스파크라인 (선택 사항)

### 8.6 DeathList 개선

**현재 상태**: 심플한 리스트 (티커 + 어제 순위)

**개선안: 이탈 사유 + 순위 궤적 (Seeking Alpha 팩터 분해 + Webull 뉴스 피드)**
```
┌──────────────────────────────────────────────┐
│  ↘ CRWD                                     │
│  어제 #12 → 오늘 탈락                        │
│  사유: adj_gap 양전환 (+2.1%), score 하락     │
│  순위: 8 → 10 → 12 → OUT                    │
│  ▁▃▅▇▅▃ (최근 6일 순위 미니 차트)             │
└──────────────────────────────────────────────┘
```
- 단순 "어제 #12"에서 → **왜 탈락했는지 + 순위가 어떻게 변했는지** 추가
- 순위 궤적을 미니 바 차트로 시각화
- Seeking Alpha의 "팩터별 이유 설명" 패턴 차용

### 8.7 TrendIcon 개선

**현재 상태**: 4개 세그먼트 수직 바 차트 (seg1~seg4)

**개선안: 방향성 화살표 오버레이 (TradingView 기술 지표에서 착안)**
```
현재:       개선:
▁▃▅▇       ▁▃▅▇ ↗    (전체 방향: 상승)
▇▅▃▁       ▇▅▃▁ ↘    (전체 방향: 하락)
▃▅▃▅       ▃▅▃▅ →    (전체 방향: 횡보)
```
- 4개 바 옆에 **전체 방향을 나타내는 작은 화살표** 추가
- seg1→seg4의 기울기를 계산하여 ↗(상승), →(횡보), ↘(하락) 결정
- 바 차트를 읽을 줄 모르는 사용자도 화살표로 즉시 판단

---

## 9. 컬러 시스템 벤치마크

### 9.1 플랫폼별 양/음 컬러 비교

| 플랫폼 | Positive | Negative | Neutral | 배경 |
|--------|----------|----------|---------|------|
| **FINVIZ** | Green 계열 | Red 계열 | Gray | White #FFF |
| **Seeking Alpha** | #2E7D32 (진한 초록) | #F44336 (빨강) | #9E9E9E | White #FFF |
| **TradingView** | #26A69A (Teal) | #EF5350 (Coral) | #787B86 | #131722 (Mirage) |
| **Webull** | #00C805 (밝은 초록) | #FF3B30 (밝은 빨강) | #A0A0A0 | #1C1C28 |
| **토스증권** | #F04452 (빨강-한국식) | #3182F6 (파랑-한국식) | #8B95A1 | #17171B |
| **우리** (현재) | #34D399 (emerald-400) | #F87171 (red-400) | #94A3B8 | #0B1120 |

### 9.2 분석 및 권장

**현재 컬러 시스템 평가:**
- emerald-400(`#34D399`)은 TradingView의 teal(`#26A69A`)보다 밝고 채도 높음 → 다크 배경에서 눈에 잘 띔 (좋음)
- red-400(`#F87171`)은 Webull의 빨강(`#FF3B30`)보다 부드러움 → 경고 강도가 약함 (개선 필요)
- 배경 `#0B1120`은 TradingView(`#131722`)보다 더 깊음 → 충분한 대비 (좋음)

**권장 조정:**
```css
/* 위험 신호를 더 강하게 — 현재 red-400이 약간 부드러움 */
--red-critical:   #EF4444;    /* red-500 — 위기 상황 전용 */
--red-primary:    #F87171;    /* red-400 — 일반 음수 (유지) */
--red-muted:      #FCA5A5;    /* red-300 — 약한 경고 */

/* 시즌 컬러 채도 조정 — 현재 너무 파스텔 */
--season-spring:  #F472B6;    /* pink-400 → 더 선명한 분홍 */
--season-summer:  #FACC15;    /* yellow-400 → 더 선명한 노랑 */
--season-autumn:  #FB923C;    /* orange-400 → 유지 */
--season-winter:  #60A5FA;    /* blue-400 → 유지 */
```

### 9.3 컬러 접근성 검증

WCAG 2.1 AA 기준 (다크 배경 `#0B1120` 대비):

| 컬러 | 용도 | 대비 비율 | 판정 |
|------|------|-----------|------|
| #34D399 (emerald-400) | 양수 텍스트 | ~8.4:1 | PASS |
| #F87171 (red-400) | 음수 텍스트 | ~6.2:1 | PASS |
| #FBBF24 (amber-400) | 경고 텍스트 | ~8.7:1 | PASS |
| #94A3B8 (slate-400) | 보조 텍스트 | ~4.8:1 | PASS (AA) |
| #64748B (slate-500) | 비활성 텍스트 | ~3.2:1 | FAIL (작은 텍스트) |

**조치**: `text-slate-500`을 장식적 요소에만 사용, 의미 있는 텍스트에는 `text-slate-400` 이상 사용.

---

## 10. 모바일/데스크톱 반응형 전략

### 10.1 플랫폼별 반응형 접근 요약

| 플랫폼 | 전략 | 테이블 처리 | 데이터 축소 |
|--------|------|-------------|------------|
| **FINVIZ** | 데스크톱 전용 | 가로 스크롤 | 없음 |
| **Seeking Alpha** | 데스크톱 우선, 모바일 보조 | 사이드바 → 하단 이동 | 팩터 그레이드 숨김 |
| **TradingView** | 멀티 플랫폼 | 모바일에서 테이블 뷰 비활성 | 패널 수 축소 |
| **Webull** | 모바일 퍼스트 | 카드 전환 | Lite 모드 제공 |
| **토스증권** | 모바일 네이티브 | 처음부터 카드만 | 항상 최소 |

### 10.2 우리 대시보드의 브레이크포인트별 전략

**모바일 (< 640px) — "토스 모드"**
```
목표: 시장 상태 + Top 5만 보여주기

1. 상단 배너: 계절 + 신호등 + final_action (1줄)
2. Top 5 카드 리스트 (풀 와이드, 세로 스택)
   - 각 카드: 순위 + 티커 + 점수 + 수익률
   - 좌측 스와이프: 상세 정보 슬라이드인
3. 포트폴리오: 총 수익률 히어로 + 5종목 가로 스크롤
4. Death List: 접힌 상태 (탭하면 펼침)
5. 하위 30종목: "더 보기" 버튼 → 펼침
```

- CandidatesTable의 `lg:hidden` 카드 뷰를 더 공격적으로 단순화
- 모바일에서 업종 컬럼, 순위이력 컬럼 완전 제거
- VixBar를 인라인 배지 형태로 축소: `VIX 15.2 (23rd 정상)` 한 줄

**태블릿 (640-1024px) — "하이브리드 모드"**
```
목표: 테이블 유지하되 컬럼 축소

1. MarketPulse: 가로 전체, 하위 카드 3열 → 2열
2. CandidatesTable: 6컬럼 (업종, 순위이력 숨김)
3. 포트폴리오 + Death List: 하단 2열 그리드
```

**데스크톱 (> 1024px) — "FINVIZ 모드"**
```
목표: 최대 데이터 밀도

1. MarketPulse: 1줄 요약 배너 (sticky) + 카드
2. CandidatesTable: 전체 10컬럼 + 스파크라인
3. 우측 사이드바: 포트폴리오 + Death List + 업종 차트
4. hover 시 미니 프리뷰 팝오버
```

### 10.3 핵심 반응형 패턴

**패턴 1: 테이블 → 카드 전환 (FINVIZ + Webull 혼합)**
- `lg:` 이상: 전통 테이블 (FINVIZ 스타일 밀도)
- `lg:` 미만: 카드 리스트 (Webull 스타일 카드)
- 이미 구현되어 있으나, 모바일 카드에 더 많은 시각적 요소 추가 필요 (스파크라인, 진행 바 등)

**패턴 2: 사이드바 재배치 (Seeking Alpha)**
- 데스크톱: 우측 사이드바에 포트폴리오/DeathList
- 태블릿: 하단으로 이동 (세로 스택)
- 모바일: 접힌 아코디언

**패턴 3: Sticky 요약 (TradingView + 토스)**
- 스크롤 시 상단에 계절/신호등 요약이 고정
- 모바일에서 특히 중요 — 긴 후보 리스트를 스크롤할 때도 시장 상태를 잊지 않음

**패턴 4: 의도적 정보 제한 (토스 + Webull Lite)**
- 모바일에서 기본값으로 Top 5만 표시
- "전체 30종목 보기" 버튼으로 확장
- 이유: 모바일 사용자의 80%는 Top 5만 필요 (파레토 법칙)

---

## 부록: 참고 리소스

### 벤치마크 플랫폼

- [FINVIZ Stock Screener](https://finviz.com)
- [FINVIZ Heatmap Guide](https://finviz.blog/the-power-of-finviz-heat-maps-a-visual-guide-for-stock-analysis/)
- [Luxalgo FINVIZ Analysis](https://www.luxalgo.com/blog/finviz-market-screener-analysis/)
- [Seeking Alpha Quant Ratings](https://seekingalpha.com/education/quant-ratings)
- [Seeking Alpha Factor Grades FAQ](https://help.seekingalpha.com/premium/quant-ratings-and-factor-grades-faq)
- [TradingView Brand Colors (Mobbin)](https://mobbin.com/colors/brand/tradingview)
- [TradingView Custom Themes API](https://www.tradingview.com/charting-library-docs/latest/customization/styles/custom-themes/)
- [TradingView Minimalistic Watchlist](https://www.tradingview.com/blog/en/minimalistic-display-mode-for-watchlist-41721/)
- [Webull Trading Platforms](https://www.webull.com/trading-platforms)
- [StockBrokers Webull Review](https://www.stockbrokers.com/review/webull)
- [PLUSX 토스증권 UX 분석](https://brunch.co.kr/@plusx/71)
- [OpenSurvey 증권앱 UX 비교](https://blog.opensurvey.co.kr/article/ux-finance-app-3/)
- [TDS 컬러 시스템 업데이트](https://toss.tech/article/tds-color-system-update)

### 디자인 시스템 참고

- [Financial Dashboard Color Palettes (Phoenix Strategy)](https://www.phoenixstrategy.group/blog/best-color-palettes-for-financial-dashboards)
- [Color Theory in Finance Dashboards (Medium)](https://medium.com/@extej/the-role-of-color-theory-in-finance-dashboard-design-d2942aec9fff)
- [Fintech Design Guide (Eleken)](https://www.eleken.co/blog-posts/modern-fintech-design-guide)
- [Dashboard Design Principles 2026 (DesignRush)](https://www.designrush.com/agency/ui-ux-design/dashboard/trends/dashboard-design-principles)
- [StockCharts Traffic Light Indicator](https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/traffic-light)
