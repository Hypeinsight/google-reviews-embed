# Hype Insight Color Palette & Design System Analysis

**Website:** https://hypeinsight.com/  
**Analysis Date:** October 26, 2025

---

## Executive Summary

Hype Insight uses a **vibrant, modern color scheme** centered around a bright green primary color, complemented by deep navy blues and energetic accent colors. The design system employs CSS custom properties (variables) for maintainability and uses a sophisticated HSL-based color system for variations and opacity.

---

## Primary Color Palette

### 1. **Primary Green** (Brand Color)
- **Main:** `rgb(70, 182, 70)` / `#46B646`
- **HSL:** `hsl(120, 44%, 49%)`
- **Usage:** 161 occurrences - most prominent brand color
- **Application:** CTAs, highlights, brand elements, active states
- **Commentary:** This is a fresh, energetic green that conveys growth and vitality. It's used extensively throughout the site for buttons, highlights, and brand identity.

### 2. **Dark Navy** (Primary Text/Background)
- **Main:** `rgb(2, 32, 46)` / `#02202E`
- **HSL:** `hsl(199, 91%, 9%)`
- **Variations:**
  - `rgb(2, 31, 44)` - slightly lighter variant
  - `rgba(2, 31, 44, 0.7)` - 70% opacity overlay
  - `rgb(5, 32, 44)` - another close variant
- **Usage:** 117+ occurrences
- **Application:** Primary text, dark backgrounds, headers, overlays
- **Commentary:** A very dark, almost black navy that provides excellent contrast. This creates a professional, corporate feel while being slightly warmer than pure black.

### 3. **White** (Background/Text)
- **Main:** `rgb(255, 255, 255)` / `#FFFFFF`
- **Variations:**
  - `rgb(248, 248, 248)` - off-white background
  - `rgb(253, 254, 255)` - subtle blue-tinted white
  - `rgba(255, 255, 255, 0.85)` - 85% opacity
  - `rgba(255, 255, 255, 0.6)` - 60% opacity
  - `rgba(255, 255, 255, 0.42)` - 42% opacity
  - `rgba(255, 255, 255, 0.15)` - 15% opacity
- **Usage:** 259+ occurrences (most used color overall)
- **Application:** Backgrounds, text on dark backgrounds, cards, containers

---

## Secondary/Accent Colors

### 4. **Cyan/Turquoise**
- **Main:** `rgb(0, 169, 186)` / `#00A9BA`
- **Related:** `rgb(57, 163, 209)` / `#39A3D1`
- **Usage:** 33+ occurrences
- **Application:** Secondary CTAs, links, icons, highlights
- **Commentary:** Provides a cool, modern contrast to the green primary color. Creates visual interest and hierarchy.

### 5. **Bright Blue**
- **Main:** `rgb(19, 114, 211)` / `#1372D3`
- **Related:** 
  - `#3569B4` (darker blue)
  - `#0177B5` (medium blue)
  - `#29ACE0` (light cyan blue)
  - `#03A9F4` (Material Design blue)
  - `#3498DB` (flat design blue)
  - `#42B3EA` (sky blue)
- **Usage:** 28+ occurrences
- **Application:** Links, interactive elements, informational highlights
- **Commentary:** Multiple shades of blue are used for different interactive states and informational elements.

### 6. **Yellow/Gold**
- **Main:** `rgb(255, 203, 43)` / `#FFCB2B`
- **Related:** `rgb(255, 219, 86)` (from CSS variables)
- **Usage:** 24+ occurrences
- **Application:** Attention-grabbing elements, warnings, highlights, badges
- **Commentary:** Bright, energetic yellow used sparingly for emphasis and calls-to-action.

---

## Neutral Colors

### Gray Scale
- **Light Gray:** `#EEEEEE`, `#CCCCCC`, `#DDDDDD`
- **Medium Gray:** `#666666`
- **Dark Gray:** `#333333`
- **Black:** `rgb(0, 0, 0)` / `#000000` (34 occurrences)
- **Near-Black:** `rgb(0, 0, 16)` - very dark blue-black

