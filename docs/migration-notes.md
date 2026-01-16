# Good Doc 2025 Design System Migration Notes

## Overview
This document outlines the style-only changes made to implement the 2025 hospital-grade visual system.

## Token Changes

### Colors (CSS Variables)
| Old Token | New Token | Notes |
|-----------|-----------|-------|
| `--primary: 334 98% 25%` | `--primary: var(--gd-primary-600)` | Care Blue (trustworthy) |
| `--accent: 334 98% 25%` | `--accent: var(--gd-accent-600)` | Healing Teal |
| `--background: 0 0% 98%` | `--background: var(--gd-neutral-50)` | Clinical Slate |
| `--foreground: 215 20% 20%` | `--foreground: var(--gd-neutral-900)` | Darker for contrast |

### New Functional Colors
- `--gd-success`, `--gd-warning`, `--gd-error`, `--gd-info` with light/dark variants
- Status badge variants: `success`, `warning`, `error`, `info`, `accent`, `neutral`

### Typography
- Font family: Inter var with system fallbacks
- New semantic sizes: `display`, `h1`, `h2`, `h3`, `body`, `body-strong`, `small`, `label`, `caption`

### Spacing & Radii
- Radius scale: `xs` (6px), `sm` (8px), `md` (12px), `lg` (16px), `xl` (24px), `pill` (9999px)
- New shadow tokens: `shadow-s`, `shadow-m`, `shadow-l`

### Motion
- Easing: `ease-standard`, `ease-decel`, `ease-accel`
- Duration: `duration-fast` (120ms), `duration-base` (180ms), `duration-slow` (240ms)

## Component Updates
All components updated to use semantic tokens. No logic/structure changes.

- **Button**: Added `subtle` variant, improved touch targets (44px min)
- **Badge**: Added status variants (success, warning, error, info)
- **Alert**: Added success, warning, info variants
- **Input/Select**: Height increased to 44px for touch accessibility
- **Tabs**: Improved active state with primary color
- **Table**: Added header styling, improved row hover states
- **Switch/Checkbox**: Larger touch targets, smoother animations
- **Dialog**: Softer overlay, improved spacing
- **Tooltip**: Dark background for better contrast

## Accessibility Improvements
- All interactive elements meet 44x44px touch targets
- Focus states use 2px ring with offset
- Color contrast meets WCAG 2.2 AA
- `prefers-reduced-motion` respected
