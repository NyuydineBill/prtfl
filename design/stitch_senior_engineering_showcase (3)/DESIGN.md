---
name: Architectural Logic
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bec8d2'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#88929b'
  outline-variant: '#3e4850'
  surface-tint: '#89ceff'
  primary: '#89ceff'
  on-primary: '#00344d'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#006591'
  secondary: '#b9c8de'
  on-secondary: '#233143'
  secondary-container: '#39485a'
  on-secondary-container: '#a7b6cc'
  tertiary: '#3cddc7'
  on-tertiary: '#003731'
  tertiary-container: '#00af9d'
  on-tertiary-container: '#003b34'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#d4e4fa'
  secondary-fixed-dim: '#b9c8de'
  on-secondary-fixed: '#0d1c2d'
  on-secondary-fixed-variant: '#39485a'
  tertiary-fixed: '#62fae3'
  tertiary-fixed-dim: '#3cddc7'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005047'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
  deep-charcoal: '#020617'
  slate-surface: '#1E293B'
  electric-cyan: '#22D3EE'
  terminal-green: '#10B981'
  blueprint-grid: rgba(30, 41, 59, 0.5)
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  metric-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  grid-unit: 8px
---

## Brand & Style

The design system is centered on the "System Architect" aesthetic—a visual manifestation of structural integrity, precision, and high-density information design. It targets a sophisticated technical audience that values efficiency, observability, and rigorous engineering.

The style is a hybrid of **Corporate Modernism** and **Technical Brutalism**. It utilizes heavy whitespace controlled by a strict underlying grid, thin "blueprint" lines, and monospaced accents to evoke the feeling of an integrated development environment (IDE) or a sophisticated cloud console. The emotional response should be one of absolute reliability, transparency, and forward-thinking innovation.

**Key Visual Principles:**
- **High Density:** Information is packed efficiently but remains legible through clear grouping and hierarchical contrast.
- **Precision:** Use of hair-line borders (1px) and rigid alignment to suggest an "engineered" interface.
- **Observability:** Subtle background patterns (dots or grids) that reference architectural drafting paper.
- **Intentionality:** Every element has a functional purpose; decorative flourishes are restricted to technical data visualizations.

## Colors

This design system uses a **Dark Mode** primary configuration to reduce eye strain during deep technical review and to emphasize the "System Architect" vibe.

- **Primary & Accents:** The palette is anchored by `Deep Charcoal` and `Slate` for surfaces. `Electric Blue` and `Cyan` are used sparingly for interactive elements, status indicators, and to highlight key technical achievements.
- **Functionality over Fashion:** `Terminal Green` is reserved for "success" states and active production deployments, mirroring a healthy CLI or dashboard.
- **The Grid:** A subtle `Blueprint Grid` color is used for background patterns and container dividers to maintain the architectural theme without distracting from content.
- **Contrast:** High-contrast text (Near-white) is used for body copy to ensure maximum readability against the deep background.

## Typography

The typography strategy leverages two distinct voices:
1. **Hanken Grotesk (Humanist/Modern):** Used for headlines and primary body copy. It provides a sharp, professional, and contemporary feel that balances the technical nature of the site with approachability.
2. **JetBrains Mono (Technical/Precise):** Used for labels, tags, code snippets, and metadata. It acts as the "voice of the system," indicating raw data, architectural specs, and technical metrics.

**Hierarchy Rules:**
- All labels and technical metadata should be in `JetBrains Mono` and often in uppercase to signify "System Data."
- Headlines use tight letter-spacing to feel more "constructed" and impactful.
- Body copy uses generous line height (1.6) to ensure long-form architectural explanations remain legible at high density.

## Layout & Spacing

The layout is governed by a **12-column Fluid Grid** with a strict 8px baseline rhythm. This ensures that every element—from a button to a complex system diagram—feels mathematically aligned.

- **The Blueprint Grid:** A background dot or line pattern should be visible on the primary background, aligned to the 24px gutter intervals.
- **Sectioning:** Content is divided by thin (1px) borders rather than heavy shadows or large gaps. These lines should extend to the edges of the grid to emphasize the "schematic" feel.
- **Breakpoints:**
  - **Desktop (1280px+):** Full 12-column layout with fixed sidebars for technical navigation.
  - **Tablet (768px - 1279px):** 8-column layout; technical sidebars collapse into "System Drawers."
  - **Mobile (<767px):** 4-column layout; focus on single-column high-density lists. All `headline-xl` elements scale down to `headline-lg-mobile`.

## Elevation & Depth

In a "System Architect" aesthetic, depth is created through **Tonal Layering** and **Thin Outlines** rather than traditional shadows.

- **Surfaces:** Use three levels of slate:
  - `Level 0 (Background)`: Deep Charcoal (#020617).
  - `Level 1 (Cards/Sections)`: Slate Surface (#1E293B) with a 1px border (#334155).
  - `Level 2 (Popovers/Tooltips)`: Slightly lighter slate with an Electric Blue accent border.
- **Borders over Shadows:** Physicality is represented by "ghost borders"—low-opacity 1px lines that define edges. 
- **Backdrop Blurs:** For modals or navigation overlays, use a subtle `blur(8px)` with a semi-transparent slate fill to maintain context of the underlying system architecture.

## Shapes

The shape language is **Soft (0.25rem)**. This provides just enough curvature to feel modern and "software-like" without losing the rigid, architectural precision of the grid.

- **Standard Elements:** Buttons, input fields, and tags use the base `rounded (4px)`.
- **Large Containers:** Project cards or code blocks use `rounded-lg (8px)`.
- **Status Pills:** Small indicators for "Production" or "Beta" use a slightly higher roundedness to distinguish them as status chips, but never full pills.
- **Iconography:** Use sharp, geometric icons with a 1.5pt or 2pt stroke weight to match the thin border language.

## Components

### Buttons
- **Primary:** Solid `Electric Blue` with white text. No gradient. On hover, increase brightness.
- **Secondary:** Transparent background with a 1px `Slate` border. Use `JetBrains Mono` for the label to feel like a "command."
- **Ghost:** No border, text-only. Used for low-priority system actions.

### Technical Chips (Tags)
Small, rectangular tags with a subtle background (`Slate Surface`) and `JetBrains Mono` text. Used for "Languages" (e.g., Python, TypeScript) and "Infrastructure" (e.g., AWS, Docker).

### Architect Cards
Used for projects like "ResolveMeQ." These feature a 1px border, a `label-caps` header identifying the "System Component," and a clean layout for metrics (e.g., "Latency: 35ms").

### Input Fields
Dark backgrounds with a 1px border that turns `Electric Blue` on focus. Use a monospaced font for input text to reinforce the "terminal" feel.

### Status Indicators
Small glowing dots (using a subtle CSS pulse animation) next to technical services to indicate "System Live" or "Production Ready." Use `Terminal Green`.

### The "System Header"
A persistent navigation bar that looks like a status bar, showing the current "Breadcrumb" path (e.g., `ROOT > ARCHITECTURE > RESOLVEMEQ`) in `JetBrains Mono`.