### Transparent/Overlay Colors
- **Black Overlays:**
  - `rgba(0, 0, 0, 0.68)` - 68% dark overlay (54 occurrences)
  - `rgba(0, 0, 0, 0.36)` - 36% medium overlay (54 occurrences)
  - `rgba(0, 0, 0, 0.3)` - 30% overlay
  - `rgba(0, 0, 0, 0.25)` - 25% overlay
  - `rgba(0, 0, 0, 0.2)` - 20% overlay
  - `rgba(0, 0, 0, 0.15)` - 15% overlay
  - `rgba(0, 0, 0, 0.03)` - 3% subtle overlay

---

## Additional Accent Colors

### Supporting Colors (Used Less Frequently)
- **Red/Error:** `#E74C3C` (Material Design red)
- **Burgundy:** `rgb(169, 68, 66)` / `#A94442`
- **Orange:** `rgb(209, 85, 14)` / `#D1550E` (from CSS variables)
- **Mint Green:** `rgb(26, 188, 156)` / `#1ABC9C`
- **Dark Blue-Gray:** `#2C3E50`
- **Light Gray-Blue:** `#ECF0F1`

---

## Design System Architecture

### CSS Custom Properties (Variables)

The site uses a sophisticated **CSS variable system** with the following structure:

#### Theme Color System
```css
--tcb-color-0: rgb(70, 182, 70)     /* Primary Green */
--tcb-color-0-h: 120                 /* Hue */
--tcb-color-0-s: 44%                 /* Saturation */
--tcb-color-0-l: 49%                 /* Lightness */
--tcb-color-0-a: 1                   /* Alpha */

--tcb-color-1: rgba(230, 232, 232, 0.62)  /* Light Gray */
--tcb-color-2: rgb(255, 219, 86)          /* Yellow */
--tcb-color-3: rgb(2, 32, 46)             /* Dark Navy */
--tcb-color-4: rgb(0, 0, 0)               /* Black */
--tcb-color-5: rgb(209, 85, 14)           /* Orange */
```

#### Local Color Variations
The system creates multiple opacity variations of colors:
```css
--tcb-local-color-30800: rgb(59, 136, 253)      /* Base blue */
--tcb-local-color-f2bba: rgba(59, 136, 253, 0.1)   /* 10% opacity */
--tcb-local-color-trewq: rgba(59, 136, 253, 0.3)   /* 30% opacity */
--tcb-local-color-poiuy: rgba(59, 136, 253, 0.6)   /* 60% opacity */
--tcb-local-color-flktr: rgba(59, 136, 253, 0.8)   /* 80% opacity */
```

#### Dynamic HSL System
```css
--background-color: hsla(
  var(--tcb-local-default-master-h),
  var(--tcb-local-default-master-s),
  var(--tcb-local-default-master-l),
  var(--tcb-main-master-a, 1)
)
```

---

## Design Patterns & Commentary

### 1. **Color Hierarchy**
- **Primary Actions:** Bright green (`#46B646`)
- **Secondary Actions:** Cyan/turquoise (`#00A9BA`)
- **Text:** Dark navy (`#02202E`) on light backgrounds
- **Backgrounds:** White, off-white, and dark navy for contrast sections

### 2. **Opacity Strategy**
The design extensively uses **opacity variations** rather than creating separate color values:
- Creates visual depth and layering
- Maintains color consistency across the site
- Allows for flexible overlay effects
- Common opacity values: 85%, 68%, 60%, 42%, 36%, 30%, 25%, 20%, 15%, 10%, 5%, 3%

### 3. **Contrast & Accessibility**
- **High contrast** between dark navy (`#02202E`) and white backgrounds
- Green primary color has sufficient contrast on white backgrounds
- Multiple shades ensure readability across different contexts

### 4. **Modern Web Design Approach**
- Uses **CSS custom properties** for maintainability
- **HSL color space** for easier manipulation (hue, saturation, lightness)
- **Modular color system** with numbered theme colors
- **Local color variations** with unique identifiers for component-specific colors

### 5. **Color Psychology**
- **Green:** Growth, success, vitality, digital marketing expertise
- **Navy Blue:** Trust, professionalism, stability, corporate credibility
- **Cyan/Blue:** Technology, innovation, communication
- **Yellow:** Energy, attention, optimism, highlights
- **White Space:** Clean, modern, spacious, professional

