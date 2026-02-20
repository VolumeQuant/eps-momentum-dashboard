# AI 종목 브리핑 US — UI/UX Design Specification v1.0

> Comprehensive design document for the EPS Momentum Dashboard web application.
> Target: React 19 + TailwindCSS 4 + Recharts 2 + Vite 6

---

## Table of Contents

1. [Design Philosophy & Principles](#1-design-philosophy--principles)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Overall Layout & Navigation](#4-overall-layout--navigation)
5. [Dashboard Page — Main View](#5-dashboard-page--main-view)
6. [Component Design Details](#6-component-design-details)
7. [Data Visualization](#7-data-visualization)
8. [Ticker Detail Page](#8-ticker-detail-page)
9. [Portfolio Tracker Page](#9-portfolio-tracker-page)
10. [Interactive Patterns & Web Advantages](#10-interactive-patterns--web-advantages)
11. [Responsive Design](#11-responsive-design)
12. [Animation & Transitions](#12-animation--transitions)
13. [Iconography & Emoji Guidelines](#13-iconography--emoji-guidelines)
14. [Reference Site Inspirations](#14-reference-site-inspirations)
15. [Implementation Priority](#15-implementation-priority)

---

## 1. Design Philosophy & Principles

### Core Identity
This is a **Korean-language investment briefing tool** for individual investors tracking ~916 US stocks. The tone should be **approachable yet trustworthy** — inspired by Toss Securities' friendly Korean fintech voice, but with the data density that serious investors expect.

### Design Principles

1. **Progressive Disclosure (점진적 공개)**
   - Show the conclusion first, details on demand
   - The dashboard tells a story: "How's the market?" → "What should I buy?" → "What's in my portfolio?"
   - Never overwhelm; let users drill down

2. **Signal Over Noise (신호 > 잡음)**
   - Emphasize actionable information: the traffic lights, the top 5, the final action
   - De-emphasize reference data: raw numbers, historical tables
   - Use color and size to create instant visual hierarchy

3. **Trust Through Transparency (투명성을 통한 신뢰)**
   - Always show the "why": why a stock is ranked here, why this action is recommended
   - Show the system's track record (forward test results) prominently
   - Date stamps everywhere — users must know data freshness

4. **Dark Mode Native (어둠 속의 빛)**
   - Dark theme is not an afterthought; it is the only theme
   - Financial data is easier to scan on dark backgrounds
   - Use light-on-dark for data, color accents for signals

### Anti-Patterns to Avoid
- Do NOT recreate Bloomberg Terminal density — our users are individuals, not traders
- Do NOT use red/green alone for up/down — use shapes and labels too
- Do NOT auto-refresh or simulate real-time — data is daily; be honest about it
- Do NOT hide the date selector — temporal context is critical

---

## 2. Color System

### Base Palette (Dark Theme)

```
Background Layers:
  --bg-deep:       #0B1120    (page background — deeper than slate-900)
  --bg-surface:    #111827    (card background — gray-900)
  --bg-elevated:   #1E293B    (elevated cards, modals — slate-800)
  --bg-hover:      #283548    (hover state on cards/rows)
  --bg-active:     #334155    (active/pressed state — slate-700)

Borders:
  --border-subtle:  #1E293B   (barely visible divider)
  --border-default: #2D3B4E   (card borders)
  --border-strong:  #475569   (emphasized borders)

Text:
  --text-primary:   #F1F5F9   (slate-100 — headings, primary data)
  --text-secondary: #CBD5E1   (slate-300 — body text, descriptions)
  --text-tertiary:  #94A3B8   (slate-400 — labels, captions)
  --text-muted:     #64748B   (slate-500 — disabled, placeholder)
```

### Semantic Colors

```
Positive / Bullish:
  --green-primary:  #34D399   (emerald-400 — primary positive)
  --green-bg:       #064E3B   (emerald-900 — positive backgrounds)
  --green-subtle:   rgba(52, 211, 153, 0.1)  (very subtle positive tint)

Negative / Bearish:
  --red-primary:    #F87171   (red-400 — primary negative)
  --red-bg:         #7F1D1D   (red-900 — negative backgrounds)
  --red-subtle:     rgba(248, 113, 113, 0.1)

Warning / Caution:
  --amber-primary:  #FBBF24   (amber-400)
  --amber-bg:       #78350F   (amber-900)

Info / Neutral:
  --blue-primary:   #60A5FA   (blue-400)
  --blue-bg:        #1E3A5F   (custom blue dark)

Accent (Brand):
  --accent:         #34D399   (emerald-400 — links, active nav, CTAs)
  --accent-hover:   #6EE7B7   (emerald-300 — hover state)
  --accent-muted:   #059669   (emerald-600 — active buttons)
```

### Season Colors (4-Season Model)

```
Spring (Q1 봄):     #F9A8D4   (pink-300)   bg: rgba(249, 168, 212, 0.15)
Summer (Q2 여름):   #FCD34D   (amber-300)  bg: rgba(252, 211, 77, 0.15)
Autumn (Q3 가을):   #FB923C   (orange-400)  bg: rgba(251, 146, 60, 0.15)
Winter (Q4 겨울):   #93C5FD   (blue-300)   bg: rgba(147, 197, 253, 0.15)
```

### Signal Light Colors

```
Green Light:  #34D399  (safe/stable)
Red Light:    #F87171  (warning/danger)
Amber Light:  #FBBF24  (mixed/caution)
```

### Tailwind Custom Theme Extension

```js
// tailwind.config.js (conceptual — Tailwind v4 uses CSS variables)
colors: {
  surface: {
    deep: '#0B1120',
    DEFAULT: '#111827',
    elevated: '#1E293B',
  },
  season: {
    spring: '#F9A8D4',
    summer: '#FCD34D',
    autumn: '#FB923C',
    winter: '#93C5FD',
  }
}
```

---

## 3. Typography

### Font Stack
```css
font-family: 'Pretendard', 'Inter', system-ui, -apple-system, sans-serif;
```

Use **Pretendard** as the primary font (optimal for Korean + English mixed text). Fallback to Inter for pure English contexts.

### Scale

| Purpose | Size | Weight | Tailwind Class | Usage |
|---------|------|--------|----------------|-------|
| Page Title | 24px | 700 (bold) | `text-2xl font-bold` | "AI 종목 브리핑" |
| Section Title | 18px | 600 (semibold) | `text-lg font-semibold` | "시장 현황", "매수 후보" |
| Card Title | 14px | 600 | `text-sm font-semibold` | Card headers |
| Body | 14px | 400 | `text-sm` | General content |
| Data Value (large) | 28px | 700 | `text-3xl font-bold font-mono` | Hero metrics |
| Data Value (medium) | 20px | 700 | `text-xl font-bold font-mono` | Card metrics |
| Data Value (small) | 14px | 500 | `text-sm font-medium font-mono` | Table cells |
| Caption | 12px | 400 | `text-xs` | Labels, timestamps |
| Micro | 10px | 500 | `text-[10px] font-medium` | Badges, tags |

### Monospace for Numbers
All financial numbers (prices, percentages, scores) must use `font-mono` to ensure alignment:
```
font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
```

---

## 4. Overall Layout & Navigation

### Architecture: Single-Page Dashboard with Drill-Down Routes

```
/                    → Dashboard (main view — all daily data)
/ticker/:ticker      → Ticker Detail (deep dive on one stock)
/portfolio           → Portfolio Tracker (forward test history)
```

This is correct and should remain as-is. Do NOT add more pages. The power is in the dashboard.

### Navigation Bar (Header) — Redesign

The current header is functional but lacks brand personality. Redesign:

```
┌─────────────────────────────────────────────────────────────┐
│  🔬 AI 종목 브리핑 US          Dashboard   Portfolio   v31  │
│                                 ────────                    │
│                              [2026-02-20 ▼]                 │
└─────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Height: `h-14` (56px) — slightly more compact than current `h-16`
- Background: `bg-[#111827]` with `border-b border-[#2D3B4E]`
- Logo: "AI 종목 브리핑 US" in `text-lg font-bold text-emerald-400` with a subtle icon (microscope or chart pulse)
- Nav links: Pill style with active state `bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded-lg`
- Inactive links: `text-slate-400 hover:text-slate-200`
- Version badge: `text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded`
- Date selector: Moved INTO the header, right-aligned. Style as a subtle dropdown, not a big select
- **CRITICAL**: Add a "Last updated" timestamp next to the date: `text-xs text-slate-500`

### Date Selector Enhancement
Replace the basic `<select>` with a styled dropdown:
- Show only last 30 days in the dropdown
- Highlight weekdays vs weekends (weekends should be disabled/grayed)
- Show "오늘" badge next to the latest available date
- Left/right arrow buttons for quick prev/next day navigation

### Layout Grid
Main content area: `max-w-[1440px] mx-auto px-6`
- Wider than current `max-w-7xl` (1280px) to give the table more room

---

## 5. Dashboard Page — Main View

### Story Flow Architecture

The dashboard tells a story in 4 visual "acts", flowing top to bottom. Each act maps to the Telegram message flow:

```
┌─ ACT 1: Market Pulse ─────────────────────────────────────┐
│ [Season Card]  [HY+VIX Card]  [Signal Lights]  [Action]   │
│ [S&P 500] [NASDAQ] [DOW]                                  │
└────────────────────────────────────────────────────────────┘

┌─ ACT 2: Buy Candidates ───────────────────────────────────┐
│ [Top 30 Table — full width]                                │
│ Grouped: ✅ Verified → ⏳ Pending → 🆕 New                │
└────────────────────────────────────────────────────────────┘

┌─ ACT 3: Final Portfolio ────────┐  ┌─ ACT 3B: Sidebar ───┐
│ [5 Holdings — visual cards]     │  │ [Death List]         │
│                                 │  │ [Top Industries]     │
│                                 │  │ [AI Risk Summary]    │
└─────────────────────────────────┘  └──────────────────────┘

┌─ ACT 4: Track Record ─────────────────────────────────────┐
│ [Cumulative Return Mini Chart]  [Win Rate]  [Trade Stats]  │
└────────────────────────────────────────────────────────────┘
```

### Section Spacing
- Between acts: `space-y-8` (32px)
- Between cards within an act: `gap-4` (16px) or `gap-6` (24px)
- Section dividers: NO horizontal rules. Use vertical spacing + section headers only.

### Section Headers

Each act gets a section header styled like a news section:

```html
<div class="flex items-center gap-3 mb-4">
  <div class="w-1 h-6 bg-emerald-500 rounded-full"></div>
  <h2 class="text-lg font-semibold text-slate-100">시장 현황</h2>
  <span class="text-xs text-slate-500">Market Pulse</span>
</div>
```

The green bar on the left acts as a section indicator (inspired by Seeking Alpha section markers).

---

## 6. Component Design Details

### 6.1 Market Pulse — Season + Risk Combined Card

**This is the HERO element of the dashboard.** It should immediately communicate:
1. What season are we in?
2. Should I be buying or selling?

#### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   🌸 봄 (회복국면) — 47일째                          🟢🟢 2/2 안정  │
│   ──────────────────────────                                         │
│   모든 지표가 매수를 가리켜요. 적극 투자하세요!                      │
│                                                                      │
│   ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐    │
│   │  🏦 HY Spread│  │  ⚡ VIX      │  │  📊 시장 지수           │    │
│   │  3.42%       │  │  14.2        │  │  S&P  6,144  +0.24%    │    │
│   │  중위수 이상, │  │  32nd 안정   │  │  NDQ  20,041 +0.07%    │    │
│   │  하락 중     │  │              │  │  DOW  44,627 +0.16%    │    │
│   └──────────────┘  └──────────────┘  └─────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

#### Design Details

**Season Badge (top-left):**
- Large icon: `text-4xl` for the season emoji
- Season name: `text-xl font-bold` in the season's color (see Season Colors above)
- q_days: `text-sm text-slate-400` with "일째" suffix
- Background: subtle gradient using the season color at 5-10% opacity
  - Spring: `bg-gradient-to-r from-pink-500/5 to-transparent`
  - Summer: `bg-gradient-to-r from-amber-500/5 to-transparent`
  - etc.

**Signal Lights (top-right):**
- Two large circles (24x24px): `w-6 h-6 rounded-full`
- Green: `bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]` (glow effect!)
- Red: `bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.5)]`
- Below: "2/2 안정" or "위험 신호" in matching color
- **The glow effect is key** — makes the lights look "lit up" on dark background

**Final Action (center):**
- `text-base font-medium text-slate-200`
- Prefix arrow: `→`
- If positive action: `text-emerald-300`
- If cautionary: `text-amber-300`
- If negative: `text-red-300`

**HY Spread Sub-Card:**
```
bg-[#111827] border border-[#2D3B4E] rounded-xl p-4
```
- Icon + label row: `text-xs text-slate-400 uppercase tracking-wider`
- Value: `text-2xl font-bold font-mono text-slate-100`
- Subtitle: `text-xs text-slate-400` (e.g., "중위수 3.52% · 평균 이상이지만 하락 중")
- Add a tiny sparkline (last 30 days of HY spread) — 40px tall, no axes, just the line

**VIX Sub-Card:**
- Same structure as HY
- Add VIX percentile as a small horizontal bar:
  ```
  ├────────█─────────┤ 32nd percentile
  ```
  - Bar: `h-1.5 rounded-full bg-slate-700` container, filled portion in color based on regime
  - Normal: `bg-emerald-400`, Elevated: `bg-amber-400`, Crisis: `bg-red-400`

**Market Indices Sub-Card:**
- Three rows, each: `icon name price change%`
- Price in `font-mono text-slate-200`
- Change: green/red with sign, `font-mono font-semibold`
- Tiny inline sparkline (optional, 5-day price) — 60px wide, 16px tall

#### Tailwind Implementation

```jsx
<div className="relative overflow-hidden rounded-2xl border border-[#2D3B4E] bg-[#111827]">
  {/* Season gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent pointer-events-none" />

  <div className="relative p-6">
    {/* Top row: Season + Signal */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🌸</span>
        <div>
          <h2 className="text-xl font-bold text-pink-300">봄 (회복국면)</h2>
          <span className="text-sm text-slate-400">47일째</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
          <div className="w-5 h-5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
        </div>
        <span className="text-xs text-emerald-400 font-medium">2/2 안정</span>
      </div>
    </div>

    {/* Action line */}
    <p className="text-base text-emerald-300 font-medium mb-6">
      → 모든 지표가 매수를 가리켜요. 적극 투자하세요!
    </p>

    {/* Sub-cards grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* HY, VIX, Indices cards here */}
    </div>
  </div>
</div>
```

---

### 6.2 Candidates Table — The Core Data Table

This is where users spend most of their time. It must be **scannable, sortable, and beautiful**.

#### Problems with Current Implementation
1. All 30 rows look the same — no visual hierarchy
2. No grouping by verification status
3. Weather icons (emoji) are tiny and hard to parse
4. No hover detail or expansion
5. Rank column wastes space with circle badges

#### Redesigned Table

**Structure: Grouped by Status**

```
✅ 검증 완료 (3일 연속) ──────────────── 12종목
┌─────┬──────┬────────┬───────┬─────────┬─────────┬────────┬──────────┬──────┐
│ #   │ 종목 │ 업종   │  가격 │ 점수    │ 괴리율  │ 매출   │ 트렌드   │ 순위 │
├─────┼──────┼────────┼───────┼─────────┼─────────┼────────┼──────────┼──────┤
│  1  │ NVDA │ 반도체 │$878.4 │  32.1   │ -12.4%  │ +24.1% │ ████████ │ 3→1  │
│  2  │ META │ 인터넷 │$612.3 │  28.7   │  -8.2%  │ +18.3% │ ██████░░ │ 1→2  │
│     │      │        │       │         │         │        │          │      │
└─────┴──────┴────────┴───────┴─────────┴─────────┴────────┴──────────┴──────┘

⏳ 검증 대기 (2일째) ──────────────────── 8종목
[similar rows, slightly muted]

🆕 신규 진입 (오늘 처음) ──────────────── 10종목
[similar rows, with "NEW" visual highlight]
```

**Key Design Decisions:**

1. **Group headers** as sticky section dividers with count badges
2. **Top 5 highlight**: First 5 rows get a left border accent `border-l-2 border-emerald-500`
3. **Buffer zone indicator**: Rows 21-35 get a subtle dimming `opacity-70` with a thin dashed border at row 20
4. **No circle badges for rank** — just the number, bold, monospace
5. **Ticker column**: Show ticker + name (e.g., "NVDA" with "NVIDIA" as subtitle in `text-xs text-slate-500`)

#### Weather Trend — Redesigned as Mini Bar Chart

Replace the 4 emoji weather icons with a **4-segment mini heatmap bar**:

```
Segments: [S1][S2][S3][S4]  (past → present)
Each segment: 6px wide, 20px tall
Color mapping:
  >20%  → #34D399 (emerald-400) — deep green
  5~20% → #6EE7B7 (emerald-300) — medium green
  1~5%  → #86EFAC (emerald-200) — light green
  ±1%   → #475569 (slate-600)   — gray (flat)
  <-1%  → #F87171 (red-400)     — red
```

This creates an at-a-glance "trend direction" that is far more scannable than emojis. On hover, show a tooltip with the actual percentages and weather labels.

#### Tailwind Implementation for Trend Bar

```jsx
function TrendBar({ seg1, seg2, seg3, seg4 }: TrendIconProps) {
  const segments = [seg1, seg2, seg3, seg4];

  const getColor = (val: number) => {
    if (val > 20) return 'bg-emerald-400';
    if (val > 5)  return 'bg-emerald-300';
    if (val > 1)  return 'bg-emerald-200/60';
    if (val > -1) return 'bg-slate-600';
    return 'bg-red-400';
  };

  return (
    <div className="flex gap-0.5 items-end h-5">
      {segments.map((val, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-sm ${getColor(val)}`}
          style={{ height: `${Math.min(Math.max(Math.abs(val) * 1.5 + 4, 4), 20)}px` }}
          title={`S${i + 1}: ${val > 0 ? '+' : ''}${val.toFixed(1)}%`}
        />
      ))}
    </div>
  );
}
```

#### Row Interaction

- **Hover**: Entire row highlights with `bg-[#283548]` + left accent bar appears
- **Click**: Navigates to `/ticker/:ticker`
- **Hover on ticker**: Show a mini popup card (200x150px) with:
  - 30-day price sparkline
  - Current rank vs 5-day average rank
  - Key risk flags

#### Column Specifications

| Column | Width | Align | Content |
|--------|-------|-------|---------|
| Rank (#) | 48px | center | Bold number, top 5 in emerald |
| Status | 80px | center | Pill badge (Verified/Pending/New) |
| Ticker | 120px | left | Ticker bold + company name subtitle |
| Industry | 120px | left | Korean label, truncated with tooltip |
| Price | 90px | right | `$XXX.XX` monospace |
| Adj Score | 80px | right | Colored by threshold |
| Adj Gap | 90px | right | Colored, with % sign |
| Rev Growth | 90px | right | Green if positive |
| Trend | 48px | center | 4-segment mini bar |
| Analysts | 70px | center | `↑3 ↓1` format |
| Rank Hist | 80px | left | `3→4→1` monospace |

#### Sorting
- Clickable column headers with sort arrows
- Default: Part2 Rank ascending
- Sortable: Score, Gap, Rev Growth, Price
- Sort indicator: `▲` or `▼` next to column name

#### Risk Flags Inline
Show small icon badges next to ticker for risk flags:
- `⚠` if high PE (fwd_pe > 100)
- `📉` if revenue downgrade >30%
- `📊` if low analyst coverage (<3)
- `📅` if earnings within 2 weeks

---

### 6.3 Portfolio Card — The "My Holdings" Widget

Redesign from a list to **visual stock cards**:

```
┌──────────────────────────────────────────────────┐
│  최종 추천 포트폴리오 (5종목, 균등 20%씩)         │
│                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐              │
│  │  NVDA  │  │  META  │  │  AVGO  │              │
│  │ ENTER  │  │  HOLD  │  │  HOLD  │              │
│  │ $878   │  │ $612   │  │ $198   │              │
│  │ +2.4%  │  │ +5.1%  │  │ -1.2%  │              │
│  │ ██████ │  │ █████  │  │ ████   │              │
│  └────────┘  └────────┘  └────────┘              │
│                                                  │
│  ┌────────┐  ┌────────┐                          │
│  │  PLTR  │  │  APP   │                          │
│  │  HOLD  │  │ ENTER  │                          │
│  │ $95.2  │  │ $412   │                          │
│  │ +12.3% │  │  --    │                          │
│  │ ██████ │  │ ████   │                          │
│  └────────┘  └────────┘                          │
│                                                  │
│  Total Unrealized: +4.7%        View Full →      │
└──────────────────────────────────────────────────┘
```

#### Individual Stock Card

```jsx
<div className="bg-[#0B1120] border border-[#2D3B4E] rounded-xl p-4 w-[140px]
                hover:border-emerald-500/50 transition-all cursor-pointer group">
  {/* Action badge */}
  <div className="mb-2">
    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600/20
                     text-emerald-400 border border-emerald-600/30">
      ENTER
    </span>
  </div>

  {/* Ticker */}
  <div className="text-lg font-bold text-slate-100 group-hover:text-emerald-400
                  transition-colors">
    NVDA
  </div>

  {/* Price */}
  <div className="text-sm font-mono text-slate-300 mt-1">$878.40</div>

  {/* Return */}
  <div className="text-lg font-bold font-mono text-emerald-400 mt-2">+2.4%</div>

  {/* Mini sparkline: 10-day price */}
  <div className="mt-2 h-8">
    {/* tiny recharts sparkline */}
  </div>
</div>
```

#### Exited Stocks (within the card)
Show as a collapsed section below active holdings:
```
── 오늘 퇴출 (1종목) ──
TSLA  EXIT  $342 → $338  -1.2%
```
Use `text-slate-500` with strikethrough effect on the ticker to convey "gone".

---

### 6.4 Death List — Exits with Dignity

The current implementation is too plain. Make it more informative:

```
┌──────────────────────────────────────────────┐
│  ⚡ 이탈 종목 (Death List)                    │
│  어제 후보에서 오늘 빠진 종목                  │
│                                              │
│  TSLA  #12 → OUT   이유: adj_gap > 0          │
│  ├─ 3일 전 #8 → #10 → #12 → 탈락             │
│  └─ 3일 연속 순위 하락                        │
│                                              │
│  AMD   #28 → OUT   이유: score < 9            │
│  ├─ 5일 전 #15 → #18 → #22 → #28 → 탈락      │
│  └─ 급격한 순위 하락 (매출 추정치 하향)        │
│                                              │
│  빠진 종목이 없으면? → "오늘은 이탈 종목이     │
│  없어요. 안정적인 시장이에요 ✌️"               │
└──────────────────────────────────────────────┘
```

**Design:**
- Card background: `bg-[#111827]` (same as other cards, NOT red-tinted)
- Exit icon: Use `↘` or a small downward arrow, NOT skull/death imagery
- Each exit row: Ticker in `text-slate-400` (not red — de-emphasize), reason in `text-xs text-slate-500`
- Optional: rank trajectory as small inline sparkline showing decline
- Empty state: Friendly message in `text-slate-500` — this is a GOOD thing

---

### 6.5 Industry Distribution — Treemap or Horizontal Bars

Replace the current simple list with a **horizontal stacked bar chart** or **mini treemap**:

#### Option A: Horizontal Bars (Recommended — simpler, more readable)

```
반도체          ████████████████████  8
소프트웨어       ████████████         5
인터넷 콘텐츠    ████████             3
헬스케어        ██████               2
금융서비스       ████                 2
기타                                10
```

- Each bar: `h-6 rounded-r` with industry color
- Industry colors: Assign 8 fixed colors to top 8 industries, rest get `slate-600`
- Animate bars on load (width from 0 to final)
- Click an industry bar → filter the candidates table to that industry

#### Option B: Bubble/Treemap (More visual, harder to implement)

If using a library like `recharts` Treemap component:
- Each rectangle shows industry name + count
- Size = count, Color = avg adj_score of that industry (green = high, blue = low)

**Recommendation: Start with Option A**, add Option B later if desired.

---

## 7. Data Visualization

### 7.1 Chart Style Guide (Global)

All charts should share these settings:

```jsx
const chartTheme = {
  background: 'transparent',  // card provides the background
  gridColor: '#1E293B',       // very subtle grid
  gridDash: '3 3',
  axisColor: '#475569',
  tickColor: '#64748B',
  tickFontSize: 11,
  tooltipBg: '#1E293B',
  tooltipBorder: '#334155',
  tooltipRadius: 12,
  tooltipFontSize: 12,
}
```

### 7.2 VIX Percentile Gauge

A semicircular gauge showing where VIX sits in its 252-day range:

```
         ┌──────────────┐
        ╱    ╱    ╱    ╲ ╲
      ╱ 안일 ╱ 정상 ╱경계╲상승╲
    ╱      ╱      ╱     ╲    ╲
   ╱──────╱──────╱───────╲────╲
              ▲
           32nd pct
```

Zones:
- 0-10: Yellow (Complacency)
- 10-67: Green (Normal)
- 67-80: Amber (Elevated)
- 80-90: Orange (High)
- 90-100: Red (Crisis)

Implementation: Use SVG arcs or a D3-based gauge. Recharts doesn't have a native gauge, so consider a custom SVG component.

Simpler alternative: A horizontal "thermometer" bar (easier to implement):

```jsx
<div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden">
  {/* Zone backgrounds */}
  <div className="absolute inset-y-0 left-0 w-[10%] bg-amber-500/30" />
  <div className="absolute inset-y-0 left-[10%] w-[57%] bg-emerald-500/30" />
  <div className="absolute inset-y-0 left-[67%] w-[13%] bg-amber-500/30" />
  <div className="absolute inset-y-0 left-[80%] w-[10%] bg-orange-500/30" />
  <div className="absolute inset-y-0 left-[90%] w-[10%] bg-red-500/30" />

  {/* Indicator */}
  <div
    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white
               border-2 border-emerald-400 shadow-lg z-10"
    style={{ left: `${percentile}%` }}
  />
</div>
```

### 7.3 Season Timeline (HY Quadrant History)

A horizontal timeline showing the last 252 business days colored by quadrant:

```
[Spring Spring Spring | Summer Summer | Autumn | Winter Winter ← TODAY]
```

- Each day = 1px-2px wide colored stripe
- Colors match season palette
- Current position highlighted with a marker
- q_days count shown above the current segment

Implementation: Simple `<div>` of 252 tiny `<span>` elements, each colored by quadrant.

### 7.4 Score Distribution Chart (on Dashboard)

Small histogram showing the distribution of adj_scores across all 30 candidates:

```
     ▄
   ▄ █ ▄
 ▄ █ █ █ ▄
 █ █ █ █ █ ▄
─────────────
 9  15 20 25 30+
```

- X: adj_score buckets
- Y: count
- Color: emerald gradient (darker = higher score)

### 7.5 Ticker Detail Page Charts (Enhanced)

**Price + MA60 Chart:**
- Area chart (not just line) with gradient fill below the price line
- MA60 as dashed line
- Volume bars at the bottom (if available)
- Crosshair on hover showing price, date, volume

**Adj Score Chart:**
- Area chart with emerald gradient
- Reference line at score = 9 (minimum threshold) as dashed red
- Highlight zones: < 9 as red-tinted background, > 15 as green-tinted

**Adj Gap Chart:**
- Bar chart (not line!) — positive bars in red, negative in green (inverted for finance: negative gap = undervalued = good)
- Reference line at 0

---

## 8. Ticker Detail Page

### Redesigned Layout

```
┌─ Breadcrumb ──────────────────────────────────────────────┐
│  ← Dashboard / NVDA  NVIDIA Corp.          반도체          │
└───────────────────────────────────────────────────────────┘

┌─ Hero Section ────────────────────────────────────────────┐
│  NVDA                                       ✅ 검증완료   │
│  $878.40  (+2.4%)                   Rank #1 (3→4→1)      │
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Adj Score│ │ Adj Gap  │ │ Fwd P/E  │ │ NTM EPS  │     │
│  │   32.1   │ │  -12.4%  │ │   28.3x  │ │  $31.04  │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Mkt Cap  │ │Rev Growth│ │ Analysts │ │Price>MA60│     │
│  │  $2.1T   │ │  +24.1%  │ │ ↑12 ↓2   │ │  +8.3%  │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
└───────────────────────────────────────────────────────────┘

┌─ Charts (tabbed) ─────────────────────────────────────────┐
│  [가격 차트]  [점수 추이]  [괴리율 추이]                    │
│  ┌────────────────────────────────────────────────────┐   │
│  │                                                    │   │
│  │         Price + MA60 Area Chart                    │   │
│  │         (with volume bars)                         │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘

┌─ EPS Trend (4 Segments) ──────────────────────────────────┐
│  ┌─S1──────┐  ┌─S2──────┐  ┌─S3──────┐  ┌─S4──────┐     │
│  │ +24.1%  │  │ +18.3%  │  │  +8.7%  │  │ +32.1%  │     │
│  │ 🔥 Hot  │  │ ☀️ Warm │  │ ☀️ Warm │  │ 🔥 Hot  │     │
│  │ (90d→)  │  │ (60d→)  │  │ (30d→)  │  │ (now)   │     │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │
└───────────────────────────────────────────────────────────┘

┌─ Risk Flags ──────────────────────────────────────────────┐
│  No risk flags detected. ✅                               │
│  (or: ⚠️ 고평가 fwd_pe=105, 📅 실적발표 2/28)            │
└───────────────────────────────────────────────────────────┘

┌─ Historical Data Table ───────────────────────────────────┐
│  [Compact table — last 30 days, same as current]          │
└───────────────────────────────────────────────────────────┘
```

### Key Improvements

1. **Hero metrics as cards** — 2 rows of 4, each with clear label, value, and color coding
2. **Tabbed charts** — Save vertical space, let user switch between chart types
3. **4-Segment EPS Trend** — Instead of just emoji, show actual cards with percentage, label, and time period
4. **Risk flags** — Dedicated section showing all applicable risk filters
5. **Breadcrumb** — Always show path back to dashboard

---

## 9. Portfolio Tracker Page

### Current State Assessment
The current implementation is already quite good. Enhancements:

### Additions

1. **Portfolio Value Chart (equity curve)**
   - Instead of just cumulative return from exits, show a daily portfolio value curve
   - Mark enter/exit events as dots on the curve

2. **Calendar Heatmap** (inspired by GitHub contributions)
   - Each day shows green (gain) / red (loss) / gray (no data)
   - Like TradingView's performance calendar
   - Shows patterns: "we tend to lose money on Mondays" etc.

3. **Holdings Duration Chart**
   - Horizontal bars showing how long each position was held
   - Color: green if profitable, red if not

4. **T-Stat Progress**
   - Since the goal is t-stat >= 3.0 (Harvey et al.), show a progress indicator:
   ```
   Target: t-stat ≥ 3.0
   Current: 1.8 ██████████░░░░░  60%
   Need ~24 more profitable trades
   ```

---

## 10. Interactive Patterns & Web Advantages

### 10.1 Hover Effects

**Table Row Hover:**
```css
.candidate-row {
  @apply transition-all duration-150 ease-out;
}
.candidate-row:hover {
  @apply bg-[#283548] shadow-lg shadow-emerald-500/5;
  transform: translateX(2px);  /* subtle right-shift */
}
```

**Card Hover (portfolio cards, metric cards):**
```css
.metric-card:hover {
  @apply border-emerald-500/30 bg-[#1a2a3d];
  transform: translateY(-1px);
}
```

### 10.2 Click Interactions

| Element | Click Action |
|---------|-------------|
| Ticker in table | Navigate to `/ticker/:ticker` |
| Industry in table | Filter table to that industry (toggle) |
| Season badge | Expand to show season timeline |
| Signal lights | Expand to show detailed HY+VIX data |
| Portfolio stock card | Navigate to `/ticker/:ticker` |
| Industry bar chart | Filter candidates to that industry |
| Column header | Sort table by that column |

### 10.3 Expand/Collapse (Progressive Disclosure)

**Season + Risk section:**
- Default: Show compressed 1-line summary (season + signal + action)
- Click "자세히" → Expand to show full HY data, VIX gauge, index changes
- This mirrors the Toss Securities approach of showing the key info first

**Death List:**
- Default: Show just ticker + exit reason (1 line each)
- Click a ticker → Expand to show rank trajectory, detailed metrics at time of exit

### 10.4 Keyboard Navigation

- `←` `→` arrow keys: Navigate between dates
- `j` / `k`: Move up/down in candidates table
- `Enter`: Open selected ticker detail
- `Esc`: Go back to dashboard
- `/`: Focus search (if we add ticker search)

### 10.5 Ticker Quick Search

Add a search input (not currently present):
```
┌─────────────────────────────────────┐
│  🔍 종목 검색 (AAPL, 반도체...)     │
└─────────────────────────────────────┘
```
- Live filter as user types
- Search by ticker symbol, industry name (Korean)
- Show in header or as a floating button

### 10.6 Comparison Mode

Allow selecting 2-3 stocks to compare side-by-side:
- Checkbox column in candidates table
- "비교하기" floating button appears when 2+ selected
- Comparison view: side-by-side metric cards + overlaid chart lines

### 10.7 Historical Browsing Animation

When changing dates via the date selector:
- Slide transition (left = newer date, right = older date)
- Brief fade on data changing
- "Delta indicators" showing what changed: ↑2 (rank improved), NEW, EXIT

---

## 11. Responsive Design

### Breakpoints

| Breakpoint | Name | Target |
|------------|------|--------|
| < 640px | `sm` | Phone portrait |
| 640-768px | `md` | Phone landscape / small tablet |
| 768-1024px | `lg` | Tablet |
| 1024-1440px | `xl` | Desktop |
| > 1440px | `2xl` | Large desktop |

### Mobile Layout (< 640px)

**Dashboard transforms to a vertical card stack:**

1. Market Pulse: Full width, season + signal visible. Sub-cards stack vertically.
2. Candidates: Switch from table to **card list**:
   ```
   ┌────────────────────────────┐
   │ #1  NVDA  ✅ 검증           │
   │ 반도체 · $878.40            │
   │                            │
   │ Score: 32.1  Gap: -12.4%   │
   │ Rev: +24.1%  ████████      │
   │ Rank: 3 → 4 → 1           │
   └────────────────────────────┘
   ```
   Each candidate becomes a card with horizontal swipe to see more
3. Portfolio: Horizontal scroll for the 5 stock cards
4. Death List: Accordion-style

**Table → Card Transition:**
```jsx
{/* Desktop: table */}
<div className="hidden lg:block">
  <CandidatesTable ... />
</div>

{/* Mobile: card list */}
<div className="lg:hidden space-y-3">
  {candidates.map(c => <CandidateCard key={c.ticker} {...c} />)}
</div>
```

### Tablet Layout (768-1024px)
- Sidebar moves below the table (stacks to single column)
- Candidates table keeps table format but hides Mkt Cap and Rank History columns
- Portfolio cards: 3 per row (instead of 5)

### Desktop Layout (> 1024px)
- Full layout as specified in the wireframes above
- Sidebar visible on the right (Death List + Industries)

---

## 12. Animation & Transitions

### Page Load Sequence

Staggered entrance animation (inspired by Webull's card loading):

```
Frame 0:    Market Pulse card fades in
Frame 100:  Stats cards slide up + fade in (left to right, 50ms stagger)
Frame 300:  Candidates table fades in (instant, no stagger per row)
Frame 400:  Sidebar cards slide in from right
```

Implementation with Tailwind + CSS:
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
}
```

Apply with index-based delay:
```jsx
<div className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
```

### Value Change Animations

When data values change (e.g., switching dates):
- Numbers: Brief color flash (white → original color over 400ms)
- Green/Red values: Pulse the background briefly
- Rank changes: Show old rank → new rank with a crossing arrow animation

### Skeleton Loading

Replace plain "Loading..." with skeleton screens:
```jsx
<div className="animate-pulse">
  <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-3" />
  <div className="h-8 bg-slate-700/50 rounded w-1/2 mb-2" />
  <div className="h-3 bg-slate-700/50 rounded w-full" />
</div>
```

Use rounded shapes that approximate the actual content dimensions.

---

## 13. Iconography & Emoji Guidelines

### When to Use Emoji
- Season icons (🌸☀️🍂❄️): YES — these are brand elements of the system
- Signal lights (🟢🔴): YES — but ALSO render as colored circles (CSS), emojis as fallback
- Weather trend (🔥☀️🌤️☁️🌧️): NO on web — replace with the mini bar chart (Section 6.2)
- Verification status (✅⏳🆕): YES in badges, but also include text labels
- Risk alerts (⚠️📅📉): YES — but small, inline

### When NOT to Use Emoji
- Navigation items
- Button labels
- Error messages
- Data values
- Column headers

### Custom Icons (SVG)
Consider using **Lucide React** icons for:
- Navigation: `Home`, `TrendingUp`, `Briefcase`
- Actions: `ArrowUpRight`, `ArrowDownRight`, `Filter`, `Search`
- Risk: `AlertTriangle`, `Calendar`, `BarChart`

```bash
npm install lucide-react
```

Lucide icons are tree-shakeable, consistent, and look great at small sizes.

---

## 14. Reference Site Inspirations

### From FINVIZ
**Borrow:**
- Heat map color coding for table cells (adj_gap column colored by value)
- Compact table layout with maximal data density
- Quick-scan industry filters above the table

**Avoid:**
- 1990s visual aesthetics
- Overwhelming number of columns
- No hover interactions

### From Seeking Alpha
**Borrow:**
- "Rating" badge system (their Quant Rating badge → our ✅⏳🆕 badges)
- Section-based article flow (Market → Analysis → Recommendation)
- Clean card designs with subtle borders

**Avoid:**
- Paywall dark patterns
- Cluttered sidebars with ads
- Over-reliance on text (we are visual-first)

### From TradingView
**Borrow:**
- Dark theme color palette (their dark theme is best-in-class)
- Chart tooltip design (clean, dark, with proper spacing)
- Crosshair interaction on charts
- The "watchlist" panel layout → similar to our portfolio card

**Avoid:**
- Complex multi-panel layouts
- Too many chart drawing tools
- Real-time streaming UX patterns (our data is daily)

### From Webull
**Borrow:**
- Mobile-first card design (their stock summary cards are excellent)
- Staggered loading animations
- "News feed" scrolling pattern (for our Death List maybe)
- Color-coded performance (green/red with proper contrast)

**Avoid:**
- Gamification elements (rockets, flames for volatile stocks)
- Notification spam patterns
- Dark patterns pushing trades

### From Toss Securities (토스증권)
**Borrow:**
- **Friendly Korean copy** — "적극 투자하세요!" not "Strong Buy Signal Detected"
- **Progressive disclosure** — show summary, tap for details
- **Clean spacing** — generous padding, breathing room between elements
- **Human-readable explanations** — "평균 이상이지만 하락 중" not "Above 10Y median, declining 3M trend"
- **Minimal use of jargon** — when jargon is needed, provide a tooltip explanation

**Avoid:**
- Over-simplification that hides important data
- Too much white space that reduces data density
- Mobile-only patterns that don't translate to desktop

---

## 15. Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. **Color system** — Update `index.css` and Tailwind config with the full palette
2. **Header redesign** — New navigation with date selector integration
3. **Market Pulse card** — The hero element with season, signals, action
4. **Candidates table** — Grouping, trend bars, sortable columns, hover effects
5. **Typography** — Pretendard font, monospace for numbers

### Phase 2: Polish (Week 3-4)
6. **Portfolio card** — Stock cards instead of list
7. **Death List** — Improved layout with reasons and rank trajectory
8. **Industry bars** — Horizontal bar chart replacing the plain list
9. **Skeleton loading** — Replace text loaders with shaped skeletons
10. **Entrance animations** — Staggered load, value transitions

### Phase 3: Interactivity (Week 5-6)
11. **Ticker detail page** — Hero section, tabbed charts, EPS segments
12. **VIX gauge** — Horizontal thermometer bar
13. **Table sorting** — Clickable column headers
14. **Ticker search** — Quick search in header
15. **Mobile responsive** — Card layout for candidates on mobile

### Phase 4: Advanced (Week 7+)
16. **Comparison mode** — Select 2-3 stocks to compare
17. **Historical diff** — Show what changed between dates
18. **Portfolio equity curve** — True daily value chart
19. **Keyboard navigation** — Power user shortcuts
20. **Hover mini-cards** — Quick preview on ticker hover

---

## Appendix: New API Endpoints Needed

To support the full design, the backend API should expose:

| Endpoint | Description | Used By |
|----------|-------------|---------|
| `GET /api/market-status/:date` | HY + VIX + concordance + final_action + market indices | Market Pulse card |
| `GET /api/screening/:date` | Current — but add `company_name`, `risk_flags[]`, `fwd_pe` fields | Candidates table |
| `GET /api/exited/:date` | Current — but add `exit_reason`, `rank_trajectory` fields | Death List |
| `GET /api/stats/:date` | Current — already sufficient | Stats cards |
| `GET /api/portfolio/:date` | Current — sufficient | Portfolio card |
| `GET /api/portfolio/history` | Current — sufficient | Portfolio page |
| `GET /api/portfolio/daily-value` | NEW: daily portfolio value for equity curve | Portfolio page |
| `GET /api/ticker/:ticker` | Current — sufficient | Ticker detail |
| `GET /api/ticker/:ticker/sparkline` | NEW: last 30 days price only (lightweight) | Hover preview, portfolio cards |
| `GET /api/hy-timeline` | NEW: last 252 days of quadrant assignments | Season timeline viz |
| `GET /api/search?q=` | NEW: ticker/industry search | Quick search |

### New TypeScript Types Needed

```typescript
export interface MarketStatus {
  date: string;
  hy: {
    hy_spread: number;
    median_10y: number;
    quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    quadrant_label: string;
    quadrant_icon: string;
    q_days: number;
    signals: string[];
    action: string;
  } | null;
  vix: {
    vix_current: number;
    vix_percentile: number;
    regime: string;
    regime_label: string;
    regime_icon: string;
    vix_slope_dir: 'rising' | 'falling' | 'flat';
    direction: 'warn' | 'stable';
  } | null;
  concordance: 'both_warn' | 'hy_only' | 'vix_only' | 'both_stable';
  final_action: string;
  indices: {
    name: string;
    value: number;
    change_pct: number;
  }[];
}

export interface RiskFlag {
  type: 'high_pe' | 'low_coverage' | 'revenue_downgrade' | 'earnings_soon';
  label: string;
  detail: string;
}
```

---

## Appendix: Tailwind v4 CSS Variable Setup

Since the project uses Tailwind v4 (CSS-first configuration), add these to `index.css`:

```css
@import "tailwindcss";

@theme {
  --color-surface-deep: #0B1120;
  --color-surface-default: #111827;
  --color-surface-elevated: #1E293B;

  --color-season-spring: #F9A8D4;
  --color-season-summer: #FCD34D;
  --color-season-autumn: #FB923C;
  --color-season-winter: #93C5FD;

  --color-signal-green: #34D399;
  --color-signal-red: #F87171;
  --color-signal-amber: #FBBF24;
}

body {
  margin: 0;
  min-height: 100vh;
  background-color: var(--color-surface-deep);
  color: #F1F5F9;
  font-family: 'Pretendard', 'Inter', system-ui, -apple-system, sans-serif;
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #0B1120;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* Number animation for value changes */
@keyframes flash-green {
  0% { background-color: rgba(52, 211, 153, 0.3); }
  100% { background-color: transparent; }
}
@keyframes flash-red {
  0% { background-color: rgba(248, 113, 113, 0.3); }
  100% { background-color: transparent; }
}
.flash-positive { animation: flash-green 0.5s ease-out; }
.flash-negative { animation: flash-red 0.5s ease-out; }
```

---

*End of Design Specification v1.0*
*Last updated: 2026-02-20*