---

## Recommendations for Your App

### Core Palette to Implement
```css
/* Primary Colors */
--primary-green: #46B646;           /* Main brand color */
--primary-navy: #02202E;            /* Dark backgrounds/text */
--primary-white: #FFFFFF;           /* Light backgrounds/text */

/* Secondary Colors */
--secondary-cyan: #00A9BA;          /* Secondary actions */
--secondary-blue: #1372D3;          /* Links and info */
--secondary-yellow: #FFCB2B;        /* Highlights and warnings */

/* Neutral Colors */
--gray-100: #F8F8F8;                /* Subtle backgrounds */
--gray-300: #CCCCCC;                /* Borders */
--gray-600: #666666;                /* Secondary text */
--gray-900: #333333;                /* Primary text alternative */
--black: #000000;                   /* Pure black for text */

/* Overlay Colors */
--overlay-dark-68: rgba(0, 0, 0, 0.68);
--overlay-dark-36: rgba(0, 0, 0, 0.36);
--overlay-light-85: rgba(255, 255, 255, 0.85);
```

### Design System Structure
1. **Use CSS custom properties** for all colors
2. **Define HSL components separately** for easy manipulation
3. **Create opacity variations** for each primary color
4. **Establish clear hierarchy**: Primary (green), Secondary (cyan/blue), Accent (yellow)
5. **Maintain high contrast** between text and backgrounds

### Typography Color Usage
- **Headings:** Dark navy (`#02202E`) or black (`#000000`)
- **Body text:** Dark navy with slight opacity (`rgba(2, 32, 46, 0.9)`)
- **Links:** Bright blue (`#1372D3`) with hover state in cyan (`#00A9BA`)
- **Buttons:** White text on green background for primary CTAs

### Component Patterns
- **Cards:** White background with subtle gray border
- **Buttons:** Green primary, cyan secondary, outlined tertiary
- **Overlays:** Use 68% or 36% black overlay on images
- **Badges/Tags:** Yellow background with dark text
- **Alerts:** Blue for info, green for success, yellow for warning, red for error

---

## Technical Implementation Notes

### For Warp/AI Coding Assistant

**Color System Setup:**
```css
:root {
  /* Primary Brand Colors */
  --color-primary: #46B646;
  --color-primary-h: 120;
  --color-primary-s: 44%;
  --color-primary-l: 49%;
  
  --color-dark: #02202E;
  --color-dark-h: 199;
  --color-dark-s: 91%;
  --color-dark-l: 9%;
  
  /* Secondary Colors */
  --color-secondary: #00A9BA;
  --color-accent: #FFCB2B;
  
  /* Neutral Scale */
  --color-white: #FFFFFF;
  --color-gray-50: #F8F8F8;
  --color-gray-200: #EEEEEE;
  --color-gray-400: #CCCCCC;
  --color-gray-600: #666666;
  --color-gray-900: #333333;
  --color-black: #000000;
}
```

**Opacity Utilities:**
```css
.overlay-dark { background: rgba(0, 0, 0, 0.68); }
.overlay-medium { background: rgba(0, 0, 0, 0.36); }
.overlay-light { background: rgba(255, 255, 255, 0.85); }
```

**Component Examples:**
```css
.btn-primary {
  background: var(--color-primary);
  color: var(--color-white);
}

.btn-secondary {
  background: var(--color-secondary);
  color: var(--color-white);
}

.card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-400);
}

.text-primary { color: var(--color-dark); }
.bg-dark { background: var(--color-dark); }
```

---

## Summary

**Hype Insight's color system is:**
- **Modern and vibrant** with a strong green brand identity
- **Professional** with dark navy and clean whites
- **Systematic** using CSS variables and HSL color space
- **Flexible** with extensive opacity variations
- **Accessible** with high contrast ratios

**Key takeaway:** The design balances energetic, growth-oriented colors (green, yellow) with professional, trustworthy tones (navy, blue) to create a modern digital marketing agency aesthetic that feels both dynamic and credible.

